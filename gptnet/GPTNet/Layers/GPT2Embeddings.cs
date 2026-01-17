using TorchSharp;
using TorchSharp.Modules;
using static TorchSharp.torch;
using GPTNet.Config;

namespace GPTNet.Layers;

/// <summary>
/// GPT-2 Embedding Layer combining token and learned position embeddings.
/// Input: [Batch, SeqLen] token IDs
/// Output: [Batch, SeqLen, EmbDim] embedded representations
/// </summary>
public class GPT2Embeddings : nn.Module<Tensor, Tensor>
{
    public readonly Embedding wte; // Token Embedding (public for weight loading)
    public readonly Embedding wpe; // Position Embedding (public for weight loading)
    private readonly Dropout drop;

    public GPT2Embeddings(GPTConfig config) : base("GPT2Embeddings")
    {
        // Token embedding: maps vocab indices to vectors
        wte = nn.Embedding(config.VocabSize, config.EmbDim);
        
        // Position embedding: learned absolute positions (0 to ContextLength-1)
        wpe = nn.Embedding(config.ContextLength, config.EmbDim);
        
        // Dropout for regularization
        drop = nn.Dropout(config.Dropout);
        
        RegisterComponents();
    }

    /// <summary>
    /// Forward pass: combines token and position embeddings.
    /// </summary>
    /// <param name="inputIds">Token IDs of shape [Batch, SeqLen]</param>
    /// <returns>Embeddings of shape [Batch, SeqLen, EmbDim]</returns>
    public override Tensor forward(Tensor inputIds)
    {
        // Get sequence length from input
        var t = inputIds.shape[1];
        
        // Generate position IDs [0, 1, 2, ..., t-1] on same device as input
        var pos = arange(0, t, dtype: ScalarType.Int64, device: inputIds.device);
        
        // Token embeddings: [Batch, SeqLen] -> [Batch, SeqLen, EmbDim]
        var tokEmb = wte.forward(inputIds);
        
        // Position embeddings: [SeqLen] -> [SeqLen, EmbDim] (broadcasts across batch)
        var posEmb = wpe.forward(pos);
        
        // Combine and apply dropout: x = dropout(wte + wpe)
        return drop.forward(tokEmb + posEmb);
    }

    /// <summary>
    /// Gets the token embedding weight for weight tying with LM head.
    /// Shape: [VocabSize, EmbDim]
    /// </summary>
    public Tensor GetTokenEmbeddingWeight() => wte.weight!;
}
