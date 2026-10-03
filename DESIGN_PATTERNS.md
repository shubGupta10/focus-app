# Instructions for AI Agents

**CRITICAL RULES FOR ALL FUTURE AI AGENTS:**
1. **Read this file before changing UI/UX.** This is the definitive design source of truth for Lockout.
2. **Inspect the current implementation before modifying anything.** Use this document as your guide, but always verify how it looks in the real code.
3. **Reuse established patterns.** Do not create duplicate components or slightly different versions of existing UI elements.
4. **Do not introduce a new visual style** (e.g., Apple clones, Material clones, generic Dribbble concepts, glassmorphism, or neon gradients) without a strong, explicit product reason.
5. **Do not change established navigation/layout patterns casually.**
6. **Preserve existing product identity.** Lockout is intended to feel calm, focused, mature, and distinctive.
7. **When a requirement conflicts with this document,** identify the conflict and resolve it using the existing product context rather than silently inventing a new pattern.

---

# Design Principles (Material You MD3)

Lockout uses **Material You (MD3)** as its core design language, tailored for Android 13+.
- **Dynamic & Expressive:** UIs adapt to dynamic colors (if enabled) or use a consistent, harmonious semantic palette.
- **Tonal Elevation:** We do not use drop shadows. Elevation is expressed through surface color changes (e.g., `surface`, `surfaceContainerLow`, `surfaceContainerHigh`).
- **Rounded & Friendly:** Use large corner radii (e.g., 28dp for large cards, 16dp for medium elements, fully rounded pills for buttons).
- **Platform Respect:** Respect Android-first conventions, including 3-button navigation insets, predictable back-button behavior, and native safe areas.

---

# Layout & Spacing

Lockout uses a consistent, airy layout structure driven by Tailwind CSS (`NativeWind`).

### Screen Structure
- **Root Wrapper:** Every screen must be wrapped in a `SafeAreaView` with `flex-1 bg-surface`.
- **Horizontal Margins:** Use `px-6` for the main screen padding. Do not cramp content to the edges.
- **Top Spacing:** Page headers generally use `pt-5 pb-0` (or `pb-2` if detached).
- **Scrollable Content:** Use `ScrollView` with `contentContainerStyle={{ paddingBottom: 130 }}` to ensure content isn't hidden behind bottom tabs.

### Component Spacing (Vertical Rhythm)
- **Between Cards:** Use `mb-4` or `mb-6` to separate sections.
- **Inside Cards:** Use `p-5` or `p-6` for standard card padding to provide ample breathing room. Do not cramp text.
- **Small Gaps:** Use `gap-3` or `gap-4` in flex rows for buttons and icons.
- **Breathing Room Rule:** Never let UI elements feel cluttered. Use generous internal padding and distinct groupings (e.g., `rounded-3xl` cards) to keep cognitive load low. Always ensure there is space between a card and the horizontal divider above it (e.g., `mt-6`).

---

# Typography

Lockout relies exclusively on the **Inter** font family to maintain a stark, clean, and utilitarian look. We prioritize extreme contrast in font weights rather than introducing multiple font families.

### Type Hierarchy
- **Page Titles:** `text-text font-black text-3xl tracking-tight` (e.g., "Progress", "Lockout").
- **Section Headers (Inside Cards):** `text-textSecondary font-medium text-[11px] uppercase tracking-widest mb-6`. (This is the established pattern for naming distinct sections like "Recent Interceptions" or "All-Time Stats").
- **Card Big Metrics:** `text-text font-black text-2xl tracking-tight tabular-nums`.
- **List Item Titles:** `text-text font-medium text-base tracking-tight`.
- **Subtitles/Descriptions:** `text-textSecondary text-xs font-medium`.

### Rules
- Use `tabular-nums` for timers and live statistics to prevent jittering.
- Use `font-black` (weight 900) for primary emphasis and `font-medium` (weight 500) for standard text. Avoid regular weight unless explicitly necessary for dense reading.

---

# Colour (Material You MD3 Roles)

Colors must **always** be referenced via Tailwind semantic tokens (e.g., `bg-surface`, `text-primary`) or the `useTheme()` hook. **Never hardcode hex values in components.**

### MD3 Semantic Palette
- **`bg-surface`:** The absolute background of the app (Surface).
- **`bg-surfaceContainerLow` / `bg-surfaceContainer` / `bg-surfaceContainerHigh`:** Used for cards, dialogs, and elevated surfaces instead of drop shadows. (In Tailwind, mapped to `bg-surfaceElevated`).
- **`bg-accent` / `text-accent`:** Used for primary call-to-action buttons, FABs, and emphasis (corresponds to MD3 Primary).
- **`text-onSurface` / `text-onSurfaceVariant`:** High-contrast primary text and muted secondary text (Mapped to `text-text` and `text-textSecondary`).
- **`colors.accentMuted`:** Used for highlighting backgrounds behind primary-colored text/icons (corresponds to MD3 PrimaryContainer).
- **`colors.error`:** Used for strict-mode warnings, locks, and destructive actions.

---

# Components (Material You MD3)

### Cards & Containers
- **Pattern:** `<View className="bg-surfaceElevated rounded-3xl p-6 mb-4">`
- **MD3 Rules:** Cards should use large border radii (`rounded-3xl` roughly equals 24dp or 28dp). Do not use drop shadows. Rely entirely on tonal contrast between `bg-surface` and `bg-surfaceElevated`.
- **Avoid:** Nesting cards inside cards unnecessarily.

### Buttons (MD3 Shapes)
- **Primary Pill Buttons:** `<Pressable className="bg-primary rounded-full px-6 py-3.5 flex-row items-center justify-center">` (Fully rounded ends).
- **FAB (Floating Action Buttons):** Rounded rectangles (`rounded-2xl` / 16dp) instead of perfect circles, usually placed at bottom right.
- **Icon Buttons (Nav):** `<Pressable className="w-10 h-10 rounded-full items-center justify-center active:bg-surfaceVariant">`
- **Interaction:** All buttons must have `active:opacity-70` for press feedback (or use Ripple effects where possible).

### List Items (Flat)
- **Pattern:** `flex-row items-center justify-between py-3`
- **MD3 Rules:** Used for simple menus or bottom sheets.

### Grouped Settings Lists (MD3 / Modern)
- **Section Headers:** Placed outside the card. Use `<Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">`.
- **Card Container:** Wrap grouped items in a `<View className="bg-surfaceElevated rounded-3xl overflow-hidden p-5">`.
- **List Items (Row):** Use `flex-row items-center justify-between`.
- **Action Blocks (Stacked):** For important calls to action (like Review Permissions, Delete Data, Revisit Guide):
  - Stack the text/description on top with `mb-5`.
  - Align the action pill button to the bottom right using `self-end`.
  - Example button: `<Pressable className="bg-accent py-3 px-6 rounded-full self-end shadow-sm">`

### Bubbly App/List Cards
- **Pattern:** For scrollable lists that need breathing room (like the Blocklist), use individual cards for each item instead of flat rows.
- **Example:** `<Pressable className="bg-surfaceElevated rounded-[24px] p-4 mb-2.5">`.

---

# Mobile UX

- **Touch Targets:** Minimum 40x40 pixels for any interactive element. Icon buttons are strictly `w-10 h-10`.
- **Thumb Reach:** Critical actions (like starting the timer or selecting apps) are placed in the lower-middle or bottom of the screen.
- **Screen Density:** One-column layouts are the standard. Do not force two-column layouts on small screens unless building small numeric stat blocks (like the Progress cards).

---

# Navigation

- **Primary:** Expo Router bottom tabs (`(tabs)`).
- **Secondary:** Modals (for selection, permissions, session results) and pushed Stack screens (for Settings, Shop).
- **Rule:** Do not add primary bottom-tab destinations without explicit product approval. Settings and Shop belong in the Stack.

---

# Content & UX Writing

- **Tone:** Direct, human, calm. 
- **Rule:** Avoid corporate jargon or overly enthusiastic "gamified" language unless explicitly tied to the Coin economy.
- **Examples:** 
  - *Good:* "Stay in the zone", "No apps blocked recently"
  - *Bad:* "Awesome job! You crushed your goals!", "No data available."

---

# Empty / Loading / Error Patterns

### Empty States
- **Pattern:** Center-aligned content with a muted, outlined icon and a helpful, non-punitive message.
- **Example (Progress):** 
  ```tsx
  <View className="py-2 items-center">
      <Ionicons name="shield-outline" size={32} color={colors.textMuted} style={{ marginBottom: 12 }} />
      <Text className="text-textSecondary text-sm font-medium text-center">
          No distractions blocked recently
      </Text>
  </View>
  ```

### Error States
- Errors should always provide a recovery path. Do not expose raw native exceptions to the user.
- **Example:** "Usage access is required to block apps. Tap to enable."

---

# Shop / Rewards

*(Note: Currently in development phase)*
- **Visuals:** The shop should feel integrated, using `bg-surfaceElevated` for items.
- **Economy:** Coins are the singular currency. Do not invent secondary currencies or overly complex reward tiers.

---

# Anti-Patterns (WHAT NOT TO DO)

Future agents **MUST NOT** introduce these into the Lockout codebase:

1. **Generic AI Aesthetics:** Do not use random neon colors, generic violet/indigo themes, glowing elements, or heavy gradients.
2. **Glassmorphism:** Do not use blur-backs or frosted glass layers. We rely on solid color elevation (`bg-surfaceElevated`, `bg-surfaceContainerHigh`).
3. **Heavy Shadows:** Do not use drop shadows for elevation. Material You relies on tonal elevation (color shifts) rather than heavy drop shadows.
4. **God Components:** Do not put complex permission checking, native module interactions, and UI rendering into a single `.tsx` file. Extract logic into custom hooks (e.g., `useSessionController.ts`).
5. **Hardcoded Inline Colors:** Never write `color="#F7F5F4"`. Always use semantic colors from `useTheme()` (e.g. `colors.surface`, `colors.primary`).
6. **Fake Dashboards:** Never generate fake statistics or charts just to make a screen look "finished." Build the correct empty state instead.
7. **Redundant UI Variations:** If you need a card header, use the existing pattern. Do not invent a new header style.

---

# Reuse Before Creating

Before building a new UI component, follow this exact flowchart:
1. Does this pattern already exist in `src/features/` or `src/components/`?
2. If yes, **reuse it**.
3. If it almost fits, **extend it** gracefully.
4. If it genuinely cannot support the requirement, **create it**, but ensure it perfectly matches the `DESIGN_PATTERNS.md` rules above, specifically embracing Material You (MD3) principles.
