import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {
  LLAMA3_2_1B_QLORA,
  LLAMA3_2_TOKENIZER,
  LLAMA3_2_TOKENIZER_CONFIG,
  LLMModule,
  Message,
} from 'react-native-executorch';

export default function HomeScreen() {
  const colorScheme = useColorScheme(); // 현재 테마 가져오기
  const isDarkMode = colorScheme === 'dark';

  const [inputText, setInputText] = useState(''); // 사용자 입력 상태
  const [result, setResult] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(false);

  const emotionPrompt = `
다음은 사용자와 AI의 대화 내용입니다.
사용자의 감정을 유추해서 가능하면 한국어 한 단어(ex. 기쁨 Joy, 화남 Angry, 우울 Sad)로 표현해 주세요. 


대화:
User: 안녕하세요!
Assistant: 안녕하세요. 무엇을 도와드릴까요?
User: 그냥 기분이 좀 안 좋아요...
Assistant: 무슨 일 있으세요? 말씀해보세요.
User: 회사 일도 힘들고 요즘 잠도 못 자요.

결과 형식:
User 감정: [여기에 감정]
`;

  const runModel = async () => {
    if (!inputText.trim()) {
      alert('입력 내용을 작성해주세요!');
      return;
    }
    setLoading(true);
    try {
      // 모델 로드 (실제 앱에선 useEffect로 한 번만 로드)
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
      // const response = await LLMModule.sendMessage(emotionPrompt);

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
      <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
        LLAMA3 실행 테스트
      </Text>

      {/* 사용자 입력 텍스트박스 */}
      <TextInput
        style={{ ...styles.input, color: isDarkMode ? 'white' : 'black' }}
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
          {result && Array.isArray(result) && (
            <View style={styles.resultContainer}>
              <ScrollView
                style={styles.resultScroll}
                contentContainerStyle={styles.resultContainer}
              >
                {result.map((item, index) => (
                  <View key={index} style={styles.message}>
                    <Text
                      style={[
                        styles.role,
                        { color: isDarkMode ? 'white' : 'black' },
                      ]}
                    >
                      {item.role} :
                    </Text>
                    <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                      {item.content}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
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
  resultScroll: {
    maxHeight: 300, // 최대 높이 지정 (원하는 크기로 조절 가능)
    width: '100%',
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  resultContainer: {
    padding: 10,
  },
  message: {
    marginBottom: 10,
  },
  role: {
    fontWeight: 'bold',
  },
});
