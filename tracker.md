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

## Phase 12: Gamification & Session Completion Experience
- [x] Added coins calculation and streak tracking logic.
- [x] Built `SessionResultModal.tsx` with celebratory rewards and session completion feedback.
- [x] Integrated real-time coin earnings counter onto the active session orb.

## Phase 13: Multi-Tab Navigation & Dedicated Screens
- [x] Implemented multi-tab navigation via Expo Router (`(tabs)/_layout.tsx`).
- [x] Created dedicated Block List screen (`apps.tsx`) with fast search filtering, memoized app list, and batched saving.
- [x] Created dedicated Progress screen (`progress.tsx`) displaying current day streak, lifetime coins, and daily focus statistics.
- [x] Polished bottom navigation bar with active indicator pills, unselected app badge cues, and theme integration.

## Phase 14: Visual Identity, Color System & Focus Orb Refinements
- [x] Redesigned visual palette in `Colors.ts` to a bespoke Rosewood & Charcoal identity (`#161517` dark background, `#201E20` surface, `#C07480` / `#A35265` Rosewood accent).
- [x] Unified theme system in `ThemeContext.tsx` supporting seamless transitions between Dark Mode, Light Mode, and Material You dynamic theming.
- [x] Refined `CentralFocusOrb.tsx`: removed ring cutting artifacts, enhanced circular progress indicators, and added tactile hold-to-cancel gestures.
- [x] Completed full-app UI/UX audit standardizing typography, spacing, and accessibility roles across all modals and screens.

## What we are doing (Next Up)
## Phase 15: Strict Mode & Weekly Emergency Skip System
- [ ] Create `useStrictMode.ts` hook managing 1 weekly skip, Monday 00:00 reset cadence, and SQLite storage.
- [ ] Add `is_strict` column to `active_session` and `sessions` SQLite tables.
- [ ] Update `TimerSelectionModal.tsx` with Strict Mode card, toggle switch, and skip availability status.
- [ ] Update `useFocusEngine.ts` to accept and persist `isStrict` flag for active sessions.
- [ ] Update `ActiveSessionUI.tsx` and `CentralFocusOrb.tsx` with `🔒 Strict Mode` visual badge and locked-hold feedback.
- [ ] Update `EndSessionModal.tsx` for Strict emergency skip confirmation (with 5-second safety timer).
- [ ] Award 1.5x bonus coins and "Strict Focus" badge in `SessionResultModal.tsx` on completion.

## Phase 16: Auto Sessions (Scheduled & Recurring Focus)
- [ ] Build schedule engine for recurring focus routines (e.g., Workday, Deep Study, Nighttime).
- [ ] Implement Android `AlarmManager` / background triggers to automatically start and stop focus sessions.
- [ ] Create UI for managing schedules: day-of-week pickers, time ranges, and associated blocklists.
- [ ] Ambient background transitions and status handling when auto sessions trigger.

## Phase 17: Advanced Analytics & Deep Insights
- [ ] Expand SQLite schema to track granular session records, hourly distributions, and blocked attempt counts.
- [ ] Build rich data visualizations on the Progress tab (weekly/monthly trend charts, daily focus breakdowns).
- [ ] Distraction metrics: track which apps were blocked most frequently and total bypass attempts thwarted.
- [ ] Milestone summaries: average session duration, most productive hours, and streak health.

## Phase 18: Notifications & Ambient Reminders
- [ ] Research and implement local notifications logic for auto-sessions and streak alerts.
- [ ] Set up notification permissions and dedicated Android notification channels.
- [ ] Integrate smart reminders based on user habits and scheduled focus times.

## What we are yet to do
- [ ] Add Premium features / Pro Wall.

