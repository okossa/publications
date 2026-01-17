using TorchSharp;
using TorchSharp.PyBridge;
using static TorchSharp.torch;
using GPTNet.Model;

namespace GPTNet.Utils;

/// <summary>
/// Loads pre-trained GPT-2 weights from Hugging Face safetensors format.
/// Handles key mapping from HF naming convention to our C# model structure.
/// </summary>
public static class WeightLoader
{
    /// <summary>
    /// Loads weights from a safetensors file into the GPT2Model.
    /// </summary>
    /// <param name="model">The GPT2Model to load weights into</param>
    /// <param name="path">Path to the .safetensors file</param>
    /// <param name="device">Target device for the weights</param>
    /// <param name="strict">If true, throws on missing/unexpected keys</param>
    public static void LoadWeights(GPT2Model model, string path, Device device, bool strict = false)
    {
        Console.WriteLine($"Loading weights from: {path}");
        
        // Load the safetensors file
        var weights = model.load_safetensors(path, strict: strict, skip: new[] { 
            // Skip the precomputed causal masks - we compute them dynamically
            "h.0.attn.bias", "h.1.attn.bias", "h.2.attn.bias", "h.3.attn.bias",
            "h.4.attn.bias", "h.5.attn.bias", "h.6.attn.bias", "h.7.attn.bias",
            "h.8.attn.bias", "h.9.attn.bias", "h.10.attn.bias", "h.11.attn.bias"
        });
        
        Console.WriteLine($"✓ Weights loaded successfully!");
    }

    /// <summary>
    /// Loads weights with manual key mapping for when automatic loading fails.
    /// Maps Hugging Face GPT-2 keys to our model structure.
    /// </summary>
    public static void LoadWeightsManual(GPT2Model model, string path, Device device)
    {
        Console.WriteLine($"Loading weights from: {path}");
        
        // Read the safetensors file manually
        var tensors = SafeTensors.LoadTensors(path, device);
        
        int loaded = 0;
        int skipped = 0;

        foreach (var (key, tensor) in tensors)
        {
            try
            {
                // Skip the precomputed causal bias masks (e.g., "h.0.attn.bias", NOT "h.0.attn.c_attn.bias")
                // The causal mask keys have exactly 4 parts: h, {idx}, attn, bias
                var parts = key.Split('.');
                if (parts.Length == 4 && parts[0] == "h" && parts[2] == "attn" && parts[3] == "bias")
                {
                    skipped++;
                    continue;
                }

                // Map HF key to our model parameter
                var param = MapKeyToParameter(model, key);
                
                if (param is not null)
                {
                    // HF GPT-2 uses Conv1D which stores weights transposed
                    // Our Linear layers expect [out_features, in_features]
                    // HF stores [in_features, out_features] for some weights
                    var weightToLoad = ShouldTranspose(key) ? tensor.T.contiguous() : tensor;
                    
                    using (no_grad())
                    {
                        param.copy_(weightToLoad);
                    }
                    loaded++;
                }
                else
                {
                    Console.WriteLine($"  ⚠ Unmapped key: {key}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  ✗ Error loading {key}: {ex.Message}");
            }
        }
        
        Console.WriteLine($"✓ Loaded {loaded} tensors, skipped {skipped} (causal masks)");
    }

    /// <summary>
    /// Maps a Hugging Face weight key to the corresponding parameter in our model.
    /// </summary>
    private static Tensor? MapKeyToParameter(GPT2Model model, string key)
    {
        // Embeddings
        if (key == "wte.weight") return model.embeddings.wte.weight;
        if (key == "wpe.weight") return model.embeddings.wpe.weight;
        
        // Final LayerNorm
        if (key == "ln_f.weight") return model.ln_f.weight;
        if (key == "ln_f.bias") return model.ln_f.bias;
        
        // Transformer blocks: h.{i}.{component}
        if (key.StartsWith("h."))
        {
            var parts = key.Split('.');
            if (parts.Length >= 3 && int.TryParse(parts[1], out int blockIdx))
            {
                var block = model.blocks[blockIdx];
                var remainder = string.Join(".", parts.Skip(2));
                
                return remainder switch
                {
                    // LayerNorms
                    "ln_1.weight" => block.ln1.weight,
                    "ln_1.bias" => block.ln1.bias,
                    "ln_2.weight" => block.ln2.weight,
                    "ln_2.bias" => block.ln2.bias,
                    
                    // Attention
                    "attn.c_attn.weight" => block.attn.c_attn.weight,
                    "attn.c_attn.bias" => block.attn.c_attn.bias,
                    "attn.c_proj.weight" => block.attn.c_proj.weight,
                    "attn.c_proj.bias" => block.attn.c_proj.bias,
                    
                    // MLP
                    "mlp.c_fc.weight" => block.mlp.c_fc.weight,
                    "mlp.c_fc.bias" => block.mlp.c_fc.bias,
                    "mlp.c_proj.weight" => block.mlp.c_proj.weight,
                    "mlp.c_proj.bias" => block.mlp.c_proj.bias,
                    
                    _ => null
                };
            }
        }
        
        return null;
    }

    /// <summary>
    /// Determines if a weight tensor needs to be transposed.
    /// HF GPT-2 uses Conv1D which stores linear weights as [in, out] instead of [out, in].
    /// </summary>
    private static bool ShouldTranspose(string key)
    {
        // Only weights need transposition (not biases, not embeddings, not LayerNorm)
        if (!key.EndsWith(".weight")) return false;
        if (key.Contains("ln_")) return false;      // LayerNorm weights don't need transpose
        if (key == "ln_f.weight") return false;     // Final LayerNorm
        if (key == "wte.weight") return false;      // Embedding weights
        if (key == "wpe.weight") return false;      // Position embedding weights
        
        // All Linear layer weights in GPT-2 need transposition
        return true;
    }
}

/// <summary>
/// Helper class to read safetensors files.
/// </summary>
public static class SafeTensors
{
    /// <summary>
    /// Loads all tensors from a safetensors file.
    /// </summary>
    public static Dictionary<string, Tensor> LoadTensors(string path, Device device)
    {
        var result = new Dictionary<string, Tensor>();
        
        // Use TorchSharp.PyBridge to load
        using var stream = File.OpenRead(path);
        
        // Read header length (8 bytes, little endian)
        var headerLenBytes = new byte[8];
        stream.Read(headerLenBytes, 0, 8);
        var headerLen = BitConverter.ToInt64(headerLenBytes, 0);
        
        // Read header JSON
        var headerBytes = new byte[headerLen];
        stream.Read(headerBytes, 0, (int)headerLen);
        var headerJson = System.Text.Encoding.UTF8.GetString(headerBytes);
        
        // Parse header to get tensor metadata
        var metadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, TensorMetadata>>(headerJson);
        
        if (metadata is null) return result;
        
        // Data starts after header
        var dataStart = 8 + headerLen;
        
        foreach (var (name, meta) in metadata)
        {
            if (name == "__metadata__") continue;
            
            var dtype = ParseDtype(meta.dtype);
            var shape = meta.shape.Select(s => (long)s).ToArray();
            var numElements = shape.Aggregate(1L, (a, b) => a * b);
            var numBytes = meta.data_offsets[1] - meta.data_offsets[0];
            
            // Read tensor data
            stream.Position = dataStart + meta.data_offsets[0];
            var tensorBytes = new byte[numBytes];
            stream.Read(tensorBytes, 0, (int)numBytes);
            
            // Create tensor
            var tensor = CreateTensorFromBytes(tensorBytes, shape, dtype, device);
            result[name] = tensor;
        }
        
        return result;
    }
    
    private static ScalarType ParseDtype(string dtype)
    {
        return dtype switch
        {
            "F32" => ScalarType.Float32,
            "F16" => ScalarType.Float16,
            "BF16" => ScalarType.BFloat16,
            "I64" => ScalarType.Int64,
            "I32" => ScalarType.Int32,
            _ => throw new NotSupportedException($"Unsupported dtype: {dtype}")
        };
    }
    
    private static Tensor CreateTensorFromBytes(byte[] bytes, long[] shape, ScalarType dtype, Device device)
    {
        if (dtype == ScalarType.Float32)
        {
            var floats = new float[bytes.Length / 4];
            Buffer.BlockCopy(bytes, 0, floats, 0, bytes.Length);
            return tensor(floats, shape, dtype, device);
        }
        else if (dtype == ScalarType.Float16)
        {
            // Load as bytes, convert to float32
            var tensor16 = torch.zeros(shape, ScalarType.Float16, device);
            // For Float16, we need special handling
            var floats = new float[bytes.Length / 2];
            for (int i = 0; i < floats.Length; i++)
            {
                floats[i] = (float)BitConverter.ToHalf(bytes, i * 2);
            }
            return tensor(floats, shape, ScalarType.Float32, device);
        }
        
        throw new NotSupportedException($"Dtype {dtype} not fully supported");
    }
    
    private class TensorMetadata
    {
        public string dtype { get; set; } = "";
        public int[] shape { get; set; } = Array.Empty<int>();
        public long[] data_offsets { get; set; } = Array.Empty<long>();
    }
}
