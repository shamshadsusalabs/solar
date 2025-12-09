module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    'nativewind/babel',
  ],
  plugins: [
    'react-native-reanimated/plugin', // 👈 ye hamesha sabse last plugin hona chahiye
  ],
};
