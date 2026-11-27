const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGETS = [
  {
    providerClass: 'LockoutWidget4x2Provider',
    receiverClass: 'LockoutWidget4x2GlanceReceiver',
    xmlName: 'lockout_widget4x2_info',
    previewLayout: 'lockout_widget4x2_preview',
    previewImage: 'lockout_widget4x2_preview_img',
    labelRes: '@string/lockout_widget4x2_display_name',
    descRes: '@string/lockout_widget4x2_description',
    displayName: 'Lockout',
    description: 'View focus streak and active session',
    minWidth: '250dp',
    minHeight: '110dp',
    minResizeWidth: '200dp',
    minResizeHeight: '110dp',
    targetCellWidth: 4,
    targetCellHeight: 2,
  },
  {
    providerClass: 'LockoutWidget2x2Provider',
    receiverClass: 'LockoutWidget2x2GlanceReceiver',
    xmlName: 'lockout_widget2x2_info',
    previewLayout: 'lockout_widget2x2_preview',
    previewImage: 'lockout_widget2x2_preview_img',
    labelRes: '@string/lockout_widget2x2_display_name',
    descRes: '@string/lockout_widget2x2_description',
    displayName: 'Lockout (Small)',
    description: 'Compact focus streak and timer',
    minWidth: '110dp',
    minHeight: '110dp',
    minResizeWidth: '110dp',
    minResizeHeight: '110dp',
    targetCellWidth: 2,
    targetCellHeight: 2,
  },
];

function buildProviderSource(androidPackage, widget) {
  return `package ${androidPackage}

import expo.modules.focusblocker.${widget.receiverClass}

class ${widget.providerClass} : ${widget.receiverClass}()
`;
}

function buildProviderInfoXml(widget) {
  return `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
  android:minWidth="${widget.minWidth}"
  android:minHeight="${widget.minHeight}"
  android:minResizeWidth="${widget.minResizeWidth}"
  android:minResizeHeight="${widget.minResizeHeight}"
  android:targetCellWidth="${widget.targetCellWidth}"
  android:targetCellHeight="${widget.targetCellHeight}"
  android:updatePeriodMillis="0"
  android:initialLayout="@layout/glance_default_loading_layout"
  android:previewLayout="@layout/${widget.previewLayout}"
  android:previewImage="@drawable/${widget.previewImage}"
  android:description="${widget.descRes}"
  android:resizeMode="horizontal|vertical"
  android:widgetCategory="home_screen" />
`;
}

function buildWidgetStringsXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="lockout_widget4x2_display_name">${WIDGETS[0].displayName}</string>
  <string name="lockout_widget4x2_description">${WIDGETS[0].description}</string>
  <string name="lockout_widget2x2_display_name">${WIDGETS[1].displayName}</string>
  <string name="lockout_widget2x2_description">${WIDGETS[1].description}</string>
</resources>
`;
}

/**
 * Registers the native Jetpack Glance widget receivers, XML metadata, and strings
 * so `expo prebuild` and EAS builds produce both widgets without `expo-widgets`.
 */
module.exports = function withWidgetStartAction(config) {
  config = withAndroidManifest(config, (modConfig) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(modConfig.modResults);
    app.receiver = (app.receiver || []).filter(
      (r) => !WIDGETS.some((w) => r.$?.['android:name'] === `.${w.providerClass}`)
    );

    for (const widget of WIDGETS) {
      app.receiver.push({
        $: {
          'android:name': `.${widget.providerClass}`,
          'android:exported': 'true',
          'android:label': widget.labelRes,
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
              { $: { 'android:name': 'android.intent.action.DATE_CHANGED' } },
              { $: { 'android:name': 'android.intent.action.TIME_SET' } },
              { $: { 'android:name': 'android.intent.action.TIMEZONE_CHANGED' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': `@xml/${widget.xmlName}`,
            },
          },
        ],
      });
    }

    return modConfig;
  });

  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const androidPackage = AndroidConfig.Package.getPackage(modConfig);
      if (!androidPackage) return modConfig;

      const root = modConfig.modRequest.platformProjectRoot;
      const packageDir = path.join(root, 'app/src/main/java', ...androidPackage.split('.'));
      const xmlDir = path.join(root, 'app/src/main/res/xml');
      const valuesDir = path.join(root, 'app/src/main/res/values');

      fs.mkdirSync(packageDir, { recursive: true });
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.mkdirSync(valuesDir, { recursive: true });

      for (const widget of WIDGETS) {
        fs.writeFileSync(
          path.join(packageDir, `${widget.providerClass}.kt`),
          buildProviderSource(androidPackage, widget)
        );
        fs.writeFileSync(
          path.join(xmlDir, `${widget.xmlName}.xml`),
          buildProviderInfoXml(widget)
        );
      }

      fs.writeFileSync(path.join(valuesDir, 'lockout_widgets.xml'), buildWidgetStringsXml());

      return modConfig;
    },
  ]);
};
