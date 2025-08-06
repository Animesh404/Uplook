const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Suppress Reanimated warnings
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-reanimated/logger': 'react-native-reanimated/src/logger/NoopLogger',
};

module.exports = withNativeWind(config, { input: "./global.css" });
