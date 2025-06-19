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
  LLMModule,
  Message,
  SMOLLM2_1_360M,
  SMOLLM2_1_TOKENIZER,
  SMOLLM2_1_TOKENIZER_CONFIG,
} from 'react-native-executorch';

const EMOTION_TO_ANIMATION: Record<string, string> = {
  joy: 'jump_dance',
  sad: 'crying',
  angry: 'stomp',
  // confused: 'head_tilt',
  tired: 'yawn',
};

export default function HomeScreen() {
  const colorScheme = useColorScheme(); // 현재 테마 가져오기
  const isDarkMode = colorScheme === 'dark';

  const [inputText, setInputText] = useState<string>(
    'I’ve been feeling really down and gloomy all day.'
  );
  const [emotion, setEmotion] = useState<string | null>(null);
  const [animation, setAnimation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 감정만 출력하도록 엄격한 프롬프트
  const getEmotionPrompt = (userText: string) => `
User said: ${userText}

Choose one word from the list that best describes the user's emotion:

joy  
sad  
angry  
tired

Only output one word, nothing else.
`;

  const runModel = async () => {
    if (!inputText.trim()) {
      alert('입력 내용을 작성해주세요!');
      return;
    }
    setLoading(true);
    try {
      await LLMModule.load({
        modelSource: SMOLLM2_1_360M,
        tokenizerSource: SMOLLM2_1_TOKENIZER,
        tokenizerConfigSource: SMOLLM2_1_TOKENIZER_CONFIG,
      });

      // 감정 추출용 프롬프트 생성
      const prompt = getEmotionPrompt(inputText);

      // 모델에게 감정 단어만 요청
      const response = await LLMModule.sendMessage(prompt);

      // response는 Message[] 형태이므로, content 중 첫번째를 감정 단어로 가정
      const rawEmotion = response?.[1]?.content?.trim().toLowerCase() ?? '';

      // 따옴표 제거
      const cleanedEmotion = rawEmotion.replace(/^['"]|['"]$/g, '');

      // 미리 정의한 애니메이션 매핑에서 찾기
      const anim = EMOTION_TO_ANIMATION[cleanedEmotion] ?? 'default_animation';

      setEmotion(cleanedEmotion);
      setAnimation(anim);
      setResult(response);
    } catch (err) {
      console.error('실행 중 오류:', err);
      setEmotion(null);
      setAnimation(null);
      setResult(null);
    }
    setLoading(false);
  };

  const [result, setResult] = useState<Message[] | null>(null);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.reactLogo}
      />
      <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
        AI 감정 및 애니메이션 매핑 테스트
      </Text>

      <TextInput
        style={{ ...styles.input, color: isDarkMode ? 'white' : 'black' }}
        placeholder="여기에 입력하세요"
        value={inputText}
        onChangeText={setInputText}
        editable={!loading}
      />

      <Button
        title={loading ? '실행 중...' : '감정 분석 실행'}
        onPress={runModel}
        disabled={loading}
      />

      {emotion && (
        <View style={styles.resultContainer}>
          <Text
            style={{
              color: isDarkMode ? 'white' : 'black',
              fontWeight: 'bold',
            }}
          >
            감정 단어: {emotion}
          </Text>
          <Text style={{ color: isDarkMode ? 'white' : 'black', marginTop: 4 }}>
            매핑된 애니메이션: {animation}
          </Text>
        </View>
      )}

      {result && Array.isArray(result) && (
        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={styles.resultContainer}
        >
          {result.map((item, index) => (
            <View key={index} style={styles.message}>
              <Text
                style={[styles.role, { color: isDarkMode ? 'white' : 'black' }]}
              >
                {item.role} :
              </Text>
              <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                {item.content}
              </Text>
            </View>
          ))}
        </ScrollView>
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
    maxHeight: 300,
    width: '100%',
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  resultContainer: { padding: 10 },
  message: { marginBottom: 10 },
  role: { fontWeight: 'bold' },
});
