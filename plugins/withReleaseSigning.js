const { withAppBuildGradle } = require('@expo/config-plugins');

const CREDENTIALS_BLOCK = `    def easLocalCredsFile = new File(rootDir.parentFile, 'credentials.json')
    def easLocalKeystore = null
    if (!file('eas-build.gradle').exists() && easLocalCredsFile.exists()) {
        def parsedCreds = new groovy.json.JsonSlurper().parse(easLocalCredsFile)
        def ks = parsedCreds?.android?.keystore
        if (ks?.keystorePath) {
            def ksFile = new File(easLocalCredsFile.parentFile, ks.keystorePath)
            if (ksFile.exists()) {
                easLocalKeystore = [file: ksFile, cfg: ks]
            }
        }
    }
    signingConfigs {`;

const RELEASE_SIGNING_CONFIG_BLOCK = `        if (easLocalKeystore != null) {
            release {
                storeFile easLocalKeystore.file
                storePassword easLocalKeystore.cfg.keystorePassword
                keyAlias easLocalKeystore.cfg.keyAlias
                keyPassword easLocalKeystore.cfg.keyPassword
            }
        }
    }`;

/**
 * Expo Config Plugin that configures local `./gradlew assembleRelease` builds
 * to sign with the keystore referenced in root `credentials.json` when
 * `eas-build.gradle` is not present (leaving EAS Cloud signing untouched).
 */
module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (modConfig) => {
    let contents = modConfig.modResults.contents;
    if (contents.includes('easLocalKeystore')) {
      return modConfig;
    }

    contents = contents.replace(/^\s*signingConfigs\s*\{/m, CREDENTIALS_BLOCK);
    contents = contents.replace(
      /(signingConfigs\s*\{[\s\S]*?keyPassword\s+'android'\s*\r?\n\s*\}\s*\r?\n)\s*\}/,
      `$1${RELEASE_SIGNING_CONFIG_BLOCK}`
    );
    contents = contents.replace(
      /(\brelease\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      '$1signingConfig easLocalKeystore != null ? signingConfigs.release : signingConfigs.debug'
    );

    modConfig.modResults.contents = contents;
    return modConfig;
  });
};
