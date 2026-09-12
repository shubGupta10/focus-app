# Lockout — Future Product Vision & Planned Features

> **Source of Truth for Long-Term Product Direction**  
> This document preserves intentional product capabilities, future expansion areas, and exploratory concepts for **Lockout**.  
> 
> **Guiding Product Rule:**  
> **"Not implemented yet" does NOT mean "not wanted."**  
> When performing audits, reviews, or MVP scoping, features must be evaluated by roadmap timing, never deleted or marked as rejected simply because they are not part of the active development sprint.

---

## 1. Product Classification Taxonomy

All features in Lockout belong to one of four distinct categories:

| Category | Definition | Action in Current Sprint |
|:---|:---|:---|
| **1. Current MVP** | The essential core required to deliver a reliable, cohesive product experience today. | **Actively Building & Polishing** |
| **2. Future Product** | Valid, intentional features planned for subsequent development phases. | **Preserve & Architect For** |
| **3. Under Consideration** | Promising ideas requiring UX research, user validation, or technical feasibility checks before committing. | **Explore & Validate** |
| **4. Rejected** | Features explicitly evaluated and deliberately excluded by product decision. | **Do Not Build** |

> [!IMPORTANT]
> A feature must **never** be moved from *Future Product* → *Rejected* without an explicit, deliberate product decision. If a feature cannot be built now, **delay it**—do not erase its product intent.

---

## 2. Planned Future Features

### 1. Coin Shop & Rewards Economy
* **Status:** Planned — Not Implemented (Future Product)
* **Purpose:**  
  Transform accumulated focus time into tangible in-app value, closing the motivation loop so that focus leads to earned currency, which unlocks rewarding personalizations.
* **Core Product Concept:**  
  $$\text{Focus Session} \longrightarrow \text{Earn Coins} \longrightarrow \text{Bank Balance} \longrightarrow \text{Spend in Shop} \longrightarrow \text{Unlock Rewards}$$
* **Potential Reward Categories:**  
  - **Focus Orb Themes & Skins:** Custom visual treatments, serene palettes, ambient glow variations for the central focus orb.
  - **Soundscapes & Ambient Audio:** High-quality background white noise, binaural beats, rain, cafe, or deep drone audio loops for active sessions.
  - **Visual Personalization:** App icon alternatives, custom completion confetti/particles, bespoke card styles.
  - **Utility Rewards:** Occasional emergency streak freezes or special badge unlocks earned strictly through discipline.
* **Architecture Consideration:**  
  Coins must remain modeled as an actionable bank balance (`user_stats.total_coins` as available balance, tracking lifetime earned vs. current balance), not merely as a high-score counter.
* **Guardrail:**  
  Do not prematurely hardcode shop catalogs, pricing formulas, or monetization systems until core session retention is established.

---

### 2. Scheduled & Recurring Focus Sessions (Auto Sessions)
* **Status:** Completed (Phase 16)
* **Purpose:**  
  Remove the cognitive friction of remembering to start focus sessions every day by letting users automate recurring routines (e.g., "Workday Focus" 9:00 AM – 12:00 PM, "Evening Study" 7:00 PM – 9:00 PM).
* **Core Product Concept:**  
  - Day-of-week and time-of-day recurrence scheduler.
  - Distinct blocklists tied to specific routines (e.g., Work blocklist vs. Bedtime blocklist).
  - Ambient pre-session warning notifications giving users 5 minutes to wrap up before blocking activates.
* **Dependencies & Considerations:**  
  - Android `AlarmManager` / `WorkManager` background scheduling.
  - Ensuring foreground service reliability across OEM device reboot and power saving modes.

---

### 3. Granular Session History & Activity Log
* **Status:** Planned (Phase 17)
* **Purpose:**  
  Provide an honest, transparent record of past focus sessions so users can reflect on when and how long they were genuinely locked in.
* **Core Product Concept:**  
  - Scrollable, reverse-chronological log of completed and aborted sessions.
  - Session metadata: start timestamp, exact duration, mode (Strict vs. Standard), coins earned, and completion status.
  - Search or date filtering to quickly inspect past weeks.
* **Dependencies & Considerations:**  
  - The SQLite `sessions` table already records `start_time`, `end_time`, `duration_seconds`, `is_completed`, `coins_earned`, and `is_strict`. This data is ready to be exposed in a dedicated history view.

---

### 4. Advanced Progress Analytics & Habit Insights
* **Status:** Planned (Phase 17)
* **Purpose:**  
  Expand the Progress tab from a simple "today" snapshot into meaningful long-term behavioral insights that foster pride and self-awareness.
* **Core Product Concept:**  
  - **Weekly & Monthly Trend Visualizations:** Interactive bar charts showing focus hours day-by-day.
  - **Distraction Metrics:** Total number of blocked app opening attempts thwarted by the native overlay.
  - **Peak Focus Hours:** Heatmaps showing which time of day the user is most disciplined.
  - **Streak Health:** Visual calendar history showing active days vs. rest days.
* **Dependencies & Considerations:**  
  - SQLite aggregate queries over `sessions` and future blocked attempt logs.
  - Clean, performant chart rendering compatible with NativeWind and Android dark/light themes.

---

### 5. Smart Notifications & Habit Reminders
* **Status:** Planned (Phase 18)
* **Purpose:**  
  Keep users accountable to their goals with ambient, respectful prompts that protect streaks without becoming spammy or manipulative.
* **Core Product Concept:**  
  - Streak preservation reminders (e.g., "Keep your 5-day streak alive with a 15m evening session").
  - Auto-session countdown alerts.
  - Daily/weekly productivity milestone recaps.
* **Dependencies & Considerations:**  
  - Dedicated Android notification channels with high-priority importance.
  - Notification permissions (Android 13+ `POST_NOTIFICATIONS`).

---

### 6. Premium Features & Pro Tier
* **Status:** Planned / Future
* **Purpose:**  
  Provide a sustainable monetization path for power users wanting advanced customization, unlimited scheduling routines, and cloud sync.
* **Core Product Concept:**  
  - Free Tier: Core blocking, basic presets, daily streaks, coin earning.
  - Pro Tier: Unlimited auto-schedules, deep analytics history, exclusive shop rewards, cloud backup.
* **Dependencies & Considerations:**  
  - Expo In-App Purchases / RevenueCat integration.

---

## 3. Features Under Consideration

### 1. Weekly Emergency Skip Controls (Strict Mode Refinement)
* **Status:** Under Consideration / Iteration (Phase 15)
* **Concept:**  
  Strict Mode requires intense psychological commitment, but real life occasionally requires genuine emergency overrides (urgent bank 2FA, family emergency).  
  Exploring a controlled, non-abusable emergency escape mechanism (e.g., 1 weekly skip renewing every Monday, paired with deliberate confirmation friction) without weakening the strict contract.

### 2. Focus Soundscapes Player
* **Status:** Under Consideration
* **Concept:**  
  An integrated, low-latency audio player within `ActiveSessionUI` providing brown noise, rain, or binaural tones that automatically play during an active session and pause on completion.

---

## 4. How to Use This Document in Future Audits

Whenever reviewing Lockout's architecture, UX, or feature roadmap:

1. **Check this document first** before recommending the removal or simplification of any subsystem.
2. **Protect the Currency & Rewards Vision:** Recognize that coins are an intentional gamification currency intended for future rewards, not an arbitrary score.
3. **Separate Scope from Validity:** When focusing on MVP tasks, frame future items as *"Preserved for Phase X"*, never as *"Not viable / Rejected"*.
4. **Maintain Database Readiness:** Keep SQLite schemas, repositories, and types extensible so future features (like shop balances and session logs) build cleanly upon existing foundations.
