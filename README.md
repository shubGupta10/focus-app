# Lockout

Lockout is a premium, distraction-blocking focus application for Android. Built with React Native and Expo, Lockout helps you reclaim your time by intentionally starting focused sessions and natively blocking distracting applications.

## Screenshots

| Home / Focus Orb | Active Session | Distraction Blocker |
| :---: | :---: | :---: |
| <img src="./assets/screenshots/Screenshot_initial_black.png" width="240" alt="Home" /> | <img src="./assets/screenshots/Screenshot_timer_running_black.png" width="240" alt="Active Session" /> | <img src="./assets/screenshots/ScreenShot_blocker.jpg" width="240" alt="Distraction Blocker" /> |

| Global Blocklist | Statistics & Streaks | Customization Shop |
| :---: | :---: | :---: |
| <img src="./assets/screenshots/Screenshot_apps_black.png" width="240" alt="Global Blocklist" /> | <img src="./assets/screenshots/Screenshot_progress_black.png" width="240" alt="Statistics" /> | <img src="./assets/screenshots/Screenshot_shop_black.png" width="240" alt="Shop" /> |

## Features

- **Focus Sessions:** Set dedicated focus timers or use the open-ended "Flow State" mode to track your productivity.
- **Native App Blocking:** Uses Android Usage Access to forcefully block distracting applications (like social media or shopping apps) while you are in a session.
- **Strict Mode:** Lock yourself in. When enabled, you cannot exit the session until the timer completes (with limited emergency skips).
- **Coin System & Shop:** Earn coins for every minute of focus. Spend them in the shop to unlock new cosmetic orb themes and animations.
- **Detailed Statistics:** Track your daily focus time, session counts, and longest streaks to build healthy habits.
- **Beautiful UI:** A dark-mode first, glassmorphic design featuring custom typography, dynamic animations, and haptic feedback.

## Setup & Installation

Because Lockout uses native Android permissions (Usage Access, System Alert Window, and Foreground Services) for its core blocking functionality, it **cannot** be run in the standard Expo Go app. You must compile a development build.

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the native Android app**
   ```bash
   npx expo prebuild --clean
   npm run android
   ```
   *This command will compile the Kotlin services and launch the app on your emulator or connected device.*

## Tech Stack

- **Framework:** React Native + Expo (SDK 57)
- **Language:** TypeScript & Kotlin (for native Android services)
- **Styling:** NativeWind (Tailwind CSS)
- **Database:** SQLite (expo-sqlite)
- **State Management:** Zustand
