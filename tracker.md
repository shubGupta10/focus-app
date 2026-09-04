# Focus App Progress Tracker

## What we have done till now
- [x] Initialized Expo SDK 57 project with NativeWind.
- [x] Created Expo Local Module (`focus-blocker`).
- [x] Hooked up UsageStats permission to detect foreground apps.
- [x] Hooked up System Alert Window permission for overlays.
- [x] Hooked up Battery Optimization permission to keep the app alive.
- [x] Created `FocusService.kt` (Android Foreground Service) to loop in the background.
- [x] Built the MVP background engine that detects YouTube and launches the Focus app.

## What we are doing
## Phase 5: The React Native UI (Gamified & Scalable Structure)
- [x] Set up the Custom Hook (`src/hooks/useFocusEngine.ts`)
- [x] Make the app full-screen & premium (`src/app/_layout.tsx`)
- [x] Build the Floating Modals
- [x] Build the UI Components
- [x] Wire everything up in `src/app/index.tsx`
- [x] Implement persistent storage (AsyncStorage) so the user doesn't have to re-select apps every time.

## Phase 6: The Block Screen Pivot
- [x] Strip `WindowManager` code from `FocusService.kt`.
- [x] Implement `launchBlockScreen()` to launch React Native Activity.

## Phase 6.1: The Deep Link Architecture
- [x] Speed up `FocusService.kt` latency (2000ms -> 500ms).
- [x] Update `launchReactApp` to launch `focus://block` deep link.
- [x] Create `src/app/block.tsx` with the scary UI and "GO HOME" button.
- [x] Update `ActiveSessionUI.tsx` (Main App) to only show "End Session".

## Phase 7: The Native Overlay Revival
- [x] Delete `block.tsx` to remove deep link complexity.
- [x] Implement `showBlockOverlay` in Kotlin with a gorgeous full-screen UI.
- [x] Update `FocusService` loop to Auto-Hide the overlay when on the home screen.

## Phase 8: The Dual Timer Engine
- [x] Add `durationMs` to the Native Bridge (`FocusBlockerModule.kt` & `.ts`).
- [x] Update `FocusService.kt` loop to auto-kill the service when time is up.
- [x] Build the `TimerSelectionModal.tsx` for preset durations.
- [x] Wire up `useFocusEngine.ts` to track and format the MM:SS timer.
- [x] Update `ActiveSessionUI.tsx` to display the live timer.

## Phase 9: Premium Design System (Calm Nature)
- [ ] Implement Light/Dark mode via `global.css` and `colors.ts`.
- [ ] Convert all UI components to use semantic tokens (`bg-background`, `text-text`, etc).
- [ ] Remove hardcoded colors.

## What we are yet to do
- [x] Implement the App Categorization logic (Phase 3).
- [x] Implement persistent storage (SQLite).
- [ ] Build the final sleek, premium NativeWind UI (Home Screen, Settings).
- [x] Pass the session state and blocked apps list from React Native to the Kotlin Engine.
- [ ] Build the final sleek, premium NativeWind UI (Home Screen, Settings).
