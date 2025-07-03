import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

// tokenizer.json은 JSON 형태로, 사전 데이터가 들어있다고 가정
import tokenizerJson from '@/assets/onnx_model/tokenizer.json';

let myModel: InferenceSession;

async function loadModel() {
  const asset = Asset.fromModule(require('@/assets/onnx_model/model.onnx'));
  await asset.downloadAsync();

  const modelPath = FileSystem.documentDirectory + 'model.onnx';

  await FileSystem.copyAsync({
    from: asset.localUri!,
    to: modelPath,
  });

  myModel = await InferenceSession.create(modelPath);
  Alert.alert('Model loaded');
}

// 아주 단순한 whitespace tokenizer + tokenizerJson 이용해 token ids 생성하는 예시 (예시용, 실제는 subword tokenizer 여야 함)
function simpleTokenize(text: string): number[] {
  const vocab = tokenizerJson.model.vocab; // 예: { "i":1, "love":2, "you":3, ... }
  const tokens = text.toLowerCase().split(/\s+/);

  return tokens.map((token) => vocab[token] ?? vocab['[UNK]']);
}

async function predictEmotion(userInput: string): Promise<string> {
  if (!myModel) throw new Error('Model not loaded');

  const ids = simpleTokenize(userInput);

  const length = ids.length;

  // padding 길이 맞추기 (예: 20)
  const maxLen = 20;
  const inputIdsArr = new Array(maxLen).fill(0);
  const attentionMaskArr = new Array(maxLen).fill(0);

  for (let i = 0; i < Math.min(length, maxLen); i++) {
    inputIdsArr[i] = ids[i];
    attentionMaskArr[i] = 1;
  }

  const inputIds = new Tensor(
    'int64',
    BigInt64Array.from(inputIdsArr.map((i) => BigInt(i))),
    [1, maxLen]
  );
  const attentionMask = new Tensor(
    'int64',
    BigInt64Array.from(attentionMaskArr.map((i) => BigInt(i))),
    [1, maxLen]
  );

  const feeds: Record<string, Tensor> = {
    input_ids: inputIds,
    attention_mask: attentionMask,
  };

  const fetches = await myModel.run(feeds);
  const output = fetches['logits'] as Tensor;
  const logits = output.data as Float32Array;

  console.log('logits', logits);

  const maxIndex = logits.indexOf(Math.max(...logits));
  const labels = ['negative', 'positive'];

  return labels[maxIndex];
}

const emotionMap = {
  positive: 'jump_dance',
  negative: 'slow_sit',
};

function mapEmotionToAnimation(emotion: string): string {
  return emotionMap[emotion] ?? 'idle';
}

export default function App() {
  const [text, setText] = useState('');

  const onLoad = async () => {
    await loadModel();
  };

  const onAnalyze = async () => {
    try {
      const emotion = await predictEmotion(text);
      const animation = mapEmotionToAnimation(emotion);
      Alert.alert(`Emotion: ${emotion}`, `Play animation: ${animation}`);
    } catch (e) {
      Alert.alert('분석 실패', String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text>감정 분석 데모</Text>

      <TextInput
        style={styles.input}
        placeholder="문장을 입력하세요"
        value={text}
        onChangeText={setText}
      />

      <Button title="모델 로드" onPress={onLoad} />
      <Button title="감정 분석" onPress={onAnalyze} />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 20,
  },
});
