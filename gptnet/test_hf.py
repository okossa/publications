import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
model = GPT2LMHeadModel.from_pretrained('gpt2')
model.eval()

# Check c_attn weight and bias
c_attn = model.transformer.h[0].attn.c_attn
print('c_attn weight shape:', c_attn.weight.shape)
print('c_attn bias shape:', c_attn.bias.shape)
print('c_attn.bias[:5]:', c_attn.bias[:5].tolist())

# Let's compute step by step
input_ids = tokenizer.encode('Hello', return_tensors='pt')
print('\nInput tokens:', input_ids)

with torch.no_grad():
    tok_emb = model.transformer.wte(input_ids)
    pos_ids = torch.arange(0, input_ids.size(-1), dtype=torch.long).unsqueeze(0)
    pos_emb = model.transformer.wpe(pos_ids)
    hidden = tok_emb + pos_emb
    ln_out = model.transformer.h[0].ln_1(hidden)
    
    print('ln_out first 5:', ln_out[0, 0, :5].tolist())
    
    # Manual: Conv1D does x @ weight + bias
    manual_out = torch.matmul(ln_out, c_attn.weight) + c_attn.bias
    print('Manual c_attn output first 5:', manual_out[0, 0, :5].tolist())
    
    # Also check no-bias version
    manual_no_bias = torch.matmul(ln_out, c_attn.weight)
    print('Manual (no bias) first 5:', manual_no_bias[0, 0, :5].tolist())
