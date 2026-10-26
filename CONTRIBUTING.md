# Contributing to Lockout

First off, thank you for considering contributing to Lockout! 🎉 Lockout is a free, privacy-first, open-source focus and productivity application for Android.

Whether you are reporting a bug, suggesting an enhancement, improving documentation, or writing code, all contributions are welcome.

---

## 🛠️ Development Setup

### Prerequisites
* **Node.js:** `v22.x` or later
* **Package Manager:** `npm`
* **Java Development Kit (JDK):** JDK 17 (recommended for React Native / Gradle)
* **Android Studio & SDK:** Android SDK Platform 34+, Android Build-Tools, and an Android 10+ device or emulator

### 1. Clone & Install
```bash
git clone https://github.com/shubGupta10/focus-app.git
cd focus
npm install
```

### 2. Start the Metro Bundler
```bash
npx expo start
```

### 3. Build & Run on Android
Because Lockout utilizes native Android background services and `SYSTEM_ALERT_WINDOW` overlays, it requires a custom development build rather than basic Expo Go:

```bash
# Run on an active Android emulator or connected device
npm run android

# Or build native APK directly using Gradle
cd android
./gradlew assembleDebug
```

---

## 🏗️ Codebase & Architecture Standards

Lockout follows a **Feature-Based Modular Architecture** combined with the **Container/Presenter Pattern**:

* **Domain Modules:** Core domain features live in `src/features/[feature_name]/` (e.g. `session`, `routines`, `stats`).
* **Thin Routes:** `src/app/` holds only thin routing screens that compose feature components.
* **Separation of Concerns:** Keep business logic, native permissions, and database operations inside single-purpose custom hooks rather than bloating UI components.
* **Design System & Styling:** Use NativeWind / Tailwind CSS and adhere strictly to the centralized colors in `src/constants/Color.ts`. Avoid hardcoding arbitrary hex values.
* **Detailed Guidelines:** Please review [AGENTS.md](AGENTS.md) for complete architecture, UX standards, and development principles.

---

## 🌿 Branching & Git Workflow

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Keep commits concise and meaningful:
   ```bash
   git commit -m "feat(routines): add custom vibration patterns"
   ```
3. Verify TypeScript passes before submitting:
   ```bash
   npx tsc --noEmit
   ```
4. Push to your fork and open a Pull Request against `main`.

---

## 🐛 Reporting Bugs & Suggesting Features

* **Bug Reports:** Please check existing issues first. If it hasn't been reported, open a new issue using the **Bug Report** template with device details and steps to reproduce.
* **Feature Requests:** Open an issue using the **Feature Request** template describing the user problem and proposed solution.

---

## 📄 License
By contributing to Lockout, you agree that your contributions will be licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
