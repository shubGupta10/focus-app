const { AndroidConfig, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function buildWidgetProviderSource(androidPackage, widgetName) {
  return `package ${androidPackage}

import android.content.Context
import android.content.Intent
import android.net.Uri
import expo.modules.widgets.ExpoWidgetsAppWidgetProvider

class ${widgetName}Provider : ExpoWidgetsAppWidgetProvider("${widgetName}") {
  override fun onReceive(context: Context, intent: Intent) {
    val action = intent.action
    if (action == "expo.modules.widgets.ACTION_WIDGET_INTERACTION" ||
      action == "expo.modules.widgets.ACTION_WIDGET_OPEN_APP"
    ) {
      val target = intent.getStringExtra("expo.modules.widgets.extra.TARGET") ?: ""
      if (action == "expo.modules.widgets.ACTION_WIDGET_INTERACTION") {
        super.onReceive(context, intent)
      }
      val deepLink = if (action == "expo.modules.widgets.ACTION_WIDGET_INTERACTION" &&
        target.contains("start_timer")
      ) {
        "lockout://?startTimer=1"
      } else {
        "lockout://"
      }
      val launchIntent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
        setPackage(context.packageName)
        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        )
      }
      context.startActivity(launchIntent)
      return
    }
    super.onReceive(context, intent)
  }
}
`;
}

/**
 * Keeps widget providers wired to launch MainActivity with `lockout://`
 * (when tapping a running widget) or `lockout://?startTimer=1` (when tapping Start).
 */
module.exports = function withWidgetStartAction(config) {
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const androidPackage = AndroidConfig.Package.getPackage(modConfig);
      if (!androidPackage) return modConfig;

      const packageDir = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app/src/main/java',
        ...androidPackage.split('.')
      );
      fs.mkdirSync(packageDir, { recursive: true });

      for (const widgetName of ['LockoutWidget4x2', 'LockoutWidget2x2']) {
        fs.writeFileSync(
          path.join(packageDir, `${widgetName}Provider.kt`),
          buildWidgetProviderSource(androidPackage, widgetName)
        );
      }

      return modConfig;
    },
  ]);
};
