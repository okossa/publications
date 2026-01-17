using TorchSharp;
using TorchSharp.Modules;
using static TorchSharp.torch;
using GPTNet.Config;

namespace GPTNet.Layers;

/// <summary>
/// GPT-2 Transformer Block with Pre-LayerNorm pattern.
/// Combines Attention and MLP with residual connections.
/// </summary>
public class TransformerBlock : nn.Module<Tensor, Tensor>
{
    public readonly LayerNorm ln1;              // LayerNorm before attention (public for weight loading)
    public readonly LayerNorm ln2;              // LayerNorm before MLP (public for weight loading)
    public readonly CausalSelfAttention attn;   // Multi-head causal self-attention (public for weight loading)
    public readonly GPT2MLP mlp;                // Feed-forward network (public for weight loading)

    private const double LayerNormEps = 1e-5;

    public TransformerBlock(GPTConfig config) : base("TransformerBlock")
    {
        // LayerNorm layers with epsilon = 1e-5
        ln1 = nn.LayerNorm(config.EmbDim, eps: LayerNormEps);
        ln2 = nn.LayerNorm(config.EmbDim, eps: LayerNormEps);
        
        // Attention sub-module (from Issue #3)
        attn = new CausalSelfAttention(config);
        
        // MLP sub-module (from Issue #4)
        mlp = new GPT2MLP(config);

        RegisterComponents();
    }

    /// <summary>
    /// Forward pass with Pre-LN pattern and residual connections.
    /// </summary>
    /// <param name="x">Input tensor of shape [Batch, SeqLen, EmbDim]</param>
    /// <returns>Output tensor of shape [Batch, SeqLen, EmbDim]</returns>
    public override Tensor forward(Tensor x)
    {
        // Pre-LN + Attention with residual connection
        // x = x + attn(ln1(x))
        x = x + attn.forward(ln1.forward(x));
        
        // Pre-LN + MLP with residual connection
        // x = x + mlp(ln2(x))
        x = x + mlp.forward(ln2.forward(x));
        
        return x;
    }

    /// <summary>
    /// Gets the LayerNorm epsilon value for verification.
    /// </summary>
    public double GetLayerNormEps() => LayerNormEps;
}
