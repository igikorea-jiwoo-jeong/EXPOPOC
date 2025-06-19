import torch

# 모델 로드
model = torch.jit.load("assets/model/simple.pte")

# 테스트용 입력
input_tensor = torch.tensor([2.0])

# 모델 실행
output = model(input_tensor)

print("입력:", input_tensor)
print("출력:", output)
