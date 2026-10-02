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

# Design Principles

Lockout is a productivity and focus application. The interface must respect the user's intent to disconnect from distractions.
- **Calm & Focused:** Avoid visual noise, excessive animations, and cluttered dashboards.
- **Clear Hierarchy:** The most important action (starting a session) should always be immediately obvious.
- **Honest UI:** Do not use fake data to make the UI look populated. If there is no data, use a well-designed empty state.
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
- **Between Cards:** Use `mb-4`.
- **Inside Cards:** Use `p-6` for standard card padding.
- **Small Gaps:** Use `gap-3` or `gap-4` in flex rows for buttons and icons.

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

# Colour

Colors must **always** be referenced via Tailwind semantic tokens (e.g., `bg-surface`, `text-accent`) or the `useTheme()` hook. **Never hardcode hex values in components.**

### Semantic Palette
- **`bg-surface`:** The absolute background of the app.
- **`bg-surfaceElevated`:** Used for cards, buttons, modals, and any element resting on top of the surface.
- **`text-text`:** High-contrast primary text.
- **`text-textSecondary`:** Muted text for descriptions and metadata.
- **`colors.accent`:** The primary brand color (a calm, desaturated red/rose). Used sparingly for active states, primary icons, and emphasis.
- **`colors.accentMuted`:** Used for highlighting backgrounds behind accent-colored text/icons.
- **`colors.warning`:** Used for strict-mode warnings and locks.
- **`colors.success`:** Used for positive reinforcement (e.g., completed sessions).

---

# Components

### Cards
Cards are the primary container for data.
- **Pattern:** `<View className="bg-surfaceElevated rounded-3xl p-6 mb-4">`
- **Usage:** Grouping distinct statistics or settings.
- **Avoid:** Nesting cards inside cards.

### Buttons
- **Primary Pill Buttons:** `<Pressable className="bg-surfaceElevated rounded-full px-5 py-3 flex-row items-center justify-center">`
- **Icon Buttons (Nav):** `<Pressable className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center">`
- **Interaction:** All buttons must have `active:opacity-70` for press feedback.

### List Items
- **Pattern:** `flex-row items-center justify-between mb-4`
- **Leading Element:** Usually a 40x40 circular container `w-10 h-10 rounded-full bg-surface items-center justify-center` containing an Ionicons icon.
- **Text Body:** `flex-1` with a `text-base` title and a `text-xs` subtitle.

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

1. **Generic AI Aesthetics:** Do not use random neon colors, generic violet/indigo themes, glowing elements, or heavy gradients. Lockout's palette is flat, calm, and grounded.
2. **Glassmorphism:** Do not use blur-backs or frosted glass layers. We rely on solid color elevation (`bg-surfaceElevated`).
3. **Heavy Shadows:** Do not use drop shadows for elevation. Lockout is a flat design system.
4. **God Components:** Do not put complex permission checking, native module interactions, and UI rendering into a single `.tsx` file. Extract logic into custom hooks (e.g., `useSessionController.ts`).
5. **Hardcoded Inline Colors:** Never write `color="#F7F5F4"`. Always use `colors.background` from `useTheme()`.
6. **Fake Dashboards:** Never generate fake statistics or charts just to make a screen look "finished." Build the correct empty state instead.
7. **Redundant UI Variations:** If you need a card header, use the existing `text-[11px] uppercase tracking-widest` pattern. Do not invent a new header style.

---

# Reuse Before Creating

Before building a new UI component, follow this exact flowchart:
1. Does this pattern already exist in `src/features/` or `src/components/`?
2. If yes, **reuse it**.
3. If it almost fits, **extend it** gracefully.
4. If it genuinely cannot support the requirement, **create it**, but ensure it perfectly matches the `DESIGN_PATTERNS.md` rules above.
