namespace GPTNet.Config;

/// <summary>
/// Configuration record for GPT-2 model hyperparameters.
/// </summary>
public record GPTConfig(
    int VocabSize = 50257,        // Standard GPT-2 vocabulary size
    int ContextLength = 1024,     // Maximum sequence length
    int EmbDim = 768,             // Embedding dimension (d_model)
    int NHeads = 12,              // Number of attention heads per block
    int NLayers = 12,             // Total transformer blocks
    double Dropout = 0.1          // Dropout probability
);
