# Expo SDK 57 Guidelines
- **Expo HAS CHANGED:** Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Tech Stack
- **Framework:** React Native with Expo (SDK 57)
- **Routing:** Expo Router
- **Styling:** NativeWind (Tailwind CSS)

# Styling & UI Guidelines
- **NativeWind First:** Use Tailwind utility classes via `className` for all styling.
- **Avoid `StyleSheet.create`:** Do not use React Native's `StyleSheet` unless absolutely necessary (e.g., for complex reanimated values or dynamic styles not achievable with Tailwind).
- **Premium Aesthetics:** Ensure the UI feels incredibly polished, utilizing dark mode by default, modern typography, glassmorphism effects, and smooth micro-animations.

# Architecture & MVP Strategy (Focus App)
- **Native Capabilities:** The core of this app requires deep Android system integrations:
  1. **Usage Access (Detect App Status):** To read which app is currently in the foreground.
  2. **System Alert Window (Draw Over Other Apps):** To display the blocking overlay when a distracting app is opened.
  3. **Ignore Battery Optimization / Foreground Services:** To ensure the background tracking does not get killed by the Android OS.
- **Development Builds:** Because Expo Go does not support custom native Android code, we will rely on **Expo Prebuild** and **Development Builds** (custom native clients) once we begin implementing the app blocking logic in Kotlin/Java.
- **MVP Flow:**
  - Start Session -> Request/Check Permissions -> Initiate Foreground Service -> Block distractions -> Complete Session.

# Code Quality
- **TypeScript:** Use strict TypeScript for all components and logic.
- **Component Structure:** Keep components small, functional, and separated by logical domains (e.g., UI components vs. Native Module wrappers).
