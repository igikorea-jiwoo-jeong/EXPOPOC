# import torch
# from transformers import AutoModelForCausalLM, AutoTokenizer

# model_name = "microsoft/DialoGPT-small"
# model = AutoModelForCausalLM.from_pretrained(model_name).eval()
# tokenizer = AutoTokenizer.from_pretrained(model_name)

# # 더미 입력 준비
# inputs = tokenizer("Hello", return_tensors="pt")
# input_ids = inputs["input_ids"]

# # logits만 추출하는 래퍼 함수 정의
# class WrappedModel(torch.nn.Module):
#     def __init__(self, model):
#         super().__init__()
#         self.model = model

#     def forward(self, input_ids):
#         outputs = self.model(input_ids=input_ids)
#         return outputs.logits  # 오직 Tensor만 반환

# wrapped_model = WrappedModel(model)

# # TorchScript 변환
# traced_model = torch.jit.trace(wrapped_model, input_ids)
# traced_model.save("dialoGPT-small.pt")
# print("✅ 변환 성공: dialoGPT-small.pt 저장 완료")


import torch

class SimpleModel(torch.nn.Module):
    def forward(self, x):
        return x * 2

model = SimpleModel()
example_input = torch.tensor([1.0])
# scripted_model = torch.jit.script(model)
# scripted_model.save("simple.pte")
traced = torch.jit.trace(model, example_input)
traced.save("simple.pte")
