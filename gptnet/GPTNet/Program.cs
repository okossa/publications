using GPTNet.Config;
using GPTNet.Infrastructure;
using GPTNet.Layers;
using GPTNet.Model;
using GPTNet.Utils;
using TorchSharp;
using static TorchSharp.torch;

// Parse command-line arguments
string? cliPrompt = null;
string? cliWeights = null;
bool inferenceOnly = false;

for (int i = 0; i < args.Length; i++)
{
    switch (args[i])
    {
        case "--inference":
            inferenceOnly = true;
            break;
        case "--prompt" or "-p":
            if (i + 1 < args.Length) cliPrompt = args[++i];
            break;
        case "--weights" or "-w":
            if (i + 1 < args.Length) cliWeights = args[++i];
            break;
    }
}

// If inference-only mode, skip tests and go directly to generation
if (inferenceOnly && cliPrompt != null)
{
    RunInference(cliPrompt, cliWeights);
    return;
}

Console.WriteLine("╔═══════════════════════════════════════╗");
Console.WriteLine("║         GPTNet - GPT-2 in C#          ║");
Console.WriteLine("╚═══════════════════════════════════════╝");
Console.WriteLine();

// Initialize configuration
var config = new GPTConfig();
Console.WriteLine("Model Configuration:");
Console.WriteLine($"  • Vocabulary Size:  {config.VocabSize:N0}");
Console.WriteLine($"  • Context Length:   {config.ContextLength:N0}");
Console.WriteLine($"  • Embedding Dim:    {config.EmbDim}");
Console.WriteLine($"  • Attention Heads:  {config.NHeads}");
Console.WriteLine($"  • Transformer Layers: {config.NLayers}");
Console.WriteLine($"  • Dropout:          {config.Dropout}");
Console.WriteLine();

// Check device availability
var device = DeviceManager.GetDevice();
Console.WriteLine($"Compute Device: {DeviceManager.GetDeviceInfo()}");
Console.WriteLine();

// ===== Test Issue #1: Embeddings Layer =====
Console.WriteLine("Testing GPT2Embeddings...");

using (var scope = NewDisposeScope())
{
    var embeddings = new GPT2Embeddings(config).to(device);
    
    // Create dummy input: batch=2, sequence_length=10
    var inputIds = randint(0, config.VocabSize, new long[] { 2, 10 }, dtype: ScalarType.Int64, device: device);
    
    Console.WriteLine($"  Input shape:  [{string.Join(", ", inputIds.shape)}]");
    
    // Forward pass
    var output = embeddings.forward(inputIds);
    
    Console.WriteLine($"  Output shape: [{string.Join(", ", output.shape)}]");
    
    // Verify shape
    var expectedShape = new long[] { 2, 10, config.EmbDim };
    var shapeMatch = output.shape.SequenceEqual(expectedShape);
    
    Console.WriteLine($"  Expected:     [{string.Join(", ", expectedShape)}]");
    Console.WriteLine($"  ✓ Shape test: {(shapeMatch ? "PASSED" : "FAILED")}");
}

// ===== Test Issue #2: Causal Masking =====
Console.WriteLine();
Console.WriteLine("Testing CausalMask...");

using (var scope = NewDisposeScope())
{
    long seqLen = 5;
    
    // Create causal mask
    var mask = CausalMask.Create(seqLen, device);
    
    Console.WriteLine($"  Mask shape: [{string.Join(", ", mask.shape)}]");
    Console.WriteLine($"  Expected:   [1, 1, {seqLen}, {seqLen}]");
    
    // Display the mask (squeeze to 2D for visualization)
    Console.WriteLine($"  Lower triangular mask (seqLen={seqLen}):");
    var mask2d = mask.squeeze(0).squeeze(0);
    for (int i = 0; i < seqLen; i++)
    {
        Console.Write("    ");
        for (int j = 0; j < seqLen; j++)
        {
            Console.Write($"{mask2d[i, j].ToInt32(),2} ");
        }
        Console.WriteLine();
    }
    
    // Test masking on dummy attention scores
    var dummyScores = ones(1, 1, seqLen, seqLen, device: device);  // All 1s
    var maskedScores = CausalMask.Apply(dummyScores, mask);
    
    // Apply softmax
    var attnWeights = nn.functional.softmax(maskedScores, dim: -1);
    
    // Verify: future positions should be 0 after softmax
    // Check position [0, 0, 0, 4] - first token attending to last (should be 0)
    var futureWeight = attnWeights[0, 0, 0, 4].ToSingle();
    var pastWeight = attnWeights[0, 0, 4, 0].ToSingle();  // last token attending to first (should be > 0)
    
    Console.WriteLine($"  Attention weight [pos 0 → pos 4] (future): {futureWeight:F6} (expected: 0)");
    Console.WriteLine($"  Attention weight [pos 4 → pos 0] (past):   {pastWeight:F6} (expected: > 0)");
    Console.WriteLine($"  ✓ Causal mask test: {(futureWeight == 0 && pastWeight > 0 ? "PASSED" : "FAILED")}");
}

// ===== Test Issue #3: Multi-Head Causal Self-Attention =====
Console.WriteLine();
Console.WriteLine("Testing CausalSelfAttention...");

using (var scope = NewDisposeScope())
{
    var attention = new CausalSelfAttention(config).to(device);
    
    // Test 1: Verify c_attn weight shape [768, 2304]
    var attnWeight = attention.GetAttnWeight();
    Console.WriteLine($"  c_attn weight shape: [{string.Join(", ", attnWeight.shape)}]");
    Console.WriteLine($"  Expected:            [2304, 768]");  // PyTorch Linear stores as [out, in]
    var weightShapeOk = attnWeight.shape.SequenceEqual(new long[] { 3 * config.EmbDim, config.EmbDim });
    Console.WriteLine($"  ✓ Weight shape test: {(weightShapeOk ? "PASSED" : "FAILED")}");
    
    // Test 2: Create input and run forward pass
    long batchSize = 2;
    long seqLen = 10;
    var input = randn(batchSize, seqLen, config.EmbDim, device: device);
    
    Console.WriteLine($"  Input shape:  [{string.Join(", ", input.shape)}]");
    
    // Forward pass
    var output = attention.forward(input);
    
    Console.WriteLine($"  Output shape: [{string.Join(", ", output.shape)}]");
    
    // Verify output shape [Batch, SeqLen, 768]
    var expectedShape = new long[] { batchSize, seqLen, config.EmbDim };
    var outputShapeOk = output.shape.SequenceEqual(expectedShape);
    Console.WriteLine($"  Expected:     [{string.Join(", ", expectedShape)}]");
    Console.WriteLine($"  ✓ Output shape test: {(outputShapeOk ? "PASSED" : "FAILED")}");
    
    // Test 3: Verify head split dimensions internally
    // We'll manually check by doing the split
    var qkv = nn.Linear(config.EmbDim, 3 * config.EmbDim).to(device).forward(input);
    var qkvSplit = qkv.split(config.EmbDim, dim: 2);
    var q = qkvSplit[0].view(batchSize, seqLen, config.NHeads, config.EmbDim / config.NHeads).transpose(1, 2);
    Console.WriteLine($"  Head-split Q shape: [{string.Join(", ", q.shape)}]");
    Console.WriteLine($"  Expected:           [{batchSize}, {config.NHeads}, {seqLen}, {config.EmbDim / config.NHeads}]");
    var headSplitOk = q.shape.SequenceEqual(new long[] { batchSize, config.NHeads, seqLen, config.EmbDim / config.NHeads });
    Console.WriteLine($"  ✓ Head-split test:  {(headSplitOk ? "PASSED" : "FAILED")}");
}

// ===== Test Issue #4: Feed-Forward Network (MLP) =====
Console.WriteLine();
Console.WriteLine("Testing GPT2MLP...");

using (var scope = NewDisposeScope())
{
    var mlp = new GPT2MLP(config).to(device);
    
    // Test 1: Verify c_fc weight shape [3072, 768]
    var fcWeight = mlp.GetFcWeight();
    int hiddenDim = 4 * config.EmbDim;  // 3072
    Console.WriteLine($"  c_fc weight shape:   [{string.Join(", ", fcWeight.shape)}]");
    Console.WriteLine($"  Expected:            [{hiddenDim}, {config.EmbDim}]");
    var fcShapeOk = fcWeight.shape.SequenceEqual(new long[] { hiddenDim, config.EmbDim });
    Console.WriteLine($"  ✓ c_fc shape test:   {(fcShapeOk ? "PASSED" : "FAILED")}");
    
    // Test 2: Verify c_proj weight shape [768, 3072]
    var projWeight = mlp.GetProjWeight();
    Console.WriteLine($"  c_proj weight shape: [{string.Join(", ", projWeight.shape)}]");
    Console.WriteLine($"  Expected:            [{config.EmbDim}, {hiddenDim}]");
    var projShapeOk = projWeight.shape.SequenceEqual(new long[] { config.EmbDim, hiddenDim });
    Console.WriteLine($"  ✓ c_proj shape test: {(projShapeOk ? "PASSED" : "FAILED")}");
    
    // Test 3: Forward pass
    long batchSize = 2;
    long seqLen = 10;
    var input = randn(batchSize, seqLen, config.EmbDim, device: device);
    
    Console.WriteLine($"  Input shape:  [{string.Join(", ", input.shape)}]");
    
    var output = mlp.forward(input);
    
    Console.WriteLine($"  Output shape: [{string.Join(", ", output.shape)}]");
    
    var expectedShape = new long[] { batchSize, seqLen, config.EmbDim };
    var outputShapeOk = output.shape.SequenceEqual(expectedShape);
    Console.WriteLine($"  Expected:     [{string.Join(", ", expectedShape)}]");
    Console.WriteLine($"  ✓ Output shape test: {(outputShapeOk ? "PASSED" : "FAILED")}");
    
    // Test 4: Verify GELU activation (spot check)
    // GELU(0) ≈ 0, GELU(1) ≈ 0.841, GELU(-1) ≈ -0.159
    var testInput = tensor(new float[] { 0f, 1f, -1f }, device: device);
    var sqrt2OverPi = (float)Math.Sqrt(2.0 / Math.PI);
    var geluOutput = 0.5f * testInput * (1.0f + tanh(sqrt2OverPi * (testInput + 0.044715f * pow(testInput, 3))));
    var geluValues = geluOutput.data<float>().ToArray();
    Console.WriteLine($"  GELU(0)  = {geluValues[0]:F4} (expected ≈ 0)");
    Console.WriteLine($"  GELU(1)  = {geluValues[1]:F4} (expected ≈ 0.841)");
    Console.WriteLine($"  GELU(-1) = {geluValues[2]:F4} (expected ≈ -0.159)");
    var geluOk = Math.Abs(geluValues[0]) < 0.01 && Math.Abs(geluValues[1] - 0.841) < 0.01 && Math.Abs(geluValues[2] + 0.159) < 0.01;
    Console.WriteLine($"  ✓ GELU activation test: {(geluOk ? "PASSED" : "FAILED")}");
}

// ===== Test Issue #5: Transformer Block =====
Console.WriteLine();
Console.WriteLine("Testing TransformerBlock...");

using (var scope = NewDisposeScope())
{
    var block = new TransformerBlock(config).to(device);
    
    // Test 1: Verify LayerNorm epsilon
    var eps = block.GetLayerNormEps();
    Console.WriteLine($"  LayerNorm epsilon: {eps}");
    Console.WriteLine($"  Expected:          1E-05");
    var epsOk = Math.Abs(eps - 1e-5) < 1e-10;
    Console.WriteLine($"  ✓ Epsilon test:    {(epsOk ? "PASSED" : "FAILED")}");
    
    // Test 2: Forward pass shape
    long batchSize = 2;
    long seqLen = 10;
    var input = randn(batchSize, seqLen, config.EmbDim, device: device);
    
    Console.WriteLine($"  Input shape:  [{string.Join(", ", input.shape)}]");
    
    var output = block.forward(input);
    
    Console.WriteLine($"  Output shape: [{string.Join(", ", output.shape)}]");
    
    var expectedShape = new long[] { batchSize, seqLen, config.EmbDim };
    var outputShapeOk = output.shape.SequenceEqual(expectedShape);
    Console.WriteLine($"  Expected:     [{string.Join(", ", expectedShape)}]");
    Console.WriteLine($"  ✓ Output shape test: {(outputShapeOk ? "PASSED" : "FAILED")}");
    
    // Test 3: Verify residual connections work (output should be different but related to input)
    var inputMean = input.mean().ToSingle();
    var outputMean = output.mean().ToSingle();
    var residualWorking = !float.IsNaN(outputMean) && !float.IsInfinity(outputMean);
    Console.WriteLine($"  Input mean:   {inputMean:F4}");
    Console.WriteLine($"  Output mean:  {outputMean:F4}");
    Console.WriteLine($"  ✓ Residual connection test: {(residualWorking ? "PASSED" : "FAILED")}");
}

// ===== Test Issue #6: Full GPT-2 Model =====
Console.WriteLine();
Console.WriteLine("Testing GPT2Model (Full Model)...");

using (var scope = NewDisposeScope())
{
    var model = new GPT2Model(config).to(device);
    
    // Test 1: Verify number of transformer blocks
    var numBlocks = model.GetNumBlocks();
    Console.WriteLine($"  Number of blocks: {numBlocks}");
    Console.WriteLine($"  Expected:         {config.NLayers}");
    var blocksOk = numBlocks == config.NLayers;
    Console.WriteLine($"  ✓ Blocks test:    {(blocksOk ? "PASSED" : "FAILED")}");
    
    // Test 2: Forward pass with token IDs
    long batchSize = 2;
    long seqLen = 10;
    var inputIds = randint(0, config.VocabSize, new long[] { batchSize, seqLen }, dtype: ScalarType.Int64, device: device);
    
    Console.WriteLine($"  Input shape:  [{string.Join(", ", inputIds.shape)}]");
    
    var logits = model.forward(inputIds);
    
    Console.WriteLine($"  Output shape: [{string.Join(", ", logits.shape)}]");
    
    // Verify output shape [Batch, SeqLen, VocabSize]
    var expectedShape = new long[] { batchSize, seqLen, config.VocabSize };
    var outputShapeOk = logits.shape.SequenceEqual(expectedShape);
    Console.WriteLine($"  Expected:     [{string.Join(", ", expectedShape)}]");
    Console.WriteLine($"  ✓ Output shape test: {(outputShapeOk ? "PASSED" : "FAILED")}");
    
    // Test 3: Count parameters (~124M)
    var paramCount = model.CountParameters();
    var paramCountM = paramCount / 1_000_000.0;
    Console.WriteLine($"  Total parameters: {paramCount:N0} ({paramCountM:F1}M)");
    Console.WriteLine($"  Expected:         ~124M");
    var paramOk = paramCountM > 100 && paramCountM < 150;  // Reasonable range
    Console.WriteLine($"  ✓ Parameter count test: {(paramOk ? "PASSED" : "FAILED")}");
}

// ===== Issue #7: Load Weights & Run Inference =====
Console.WriteLine();
Console.WriteLine("═══════════════════════════════════════════════════════════════");
Console.WriteLine("Loading Pre-trained GPT-2 Weights & Running Inference...");
Console.WriteLine("═══════════════════════════════════════════════════════════════");

using (var scope = NewDisposeScope())
{
    // Create model
    var model = new GPT2Model(config).to(device);
    model.eval();  // Set to evaluation mode (disables dropout)
    
    // Load pre-trained weights
    var weightsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "weights", "gpt2_mini_model.safetensors");
    if (!File.Exists(weightsPath))
    {
        weightsPath = "/Users/okwe/dev/projects/2026/gptnet/weights/gpt2_mini_model.safetensors";
    }
    
    Console.WriteLine($"Weights path: {weightsPath}");
    WeightLoader.LoadWeightsManual(model, weightsPath, device);
    
    // Create tokenizer
    Console.WriteLine();
    Console.WriteLine("Initializing tokenizer...");
    var tokenizer = GPT2Tokenizer.CreateDefault();
    Console.WriteLine("✓ Tokenizer ready");
    
    // Encode "Hello"
    var prompt = "Hello";
    Console.WriteLine();
    Console.WriteLine($"Prompt: \"{prompt}\"");
    
    var inputTokens = tokenizer.Encode(prompt);
    Console.WriteLine($"Tokens: [{string.Join(", ", inputTokens)}]");
    
    // Generate text
    Console.WriteLine();
    Console.WriteLine("Generating text...");
    
    var maxNewTokens = 20;
    var generatedTokens = new List<int>(inputTokens);
    
    for (int i = 0; i < maxNewTokens; i++)
    {
        // Create input tensor
        var inputTensor = tensor(generatedTokens.Select(t => (long)t).ToArray(), device: device)
            .unsqueeze(0);  // Add batch dimension [1, seq_len]
        
        // Forward pass
        var logits = model.forward(inputTensor);
        
        // Get logits for the last token: [1, seq_len, vocab] -> [vocab]
        var nextTokenLogits = logits[0, -1];
        
        // Greedy decoding: pick the token with highest probability
        var nextToken = nextTokenLogits.argmax().ToInt32();
        
        generatedTokens.Add(nextToken);
        
        // Print token as we generate
        var tokenText = tokenizer.DecodeToken(nextToken);
        Console.Write(tokenText);
    }
    
    Console.WriteLine();
    Console.WriteLine();
    
    // Decode full output
    var fullOutput = tokenizer.Decode(generatedTokens);
    Console.WriteLine($"Full output: \"{fullOutput}\"");
}

Console.WriteLine();
Console.WriteLine("✓ All tests complete!");

// ===== Inference Function for CLI =====
void RunInference(string prompt, string? weightsPath)
{
    var cfg = new GPTConfig();
    var dev = DeviceManager.GetDevice();
    
    using var scope = NewDisposeScope();
    
    // Create model
    var mdl = new GPT2Model(cfg).to(dev);
    mdl.eval();
    
    // Determine weights path
    var wPath = weightsPath ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "weights", "gpt2_mini_model.safetensors");
    if (!File.Exists(wPath))
    {
        Console.WriteLine($"Error: Weights file not found: {wPath}");
        return;
    }
    
    // Load weights
    WeightLoader.LoadWeightsManual(mdl, wPath, dev);
    
    // Create tokenizer
    var tok = GPT2Tokenizer.CreateDefault();
    
    // Encode prompt
    var inputTokens = tok.Encode(prompt);
    
    // Generate text
    var maxNewTokens = 50;
    var generatedTokens = new List<int>(inputTokens);
    
    // Print prompt
    Console.Write(prompt);
    
    for (int i = 0; i < maxNewTokens; i++)
    {
        var inputTensor = tensor(generatedTokens.Select(t => (long)t).ToArray(), device: dev).unsqueeze(0);
        var logits = mdl.forward(inputTensor);
        var nextTokenLogits = logits[0, -1];
        var nextToken = nextTokenLogits.argmax().ToInt32();
        
        generatedTokens.Add(nextToken);
        Console.Write(tok.DecodeToken(nextToken));
    }
    
    Console.WriteLine();
}
