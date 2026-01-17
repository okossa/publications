using Microsoft.ML.Tokenizers;

namespace GPTNet.Utils;

/// <summary>
/// GPT-2 BPE tokenizer wrapper using Microsoft.ML.Tokenizers.
/// </summary>
public class GPT2Tokenizer
{
    private readonly Tokenizer _tokenizer;

    private GPT2Tokenizer(Tokenizer tokenizer)
    {
        _tokenizer = tokenizer;
    }
    
    /// <summary>
    /// Creates a GPT-2 tokenizer using TikToken encoding.
    /// </summary>
    public static GPT2Tokenizer CreateDefault()
    {
        // Use TikToken with GPT-2 encoding
        var tokenizer = TiktokenTokenizer.CreateForModel("gpt-2");
        return new GPT2Tokenizer(tokenizer);
    }

    /// <summary>
    /// Encodes text into token IDs.
    /// </summary>
    public int[] Encode(string text)
    {
        var result = _tokenizer.EncodeToIds(text);
        return result.ToArray();
    }

    /// <summary>
    /// Decodes token IDs back to text.
    /// </summary>
    public string Decode(IEnumerable<int> tokenIds)
    {
        return _tokenizer.Decode(tokenIds) ?? "";
    }
    
    /// <summary>
    /// Decodes a single token ID to text.
    /// </summary>
    public string DecodeToken(int tokenId)
    {
        return _tokenizer.Decode(new[] { tokenId }) ?? "";
    }
}
