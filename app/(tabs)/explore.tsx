import { Asset } from 'expo-asset';
import { GLView } from 'expo-gl';
import { Renderer, loadAsync } from 'expo-three';
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import * as THREE from 'three';

export default function App() {
  const [glViewKey, setGlViewKey] = useState(0); // GLView를 재렌더링하는 키
  const modelRef = useRef<THREE.Group | null>(null);

  const onContextCreate = async (gl: any) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    // ✅ GLB 파일을 Asset으로 로드
    const asset = Asset.fromModule(require('@/assets/glbs/barista.glb'));

    await asset.downloadAsync();

    try {
      const model = await loadAsync(
        asset.uri.split('?platform')[0],
        undefined,
        (loader) => {
          // GLTFLoader를 이렇게 require로 불러오기
          const {
            GLTFLoader,
          } = require('three/examples/jsm/loaders/GLTFLoader');
          return new GLTFLoader();
        }
      );

      scene.add(model.scene);
      modelRef.current = model;

      const animate = () => {
        requestAnimationFrame(animate);

        if (modelRef.current && modelRef.current.rotation) {
          modelRef.current.rotation.y += 0.01;
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      animate();
    } catch (err) {
      console.error('❌ 모델 로딩 실패:', err);
    }
  };

  return (
    <View style={styles.container}>
      <GLView
        key={glViewKey}
        style={StyleSheet.absoluteFill}
        onContextCreate={onContextCreate}
      />
      <View style={styles.buttonOverlay}>
        <Button
          title="🔄 새로고침"
          onPress={() => setGlViewKey((prev) => prev + 1)}
        />
      </View>
    </View>
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
