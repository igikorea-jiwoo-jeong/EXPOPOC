const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  // 현재 프로젝트 루트 경로 지정
  const projectRoot = __dirname;

  const config = await getDefaultConfig(projectRoot);

  // 기존 assetExts 배열을 확장
  config.resolver.assetExts.push('bin', 'db', 'onnx', 'ort');

  return config;
})();
