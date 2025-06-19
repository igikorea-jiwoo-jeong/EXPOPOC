import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  LLAMA3_2_1B_QLORA,
  LLAMA3_2_TOKENIZER,
  LLAMA3_2_TOKENIZER_CONFIG,
  LLMModule,
  Message,
} from 'react-native-executorch';

export default function HomeScreen() {
  const [inputText, setInputText] = useState(''); // 사용자 입력 상태
  const [result, setResult] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(false);

  const runModel = async () => {
    if (!inputText.trim()) {
      alert('입력 내용을 작성해주세요!');
      return;
    }
    setLoading(true);
    try {
      // 모델 로드 (실제 앱에선 useEffect로 한 번만 로드하는 게 좋아요)
      await LLMModule.load({
        modelSource: LLAMA3_2_1B_QLORA,
        tokenizerSource: LLAMA3_2_TOKENIZER,
        tokenizerConfigSource: LLAMA3_2_TOKENIZER_CONFIG,
        onDownloadProgressCallback: (progress) => {
          console.log(`다운로드 진행률: ${progress * 100}%`);
        },
      });

      // 사용자 입력 텍스트를 보내서 응답 받기
      const response = await LLMModule.sendMessage(inputText);

      setResult(response);
    } catch (err) {
      console.error('실행 중 오류:', err);
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.reactLogo}
      />
      <Text>LLAMA3 실행 테스트</Text>

      {/* 사용자 입력 텍스트박스 */}
      <TextInput
        style={styles.input}
        placeholder="여기에 입력하세요"
        value={inputText}
        onChangeText={setInputText}
        editable={!loading}
      />

      <Button
        title={loading ? '실행 중...' : 'Run Model'}
        onPress={runModel}
        disabled={loading}
      />

      {result && Array.isArray(result) && (
        <View style={styles.resultContainer}>
          {result.map((item, index) => (
            <View key={index} style={styles.message}>
              <Text style={styles.role}>{item.role} :</Text>
              <Text>{item.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
  },
  message: {
    marginBottom: 10,
  },
  role: {
    fontWeight: 'bold',
  },
});
