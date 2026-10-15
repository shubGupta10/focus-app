const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to:
 * 1. Disable Google's proprietary dependency metadata block in APKs (IzzyOnDroid requirement).
 * 2. Exclude unused vector icon font files from APK packaging to save ~3.5 MB.
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
    packagingOptions {
        resources {
            excludes += [
                '**/AntDesign.ttf',
                '**/Entypo.ttf',
                '**/EvilIcons.ttf',
                '**/Feather.ttf',
                '**/FontAwesome*.ttf',
                '**/Fontisto.ttf',
                '**/Foundation.ttf',
                '**/MaterialCommunityIcons.ttf',
                '**/MaterialIcons.ttf',
                '**/Octicons.ttf',
                '**/SimpleLineIcons.ttf',
                '**/Zocial.ttf'
            ]
        }
    }
}
`;
    }
    return modConfig;
  });
};
