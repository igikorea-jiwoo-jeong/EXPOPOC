from optimum.onnxruntime import ORTModelForSequenceClassification
from transformers import AutoTokenizer

model = ORTModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased-finetuned-sst-2-english",
    export=True  # 자동 ONNX 변환 + 검증
)
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")

model.save_pretrained("./assets/onnx_model")
tokenizer.save_pretrained("./assets/onnx_model")


