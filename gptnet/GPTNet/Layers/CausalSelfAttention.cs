using TorchSharp;
using TorchSharp.Modules;
using static TorchSharp.torch;
using GPTNet.Config;
using GPTNet.Utils;

namespace GPTNet.Layers;

/// <summary>
/// Multi-Head Causal Self-Attention for GPT-2.
/// Splits 768-dim input into 12 heads of 64 dims each.
/// </summary>
public class CausalSelfAttention : nn.Module<Tensor, Tensor>
{
    public readonly Linear c_attn;  // Combined Q, K, V projection [768 → 2304] (public for weight loading)
    public readonly Linear c_proj;  // Output projection [768 → 768] (public for weight loading)
    private readonly Dropout attn_dropout;
    private readonly Dropout resid_dropout;
    
    private readonly int nHeads;
    private readonly int headDim;

    public CausalSelfAttention(GPTConfig config) : base("CausalSelfAttention")
    {
        nHeads = config.NHeads;
        headDim = config.EmbDim / config.NHeads;  // 768 / 12 = 64

        // Combined projection for Q, K, V (3 * 768 = 2304)
        c_attn = nn.Linear(config.EmbDim, 3 * config.EmbDim);
        
        // Output projection
        c_proj = nn.Linear(config.EmbDim, config.EmbDim);
        
        // Dropout layers
        attn_dropout = nn.Dropout(config.Dropout);
        resid_dropout = nn.Dropout(config.Dropout);

        RegisterComponents();
    }

    /// <summary>
    /// Forward pass for multi-head causal self-attention.
    /// </summary>
    /// <param name="x">Input tensor of shape [Batch, SeqLen, EmbDim]</param>
    /// <returns>Output tensor of shape [Batch, SeqLen, EmbDim]</returns>
    public override Tensor forward(Tensor x)
    {
        var B = x.shape[0];  // Batch size
        var T = x.shape[1];  // Sequence length
        var C = x.shape[2];  // Embedding dimension (768)

        // Project to Q, K, V combined: [B, T, 768] → [B, T, 2304]
        var qkv = c_attn.forward(x);
        
        // Split into Q, K, V: each [B, T, 768]
        var qkvSplit = qkv.split(C, dim: 2);
        var q = qkvSplit[0];
        var k = qkvSplit[1];
        var v = qkvSplit[2];

        // Reshape to multi-head format: [B, T, 768] → [B, T, 12, 64] → [B, 12, T, 64]
        q = q.view(B, T, nHeads, headDim).transpose(1, 2);
        k = k.view(B, T, nHeads, headDim).transpose(1, 2);
        v = v.view(B, T, nHeads, headDim).transpose(1, 2);

        // Compute scaled dot-product attention
        // scores = (Q @ K^T) / sqrt(d_k)
        // Shape: [B, 12, T, 64] @ [B, 12, 64, T] → [B, 12, T, T]
        var scale = Math.Sqrt(headDim);
        var scores = torch.matmul(q, k.transpose(-2, -1)) / scale;

        // Apply causal mask (from Issue #2)
        var mask = CausalMask.Create(T, x.device);
        scores = CausalMask.Apply(scores, mask);

        // Softmax over last dimension (keys)
        var attnWeights = nn.functional.softmax(scores, dim: -1);
        attnWeights = attn_dropout.forward(attnWeights);

        // Apply attention to values
        // [B, 12, T, T] @ [B, 12, T, 64] → [B, 12, T, 64]
        var y = torch.matmul(attnWeights, v);

        // Concatenate heads: [B, 12, T, 64] → [B, T, 12, 64] → [B, T, 768]
        y = y.transpose(1, 2).contiguous().view(B, T, C);

        // Output projection
        y = c_proj.forward(y);
        y = resid_dropout.forward(y);

        return y;
    }

    /// <summary>
    /// Gets the c_attn weight tensor for verification.
    /// </summary>
    public Tensor GetAttnWeight() => c_attn.weight!;
}
