import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

let myModel: InferenceSession;

async function loadModel() {
  try {
    // 1. 모델 자산을 불러오기
    const asset = Asset.fromModule(require('@/assets/onnx_model/model.onnx'));
    await asset.downloadAsync(); // asset.localUri 생성

    // 2. FileSystem documentDirectory로 복사
    const modelPath = FileSystem.documentDirectory + 'model.onnx';

    await FileSystem.copyAsync({
      from: asset.localUri!,
      to: modelPath,
    });

    console.log('Model copied to:', modelPath);

    // 3. 복사된 경로로 ONNX 모델 세션 생성
    myModel = await InferenceSession.create(modelPath);
    console.log('myModel loaded:', myModel);

    console.log('inputNames:', myModel.inputNames);

    Alert.alert(
      'Model loaded',
      `input: ${myModel.inputNames}, output: ${myModel.outputNames}`
    );
  } catch (e) {
    console.error('Model load failed:', e);
    Alert.alert('Load failed', String(e));
    throw e;
  }
}

async function runModel() {
  try {
    const inputIds = new Tensor(
      'int64',
      new BigInt64Array([101n, 2023n, 2003n, 1037n, 7953n, 102n]),
      [1, 6]
    );
    const attentionMask = new Tensor(
      'int64',
      new BigInt64Array([1n, 1n, 1n, 1n, 1n, 1n]),
      [1, 6]
    );

    const feeds: Record<string, Tensor> = {
      input_ids: inputIds,
      attention_mask: attentionMask,
    };
    const fetches = await myModel.run(feeds);
    const output = fetches[myModel.outputNames[0]];
    console.log(output);

    if (!output) {
      Alert.alert('No output', `${myModel.outputNames[0]}`);
    } else {
      Alert.alert(
        'Inference success',
        `shape: ${output.dims}, data-length: ${output.data.length}`
      );
    }
  } catch (e) {
    console.log(e);

    Alert.alert('Inference failed', `${e}`);
    throw e;
  }
}

const emotionMap = {
  joy: 'jump_dance',
  sad: 'slow_sit',
  angry: 'stomp',
  tired: 'yawn',
};

function mapEmotionToAnimation(emotion: string): string {
  return emotionMap[emotion] ?? 'head_tilt';
}

async function predictEmotion(userInput: string): Promise<string> {
  // tokenizer가 있다면 여기에 입력 텍스트 → input_ids, attention_mask 처리
  const inputIds = new Tensor(
    'int64',
    new BigInt64Array([101n, 2023n, 2003n, 1037n, 7953n, 102n]),
    [1, 6]
  );
  const attentionMask = new Tensor(
    'int64',
    new BigInt64Array([1n, 1n, 1n, 1n, 1n, 1n]),
    [1, 6]
  );

  const feeds: Record<string, Tensor> = {
    input_ids: inputIds,
    attention_mask: attentionMask,
  };

  const fetches = await myModel.run(feeds);
  const output = fetches['logits'] as Tensor;

  const logits = output.data as Float32Array;
  const maxIndex = logits.indexOf(Math.max(...logits));

  console.log(logits);

  console.log(maxIndex);

  const labels = ['joy', 'sad'];
  return labels[maxIndex]; // 예: "sad"
}

async function onUserSubmit(text: string) {
  const emotion = await predictEmotion(text);
  const animation = mapEmotionToAnimation(emotion);
  Alert.alert(`Emotion: ${emotion}`, `Play animation: ${animation}`);
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text>ONNX Runtime React Native Basic Usage</Text>
      <Button title="Load model" onPress={loadModel} />
      <Button title="Run inference" onPress={runModel} />
      <Button
        title="분석하기"
        onPress={() => onUserSubmit('I’m feeling very tired today')}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
