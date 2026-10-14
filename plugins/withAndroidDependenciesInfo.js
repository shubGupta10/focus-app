const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to disable Google's proprietary dependency metadata block in APKs.
 * Required for IzzyOnDroid and F-Droid security compliance.
 */
module.exports = function withAndroidDependenciesInfo(config) {
  return withAppBuildGradle(config, (modConfig) => {
    if (!modConfig.modResults.contents.includes('dependenciesInfo')) {
      modConfig.modResults.contents += `
android {
    dependenciesInfo {
        includeInApk = false
        includeInBundle = false
    }
}
`;
    }
    return modConfig;
  });
};
