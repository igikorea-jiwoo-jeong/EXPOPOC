import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webviewRef = useRef<any>(null);

  return (
    <WebView
      bounces={false}
      ref={webviewRef}
      source={{ uri: 'http://192.168.0.71:5173/' }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1, // ✅ 버튼을 위로
    backgroundColor: '#fff',
  },
});
