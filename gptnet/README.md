# GPTNet - GPT-2 in C#

A from-scratch implementation of GPT-2 (124M parameters) in C# using TorchSharp.

## Requirements

- .NET 8.0 SDK
- Pre-trained GPT-2 weights in safetensors format

## Platform-Specific Setup

The project requires platform-specific libtorch packages. These packages are large (~200MB+ for CPU, ~2GB+ for CUDA), so the first `dotnet restore` may take some time.

### Windows Setup

To run GPTNet on Windows, you need to modify the `.csproj` file to use Windows-compatible libtorch packages:

1. **Modify the `.csproj` file** (`GPTNet/GPTNet.csproj`):
   
   Replace the macOS libtorch package reference:
   ```xml
   <PackageReference Include="libtorch-cpu-osx-x64" Version="2.2.1.1" />
   ```
   
   With one of the following Windows packages:
   
   - **For CPU only**:
     ```xml
     <PackageReference Include="libtorch-cpu-win-x64" Version="2.2.1.1" />
     ```
   
   - **For CUDA/GPU support** (requires NVIDIA GPU and CUDA 12.1 installed):
     ```xml
     <PackageReference Include="libtorch-cuda-12.1-win-x64" Version="2.2.1.1" />
     ```

2. **Restore and build**:
   ```cmd
   cd GPTNet
   dotnet restore
   dotnet build
   ```

3. **Running on Windows**:
   
   Since `gptnet.sh` is a shell script, you have these alternatives:
   
   - **Use .NET CLI directly**:
     ```cmd
     cd GPTNet
     dotnet run -- --inference --prompt "Your prompt here" --weights ..\weights\gpt2_mini_model.safetensors
     ```
   
   - **Use Git Bash or WSL**: If you have Git Bash or Windows Subsystem for Linux (WSL) installed, you can run the shell script:
     ```bash
     ./gptnet.sh -p "Your prompt here"
     ```

### macOS Setup

The current setup works out of the box for macOS with the existing `libtorch-cpu-osx-x64` package reference in the `.csproj` file. No modifications are needed.

For CUDA/GPU support on macOS with Apple Silicon, you can use the Metal Performance Shaders (MPS) backend, but this requires a different libtorch package configuration.

## Quick Start

### Generate Text

```bash
./gptnet.sh -p "Your prompt here"
```

### Examples

```bash
# Basic usage
./gptnet.sh -p "Hello, my name is"

# With custom weights file
./gptnet.sh -p "Once upon a time" -w /path/to/model.safetensors

# Show help
./gptnet.sh -h
```

## Command-Line Options

| Option | Description |
|--------|-------------|
| `-p <prompt>` | **(Required)** The text prompt for generation |
| `-w <path>` | **(Optional)** Path to weights file. Defaults to `./weights/gpt2_mini_model.safetensors` |
| `-h` | Show help message |

## Project Structure

```
gptnet/
├── gptnet.sh                 # Shell script for easy text generation
├── weights/
│   └── gpt2_mini_model.safetensors  # Pre-trained GPT-2 weights
└── GPTNet/
    ├── Program.cs            # Main entry point
    ├── Config/
    │   └── GPTConfig.cs      # Model hyperparameters
    ├── Infrastructure/
    │   └── DeviceManager.cs  # CPU/CUDA device detection
    ├── Layers/
    │   ├── GPT2Embeddings.cs       # Token + position embeddings
    │   ├── CausalSelfAttention.cs  # Multi-head causal attention
    │   ├── GPT2MLP.cs              # Feed-forward network with GELU
    │   └── TransformerBlock.cs     # Pre-LN transformer block
    ├── Model/
    │   └── GPT2Model.cs      # Complete GPT-2 model
    └── Utils/
        ├── CausalMask.cs     # Causal masking utility
        ├── GPT2Tokenizer.cs  # BPE tokenizer wrapper
        └── WeightLoader.cs   # Safetensors weight loading
```

## Model Architecture

- **Parameters**: 124.4M
- **Vocabulary Size**: 50,257
- **Context Length**: 1,024 tokens
- **Embedding Dimension**: 768
- **Attention Heads**: 12
- **Transformer Layers**: 12
- **Architecture**: Pre-LN GPT-2 with weight-tied embeddings

## Running Tests

To run the full test suite (verifies all model components):

```bash
cd GPTNet
dotnet run
```

## Building

```bash
cd GPTNet
dotnet build
```

## License

MIT
