using TorchSharp;
using TorchSharp.Modules;
using static TorchSharp.torch;
using GPTNet.Config;
using GPTNet.Layers;

namespace GPTNet.Model;

/// <summary>
/// Complete GPT-2 Language Model.
/// Stacks embeddings, 12 transformer blocks, final LayerNorm, and LM head.
/// Uses weight tying: lm_head shares weights with token embeddings.
/// </summary>
public class GPT2Model : nn.Module<Tensor, Tensor>
{
    public readonly GPT2Embeddings embeddings;  // (public for weight loading)
    public readonly ModuleList<TransformerBlock> blocks;  // (public for weight loading)
    public readonly LayerNorm ln_f;      // Final LayerNorm (public for weight loading)
    // Note: lm_head uses tied weights from embeddings (no separate Linear layer)

    private readonly GPTConfig _config;
    private const double LayerNormEps = 1e-5;

    public GPT2Model(GPTConfig config) : base("GPT2Model")
    {
        _config = config;

        // Token + Position embeddings
        embeddings = new GPT2Embeddings(config);

        // Stack of 12 transformer blocks
        var blockList = new List<TransformerBlock>();
        for (int i = 0; i < config.NLayers; i++)
        {
            blockList.Add(new TransformerBlock(config));
        }
        blocks = new ModuleList<TransformerBlock>(blockList.ToArray());

        // Final LayerNorm
        ln_f = nn.LayerNorm(config.EmbDim, eps: LayerNormEps);

        // Note: lm_head uses weight tying with token embeddings
        // No separate Linear layer needed - we use embeddings.GetTokenEmbeddingWeight().T

        RegisterComponents();
    }

    /// <summary>
    /// Forward pass: embeddings → 12 blocks → final LN → logits.
    /// </summary>
    /// <param name="inputIds">Token IDs of shape [Batch, SeqLen]</param>
    /// <returns>Logits of shape [Batch, SeqLen, VocabSize]</returns>
    public override Tensor forward(Tensor inputIds)
    {
        // Embed tokens: [B, T] → [B, T, 768]
        var x = embeddings.forward(inputIds);

        // Pass through all transformer blocks
        foreach (var block in blocks)
        {
            x = block.forward(x);
        }

        // Final LayerNorm
        x = ln_f.forward(x);

        // Project to vocabulary logits using tied weights: [B, T, 768] @ [768, 50257] → [B, T, 50257]
        // Weight tying: use transpose of token embedding weight
        var logits = torch.matmul(x, embeddings.GetTokenEmbeddingWeight().T);

        return logits;
    }

    /// <summary>
    /// Gets the number of transformer blocks.
    /// </summary>
    public int GetNumBlocks() => _config.NLayers;

    /// <summary>
    /// Counts total trainable parameters in the model.
    /// </summary>
    public long CountParameters()
    {
        long total = 0;
        foreach (var param in parameters())
        {
            total += param.numel();
        }
        return total;
    }

    /// <summary>
    /// Gets model configuration.
    /// </summary>
    public GPTConfig Config => _config;
}
