# Contributing to Lockout

Guidelines for reporting bugs, submitting feature requests, and local development.

---

## Local Development Setup

### Prerequisites
* **Node.js:** `v22.x` or later
* **Package Manager:** `npm`
* **Java Development Kit:** JDK 17
* **Android Studio & SDK:** API 34+ build-tools and an Android 10+ device or emulator

### 1. Clone & Install
```bash
git clone https://github.com/shubGupta10/focus-app.git
cd focus-app
npm install
```

### 2. Run the App
Because Lockout relies on native Android background monitoring and overlay permissions (`SYSTEM_ALERT_WINDOW`), it requires a native development build. Standard Expo Go is not supported.

```bash
# Start the Metro bundler
npm run start

# Build and run on a connected Android device or running emulator
npm run android
```

Alternatively, build the APK directly using Gradle:
```bash
cd android
./gradlew assembleDebug
```

---

## Code & Architecture Conventions

* **Feature-Based Structure:** Domain code is organized by feature inside `src/features/<feature_name>/` (e.g. `session`, `routines`, `stats`).
* **Routing:** `src/app/` contains thin route files that compose feature components. Avoid placing complex business logic directly in route files.
* **Separation of Concerns:** Business logic, native Android permission checks, and SQLite operations belong in custom hooks and utilities, not inside UI render trees.
* **Styling & Theming:** Use NativeWind / Tailwind CSS classes and semantic color tokens from `src/constants/Color.ts`. Do not hardcode arbitrary hex values inside components.

---

## Pull Request Guidelines

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Verify TypeScript compiles without errors:
   ```bash
   npx tsc --noEmit
   ```
3. Test your changes on a physical device or Android emulator to ensure background services and overlays continue to function as expected.
4. Keep pull requests focused on a single change or fix.
5. Open a Pull Request against `main` and fill in the PR checklist.

---

## Reporting Issues

* **Bugs:** Search existing issues before creating a new report. Include your device model, Android version, and steps to reproduce.
* **Feature Requests:** Open an issue explaining the problem you are solving and the proposed behavior.

---

## License
By contributing to Lockout, you agree that your contributions will be licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
