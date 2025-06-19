const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('pt'); // .pt 확장자 등록
config.resolver.assetExts.push('pte'); // .pt 확장자 등록

module.exports = config;
