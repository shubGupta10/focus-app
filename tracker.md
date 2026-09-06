# Focus App (Lockout) Progress Tracker

## What we have done till now
- [x] Initialized Expo SDK 57 project with NativeWind.
- [x] Created Expo Local Module (`focus-blocker`).
- [x] Hooked up UsageStats permission to detect foreground apps.
- [x] Hooked up System Alert Window permission for overlays.
- [x] Hooked up Battery Optimization permission to keep the app alive.
- [x] Created `FocusService.kt` (Android Foreground Service) to loop in the background.
- [x] Built the MVP background engine that detects blocked apps and shows a Native Overlay.

## Phase 5: The React Native UI (Gamified & Scalable Structure)
- [x] Set up the Custom Hook (`src/hooks/useFocusEngine.ts`)
- [x] Make the app full-screen & premium (`src/app/_layout.tsx`)
- [x] Build the Floating Modals (App Selection)
- [x] Implement persistent storage (AsyncStorage) so the user doesn't have to re-select apps every time.

## Phase 6 & 7: The Native Overlay Revival
- [x] Strip `WindowManager` deep link code from `FocusService.kt`.
- [x] Implement `showBlockOverlay` in Kotlin with a gorgeous full-screen UI ("STAY FOCUSED. GET BACK TO WORK.")
- [x] Update `FocusService` loop to Auto-Hide the overlay when on the home screen.

## Phase 8: The Dual Timer Engine
- [x] Add `durationMs` to the Native Bridge (`FocusBlockerModule.kt` & `.ts`).
- [x] Update `FocusService.kt` loop to auto-kill the service when time is up.
- [x] Build the `TimerSelectionModal.tsx` for preset durations.
- [x] Wire up `useFocusEngine.ts` to track and format the MM:SS timer.
- [x] Update `ActiveSessionUI.tsx` to display the live timer.

## Phase 9: Premium Design System & Theming
- [x] Implement Material You dynamic theming (`react-native-material-you`).
- [x] Set up `ThemeContext.tsx` to extract wallpaper colors and map them to standard tokens (Primary, Background, Surface, Text).
- [x] Convert all UI components to use semantic tokens (`bg-background`, `text-text`, etc) instead of hardcoded colors.
- [x] Refine the minimalist, professional UI layout in `index.tsx`.

## Phase 10: Persistent SQLite Stats & Dashboard
- [x] Set up SQLite database (`expo-sqlite`) for persistent stats.
- [x] Create `statsRepository.ts` to log sessions and track daily focus time, total sessions, and streaks.
- [x] Integrate `useUserStats.ts` into the home screen to display real-time live stats (`0h today · 0 sessions`).

## Phase 11: Rebranding & Production Build
- [x] Rebrand app from "focus" to "Lockout" across all configuration files (`app.json`, `package.json`).
- [x] Update all Android Native configurations (`build.gradle`, `AndroidManifest.xml`, Kotlin package names).
- [x] Update Foreground Service notification to use `applicationInfo.icon` dynamically.
- [x] Fix Gradle Node.js OOM limits (`--max-old-space-size=4096`).
- [x] Successfully compile and generate Standalone Release APK (`assembleRelease`).

## What we are doing (Next Up)
## Phase 12: Notifications & Reminders
- [ ] Research and implement local notifications logic.
- [ ] Set up notification permissions and channels.
- [ ] Integrate notification triggers based on user rules (e.g. reminding them to focus, celebrating streaks).

## What we are yet to do
- [ ] Add Premium features / Pro Wall.
