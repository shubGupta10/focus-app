module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|nativewind|react-native-reanimated)",
  ],
  moduleNameMapper: {
    "^react-native/react-private-interface$": "<rootDir>/node_modules/react-native/src/react-private-interface.js",
    "^react-native/setup-env$": "<rootDir>/node_modules/react-native/src/setup-env.js",
  },
};