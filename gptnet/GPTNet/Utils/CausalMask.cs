using TorchSharp;
using static TorchSharp.torch;

namespace GPTNet.Utils;

/// <summary>
/// Utility for creating causal (autoregressive) attention masks.
/// Prevents the model from attending to future tokens.
/// </summary>
public static class CausalMask
{
    /// <summary>
    /// Creates a causal mask for attention scores.
    /// Returns a lower triangular matrix where mask[i,j] = 1 for j &lt;= i, else 0.
    /// </summary>
    /// <param name="seqLen">Sequence length</param>
    /// <param name="device">Target device (CPU/CUDA)</param>
    /// <returns>Mask tensor of shape [1, 1, seqLen, seqLen] for broadcasting</returns>
    public static Tensor Create(long seqLen, Device device)
    {
        // Lower triangular matrix: 1s where we CAN attend, 0s where we CANNOT
        var mask = tril(ones(seqLen, seqLen, device: device));
        
        // Reshape to [1, 1, seqLen, seqLen] for broadcasting with [batch, heads, seqLen, seqLen]
        return mask.view(1, 1, seqLen, seqLen);
    }

    /// <summary>
    /// Applies causal mask to attention scores.
    /// Sets future positions to -infinity so softmax outputs zero.
    /// </summary>
    /// <param name="scores">Attention scores of shape [batch, heads, seqLen, seqLen]</param>
    /// <param name="mask">Causal mask from Create()</param>
    /// <returns>Masked scores ready for softmax</returns>
    public static Tensor Apply(Tensor scores, Tensor mask)
    {
        // Where mask == 0 (future positions), replace with -infinity
        return scores.masked_fill(mask == 0, float.NegativeInfinity);
    }
}
