# Lockout — AI Agent Guidelines

## Project Context

Lockout is a mobile focus/productivity application built with React Native and Expo.

The product helps users intentionally start focused sessions and block distracting applications for the duration of those sessions.

Build Lockout like a real production mobile application, not like a collection of isolated demo screens.

Every change should consider:

- User goals and mental models
- Complete user flows
- Existing architecture
- Visual consistency
- Interaction quality
- Loading, empty, error, and permission states
- Accessibility
- Performance
- Platform conventions
- Maintainability
- MVP scope

Do not optimize one screen while making the overall product experience worse.

---

# Expo SDK 57

- This project uses Expo SDK 57.
- Expo APIs are version-sensitive.
- Before implementing Expo-specific functionality, consult the exact SDK 57 documentation:
  https://docs.expo.dev/versions/v57.0.0/
- Do not blindly use APIs from newer Expo SDK versions.
- Check the currently installed package versions before changing Expo functionality.
- Do not install dependencies without checking Expo SDK 57 compatibility.

---

# Tech Stack

- Framework: React Native with Expo SDK 57
- Routing: Expo Router
- Styling: NativeWind / Tailwind CSS
- Language: TypeScript
- Platform: Android-first for core blocking functionality

---

# How You Should Work

## 1. Understand Before Changing

Before modifying code, inspect the relevant existing implementation.

Understand:

- Navigation structure
- Existing screens
- Existing components
- Existing design system
- `Color.ts`
- `globals.css`
- Theme/dynamic color implementation
- State management
- Session logic
- Blocking logic
- Native integrations
- Reusable UI patterns
- Existing hooks and utilities

Do not introduce a new pattern when an existing project pattern already solves the problem.

Do not rewrite unrelated code.

Do not make speculative architectural changes.

Prefer the smallest clean change that solves the actual problem.

---

# Product Before Pixels

For meaningful feature or screen changes, think about the product flow before writing UI.

Consider:

1. What is the user's goal?
2. What should happen before this screen?
3. What should happen after this screen?
4. What is the primary action?
5. What information does the user actually need?
6. What happens when there is no data?
7. What happens while something is loading?
8. What happens when something fails?
9. What happens when permissions are missing?
10. What happens when the user cancels or leaves?

A screen is not successful merely because it looks good.

It must have a clear purpose within the complete product experience.

---

# Use the Installed UX/Product Skills

When relevant, use the installed skills:

- `mobile-ui-ux-designer`
- `product-design-and-ux`
- `product-management`
- `software-ux-research`

Use them together where appropriate.

### mobile-ui-ux-designer

Use for:

- Mobile UI/UX
- Interaction design
- Screen hierarchy
- Touch interactions
- Accessibility
- Motion
- Mobile-specific patterns
- Screen states

### product-design-and-ux

Use for:

- Information architecture
- Navigation
- User journeys
- Task flows
- Onboarding
- State/recovery models
- Feature structure

### product-management

Use for:

- MVP decisions
- Prioritization
- Feature scope
- Product tradeoffs
- Avoiding unnecessary complexity

### software-ux-research

Use for:

- Usability
- User behavior
- UX friction
- Confusing interactions
- Validation and UX reasoning

Do not use these skills merely to justify visual changes.

Use them to make better product decisions.

---

# Production UX Standard

Lockout should feel like a mature consumer mobile application.

Do not create generic AI-generated UI.

Avoid:

- Generic indigo/violet/purple AI aesthetics
- Random gradients
- Neon colors
- Excessive glassmorphism
- Excessive cards
- Excessive rounded containers
- Decorative elements with no purpose
- Fake dashboard metrics
- Gratuitous animations
- Excessive shadows
- Visual noise
- Generic template-like layouts
- Robotic or corporate copy

Premium does not mean:

- Gradients everywhere
- Glassmorphism everywhere
- Glowing elements
- Excessive animations
- Huge typography
- More decoration

The visual language should feel intentional, calm, focused, mature, and distinctive.

---

# Color System

## Single Source of Truth

Colors MUST follow the existing project color system.

The primary sources of truth are:

- `Color.ts`
- `globals.css`
- Existing dynamic/theme color configuration

Do not invent colors inside individual components.

Do not hardcode hex/rgb/hsl colors in screens or components unless there is an exceptional technical reason.

If a new semantic color is required:

1. Add it to the central color system.
2. Define appropriate theme values.
3. Use the semantic token throughout the UI.
4. Check contrast.
5. Keep the naming reusable and meaningful.

Never create one-off colors for a single component.

## Dynamic Colors / Themes

Respect the existing dynamic color system.

All UI must work correctly with the project's supported themes.

Always consider semantic roles such as:

- Background
- Surface
- Elevated surface
- Primary text
- Secondary text
- Muted text
- Border
- Accent
- Accent foreground
- Success
- Warning
- Destructive
- Overlay/scrim

Do not communicate important information through color alone.

---

# Styling

## NativeWind First

Use NativeWind/Tailwind utilities through `className` as the default styling approach.

Avoid `StyleSheet.create` unless absolutely necessary, such as:

- Complex dynamic native styles
- Reanimated requirements
- APIs that cannot use NativeWind
- Platform-specific native requirements

Do not mix styling approaches unnecessarily.

Reuse existing tokens and patterns.

---

# Typography

Use the existing typography system where available.

Typography should provide clear hierarchy.

Avoid:

- Too many font sizes
- Random font weights
- Excessively large headings
- Tiny secondary text
- Long text inside cramped components

Use sentence case unless an existing product convention requires otherwise.

UI copy should be:

- Short
- Clear
- Human
- Action-oriented
- Consistent with Lockout's tone

---

# Layout & Spacing

Use the existing spacing system.

Prefer existing tokens/patterns instead of arbitrary values.

Layouts must account for:

- Safe areas
- Different screen sizes
- Dynamic text sizes
- Long labels
- Keyboard behavior
- System UI
- Appropriate platform behavior

Avoid brittle absolute positioning unless genuinely necessary.

Do not design only for the device currently being tested.

---

---

# Navigation & Information Architecture

Navigation should reflect the user's mental model.

Do not add navigation destinations simply because they are technically possible.

Before adding a new route, determine:

- What user problem does it solve?
- Is it a primary destination or secondary screen?
- Does an existing screen already serve this purpose?
- Where does it belong in the current information architecture?

Avoid duplicate destinations.

Back navigation must be predictable.

The primary navigation should remain intentionally simple.

Current product direction:

- Home
- Apps
- Progress

Settings should remain a secondary/settings destination rather than becoming a primary bottom-tab destination.

---

# Core Lockout Flow

The primary experience is:

Start Session
→ Check Required Permissions
→ Configure Session
→ Start Session
→ Active Focus Session
→ Block Distracting Apps
→ Complete Session
→ Session Result
→ Progress / History

New features should fit naturally into this flow.

Do not optimize an individual screen while breaking the surrounding experience.

---

# Session UX

The active session is the core experience of Lockout.

It should clearly communicate:

- Session is active
- Remaining time/progress
- Blocking is active
- What the user can do
- How the user can intentionally end the session

Ending a session early should be deliberate but respectful.

Do not use manipulative or punitive UX.

Do not add passcodes, excessive lock mechanisms, or artificial friction unless explicitly required by a product decision.

Destructive actions should be understandable before the user performs them.

---

# Screen States

Every meaningful screen should be considered in relevant states.

At minimum consider:

- Loading
- Normal/content
- Empty
- Error
- Disabled
- Permission missing
- Permission granted
- Saving
- Success
- Partial/incomplete
- Unavailable/offline where relevant

Do not design only the happy path.

Do not use fake data to make unfinished functionality appear complete.

If real data does not exist yet, represent the appropriate empty/unavailable state.

Never invent statistics, history, achievements, or activity just to make the UI look populated.

---

# Interaction Design

Interactive elements must have clear and predictable behavior.

Consider:

- Press feedback
- Disabled state
- Loading state
- Success state
- Error state
- Confirmation for destructive actions
- Haptic feedback where appropriate
- Keyboard behavior
- Back behavior
- Gestures
- Focus behavior

Animations should have a purpose.

Use motion to:

- Communicate state
- Provide feedback
- Establish hierarchy
- Make transitions feel natural

Do not animate something simply because you can.

Respect reduced-motion preferences where applicable.

---

# Accessibility

Accessibility is a production requirement.

For interactive elements, consider:

- `accessibilityRole`
- `accessibilityLabel`
- `accessibilityHint`
- `accessibilityState`
- Touch target size
- Dynamic text sizing
- Screen reader clarity
- Color contrast
- Non-color state indicators

Do not make important controls dependent on color alone.

Do not make text unreadable to preserve a visual layout.

---

# Android Native Capabilities

Lockout requires Android system integrations for its core blocking experience.

Relevant capabilities include:

1. Usage Access
   - Determine which application is currently in the foreground.

2. System Alert Window
   - Display the blocking overlay above distracting applications.

3. Foreground Service / appropriate background execution
   - Maintain reliable session/blocking behavior.

4. Battery optimization handling
   - Use only when genuinely necessary.

Native functionality must remain separated from presentation UI.

Prefer a clear bridge/API between React Native and native Android functionality.

Handle:

- Permission unavailable
- Permission revoked
- Service stopped
- App process restart
- Android lifecycle changes
- Background restrictions
- Native errors
- Device reboot where applicable

Do not claim native functionality works reliably until it has been tested on an actual development build/device.

---

# Expo Development Builds

Expo Go is not sufficient for functionality requiring custom native Android code.

Use Expo Prebuild and Development Builds when required.

Before changing native configuration:

- Inspect the current native setup.
- Determine whether native code is actually required.
- Avoid unnecessary native changes.
- Preserve existing native functionality.
- Verify the resulting development build.

Do not casually regenerate native projects if that could overwrite intentional changes.

---

# Performance

Treat mobile performance as a production requirement.

Avoid:

- Unnecessary re-renders
- Expensive calculations during render
- Unnecessary polling
- Memory leaks
- Large unoptimized lists
- Heavy JS-thread work
- Unnecessary animations
- Unnecessary object/function recreation

Use virtualization for large lists.

Use memoization when it solves a real performance issue.

Do not blindly add `useMemo` or `useCallback` everywhere.

---

# Async Operations

Async operations must have clear UI states.

For operations such as:

- Saving
- Starting a session
- Loading data
- Requesting permissions
- Updating settings

Consider:

- Loading feedback
- Preventing accidental duplicate actions
- Success feedback where useful
- Error handling
- Recovery

Never silently swallow important errors.

Do not expose raw technical errors to users.

---

# Error Handling

Errors should help the user recover.

Prefer:

"Usage access is required to block apps. Open Settings to enable it."

Instead of:

"Error: Permission denied."

Whenever possible, provide a clear next action.

Do not expose stack traces, native exceptions, or implementation details in production UI.

---

# Security & Privacy

Treat user data and permissions seriously.

Do not:

- Commit API keys or secrets
- Log sensitive information unnecessarily
- Request unnecessary permissions
- Add tracking without explicit product approval
- Store secrets in source code
- Collect data without a product reason

Request only the permissions required for the feature.

---

# Dependencies

Do not add dependencies casually.

Before installing a package:

1. Check whether the functionality already exists.
2. Check Expo SDK 57 compatibility.
3. Check native build implications.
4. Consider maintenance.
5. Consider bundle size.
6. Prefer established and maintained libraries.

If a dependency is unnecessary, do not add it.

---

# Do Not Invent Product Decisions

Do not silently invent important product behavior.

Follow existing decisions when they exist.

If a meaningful product decision is genuinely unclear, surface it before implementing it.

This especially applies to:

- Navigation
- Permissions
- Session behavior
- User data
- Destructive actions
- Core interactions
- New features
- Monetization

Do not add speculative features "for completeness."

---

# No Unrelated Changes

When implementing a feature or fixing a bug:

- Do not rewrite unrelated components.
- Do not rename files without a reason.
- Do not replace libraries without a reason.
- Do not change navigation unnecessarily.
- Do not modify working native code without understanding it.
- Do not change the visual identity accidentally.

Keep changes focused and reviewable.

---

# Visual Review Before Completion

Before considering a UI task finished, inspect the result as a real user would.

Ask:

- Is the primary action obvious?
- Is the hierarchy clear?
- Is the layout balanced?
- Is spacing consistent?
- Does it feel like the same Lockout product?
- Are colors coming from the central design system?
- Does light/dark mode work?
- Are realistic text lengths handled?
- Are loading/error/empty states handled?
- Are touch targets comfortable?
- Are animations useful?
- Does anything feel generic or AI-generated?
- Is there unnecessary decoration?
- Does the screen make sense within the complete user flow?

A screen that compiles is not necessarily finished.

A screen that looks attractive is not necessarily good UX.

---

# Validation Before Completion

Before declaring a task complete:

1. Review all modified files.
2. Check TypeScript errors.
3. Check lint/build issues where available.
4. Check imports and unused code.
5. Verify navigation behavior.
6. Verify relevant states.
7. Verify theme behavior.
8. Verify accessibility.
9. Verify no unnecessary hardcoded colors.
10. Verify no unnecessary dependency was introduced.
11. Verify existing functionality still works.
12. If native functionality changed, verify it on a development build/device.

Do not declare success solely because the application compiles.

---

# Production Mindset

Work like a senior product engineer building a real shipped application.

Always:

- Understand before changing.
- Think about the complete flow.
- Design product behavior before polishing pixels.
- Reuse existing patterns.
- Prefer simple solutions.
- Protect existing functionality.
- Handle real-world states.
- Respect platform behavior.
- Treat accessibility as a requirement.
- Treat performance as a requirement.
- Treat visual consistency as a requirement.
- Avoid fake data.
- Avoid unnecessary dependencies.
- Avoid speculative features.
- Avoid generic AI-generated aesthetics.
- Avoid complexity without user value.

The goal is not to produce the most code or the most visually elaborate interface.

The goal is to make Lockout feel like a **coherent, intentional, reliable production mobile product that users would trust every day.**

---

# Definition of Done

A task is complete only when:

- The requested functionality works.
- The implementation fits the existing architecture.
- The UX makes sense within the complete product flow.
- Relevant states are handled.
- The UI follows the central design system.
- Colors follow `Color.ts`, `globals.css`, and the dynamic theme system.
- Accessibility has been considered.
- Performance has been considered.
- No unnecessary dependencies were introduced.
- No unrelated functionality was broken.
- TypeScript/lint/build issues are addressed where applicable.
- Native functionality is verified when relevant.
- The final result looks and behaves like part of a real production application.