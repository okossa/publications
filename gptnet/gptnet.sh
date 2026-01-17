#!/bin/bash
# GPTNet - GPT-2 Text Generation in C#
# Usage: ./gptnet.sh -p "Your prompt here" [-w /path/to/weights.safetensors]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/GPTNet"
DEFAULT_WEIGHTS="$SCRIPT_DIR/weights/gpt2_mini_model.safetensors"

# Parse arguments
PROMPT=""
WEIGHTS=""

usage() {
    echo "Usage: $0 -p \"<prompt>\" [-w <weights_path>]"
    echo ""
    echo "Options:"
    echo "  -p    Prompt text for generation (required)"
    echo "  -w    Path to weights file (optional, defaults to ./weights/gpt2_mini_model.safetensors)"
    echo ""
    echo "Example:"
    echo "  $0 -p \"Hello, my name is\""
    echo "  $0 -p \"Once upon a time\" -w /path/to/model.safetensors"
    exit 1
}

while getopts "p:w:h" opt; do
    case $opt in
        p) PROMPT="$OPTARG" ;;
        w) WEIGHTS="$OPTARG" ;;
        h) usage ;;
        *) usage ;;
    esac
done

# Check required arguments
if [ -z "$PROMPT" ]; then
    echo "Error: Prompt is required"
    usage
fi

# Set weights path
if [ -z "$WEIGHTS" ]; then
    WEIGHTS="$DEFAULT_WEIGHTS"
fi

# Check weights file exists
if [ ! -f "$WEIGHTS" ]; then
    echo "Error: Weights file not found: $WEIGHTS"
    exit 1
fi

# Run the model
cd "$PROJECT_DIR" && dotnet run -- --inference --prompt "$PROMPT" --weights "$WEIGHTS"
