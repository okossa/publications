using TorchSharp;
using TorchSharp.Modules;
using static TorchSharp.torch;
using GPTNet.Config;

namespace GPTNet.Layers;

/// <summary>
/// GPT-2 Feed-Forward Network (MLP).
/// Expands 768 → 3072, applies GELU, then compresses 3072 → 768.
/// </summary>
public class GPT2MLP : nn.Module<Tensor, Tensor>
{
    public readonly Linear c_fc;    // Expansion: 768 → 3072 (public for weight loading)
    public readonly Linear c_proj;  // Compression: 3072 → 768 (public for weight loading)
    private readonly Dropout dropout;

    // Constant for GELU Tanh approximation: sqrt(2/π)
    private static readonly double Sqrt2OverPi = Math.Sqrt(2.0 / Math.PI);

    public GPT2MLP(GPTConfig config) : base("GPT2MLP")
    {
        int hiddenDim = 4 * config.EmbDim;  // 4 * 768 = 3072

        // Expansion layer
        c_fc = nn.Linear(config.EmbDim, hiddenDim);
        
        // Compression layer
        c_proj = nn.Linear(hiddenDim, config.EmbDim);
        
        // Dropout
        dropout = nn.Dropout(config.Dropout);

        RegisterComponents();
    }

    /// <summary>
    /// Forward pass: expand → GELU → compress → dropout.
    /// </summary>
    /// <param name="x">Input tensor of shape [Batch, SeqLen, EmbDim]</param>
    /// <returns>Output tensor of shape [Batch, SeqLen, EmbDim]</returns>
    public override Tensor forward(Tensor x)
    {
        // Expand: [B, T, 768] → [B, T, 3072]
        x = c_fc.forward(x);
        
        // GELU activation with Tanh approximation
        x = Gelu(x);
        
        // Compress: [B, T, 3072] → [B, T, 768]
        x = c_proj.forward(x);
        
        // Dropout
        x = dropout.forward(x);
        
        return x;
    }

    /// <summary>
    /// GELU activation with Tanh approximation.
    /// Formula: 0.5 * x * (1 + tanh(sqrt(2/π) * (x + 0.044715 * x³)))
    /// </summary>
    private Tensor Gelu(Tensor x)
    {
        // Inner term: sqrt(2/π) * (x + 0.044715 * x³)
        var inner = Sqrt2OverPi * (x + 0.044715 * pow(x, 3));
        
        // Full formula: 0.5 * x * (1 + tanh(inner))
        return 0.5 * x * (1.0 + tanh(inner));
    }

    /// <summary>
    /// Gets the c_fc weight tensor for verification.
    /// </summary>
    public Tensor GetFcWeight() => c_fc.weight!;
    
    /// <summary>
    /// Gets the c_proj weight tensor for verification.
    /// </summary>
    public Tensor GetProjWeight() => c_proj.weight!;
}
