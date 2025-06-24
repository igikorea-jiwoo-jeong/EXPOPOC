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

    const asset = Asset.fromModule(require('@/assets/glbs/barista.glb'));
    await asset.downloadAsync();

    try {
      const model = await loadAsync(
        asset.uri.split('?platform')[0],
        undefined,
        (loader) => {
          const {
            GLTFLoader,
          } = require('three/examples/jsm/loaders/GLTFLoader');
          return new GLTFLoader();
        }
      );

      model.scene.traverse((child: any) => {
        if (child.isMesh && child.material?.map) {
          child.material.map.flipY = false;
          child.material.needsUpdate = true;
        }
      });

      scene.add(model.scene);
      modelRef.current = model.scene;

      const animate = () => {
        requestAnimationFrame(animate);
        if (modelRef.current) {
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
        style={{ flex: 1 }}
        onContextCreate={onContextCreate}
      />
      <View style={styles.buttonContainer}>
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
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
