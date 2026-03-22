# MyNaksh – Chat Screen (Machine Coding Assignment)

A premium astrology chat screen built with React Native New Architecture, featuring gesture-driven micro-interactions, smooth UI-thread animations, and AI feedback flows.

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| React Native | 0.83.2 | Core framework (New Architecture) |
| Expo | ~55.0.8 | Build tooling |
| expo-dev-client | ~55.0.18 | Custom dev build (required for Reanimated 4) |
| react-native-reanimated | 4.2.1 | All animations (UI thread worklets) |
| react-native-worklets | 0.7.4 | Worklet runtime (pinned — see note below) |
| react-native-gesture-handler | ^2.30.0 | Swipe + long-press gestures |
| @react-native-community/blur | ^4.4.1 | Blur overlay on End Chat screen |
| zustand | ^5.0.12 | Lightweight state management |
| react-native-safe-area-context | ~5.6.2 | SafeAreaProvider wrapping root app |

> ⚠️ **Worklets version is pinned to exactly `0.7.4`** (no `^` caret). Reanimated 4.2.1 is incompatible with Worklets 0.8.x. Do not upgrade without checking the [compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/#supported-react-native-worklets-versions).

---

## Prerequisites

### Android
- Android Studio installed
- Android SDK installed (via Android Studio → SDK Manager)
- `ANDROID_HOME` environment variable set
- Emulator running **or** physical device with USB debugging enabled

Add to `~/.zshrc` or `~/.bash_profile` if not already set:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
Then run `source ~/.zshrc`.

Verify your device is detected:
```bash
adb devices
```

### iOS (Mac only)
- Xcode installed from the App Store
- Xcode Command Line Tools: `xcode-select --install`
- iOS Simulator available

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Prebuild native folders

This generates the `android/` and `ios/` directories from the Expo config:

```bash
npx expo prebuild --clean
```

### 3. Run the development build

**Android:**
```bash
npx expo run:android
```

**iOS:**
```bash
npx expo run:ios
```

> You only need to re-run these commands when native dependencies change. All subsequent JS/component changes hot-reload automatically.

---

## Troubleshooting

### Worklets version conflict
If you see `assertWorkletsVersionTask FAILED`, your `react-native-worklets` has been upgraded past `0.7.x`. Fix:
```bash
rm -rf node_modules package-lock.json
npm install
cd android && ./gradlew clean && cd ..
npx expo run:android
```
Make sure `package.json` has `"react-native-worklets": "0.7.4"` — no `^` prefix.

### Babel / bundle errors
```bash
npx expo start --clear
```

### Gradle build cache issues
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

---

## Features Implemented

### Part A: Message Interactions

#### ✅ Swipe-to-Reply
- Swipe any message bubble rightward to trigger a reply.
- Reply icon animates in using `interpolate` as the user drags.
- On release, the bubble springs back via `withSpring` on the UI thread.
- A "Replying to…" preview bar appears above the message input showing sender and message preview.
- Tap ✕ to clear the reply state.

#### ✅ Long-Press Emoji Reactions
- Long-press any message bubble (450ms) to reveal the emoji picker bar.
- Each emoji button animates in with staggered `withDelay` + `withSpring`.
- Selecting an emoji attaches it as a badge below the bubble.
- Tapping the same emoji again toggles it off.

---

### Part B: AI Feedback & Session Flow

#### ✅ Like / Dislike Feedback
- Like/Dislike toggle shown only on `ai_astrologer` messages.
- Tapping Dislike animates the feedback chip row open using `LayoutAnimation`.
- Available chips: **Inaccurate**, **Too Vague**, **Too Long**.
- Selecting a chip updates local Zustand state and shows a "Thanks for letting us know" confirmation.

#### ✅ End Chat + Star Rating
- "End Chat" button in the header.
- Full-screen overlay animates in with `FadeIn` + `SlideInDown` (Reanimated layout animations).
- `BlurView` backdrop from `@react-native-community/blur` with a dark fallback.
- 5-star rating component — each star has an individual spring bounce on tap.
- `Alert` fires after star selection confirming the rating is captured.

---

## Architecture Decisions

### Reanimated 4 — UI Thread Worklets

All animations use `useSharedValue` + `useAnimatedStyle` worklets that execute **entirely on the UI thread**, bypassing the React/JS bridge:

```js
// Swipe translation — runs on UI thread, zero JS involvement
const bubbleAnimStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));

// Reply icon opacity derived from swipe distance via interpolate
const replyIconStyle = useAnimatedStyle(() => ({
  opacity: replyIconOpacity.value,
  transform: [
    { scale: interpolate(replyIconOpacity.value, [0, 1], [0.6, 1]) },
  ],
}));
```

`runOnJS` is used **only at gesture completion boundaries** to cross back to the JS thread and update Zustand state — never during active gesture updates.

### Gesture Handling

- `Gesture.Pan()` with `activeOffsetX([8, 9999])` ensures the gesture only activates on deliberate rightward swipes, preventing conflict with `FlatList` vertical scrolling.
- `failOffsetY([-12, 12])` cancels the pan gesture automatically if the user scrolls vertically.
- `Gesture.LongPress()` with `minDuration(450)` is composed with pan using `Gesture.Simultaneous()`, so both can coexist on the same view without interference.
- All gesture callback logic runs on the UI thread; `runOnJS` is the only bridge to JS state updates.

### Why gesture logic runs on the UI thread

React Native's JS thread handles business logic, React re-renders, and network I/O. Routing animation updates through it means any JS jank (GC pauses, heavy re-renders) directly drops animation frames. By keeping `useAnimatedStyle` and gesture handlers in worklets on the UI thread, swipe and spring animations remain at a consistent 60–120fps regardless of JS load.

### State Management — Zustand

Zustand was chosen over Redux or Context because:
- **Zero boilerplate** — no action creators, reducers, or dispatch needed.
- **Selector-based subscriptions** — components only re-render when their specific slice changes.
- **Minimal surface area** — the entire store is ~50 lines in one file.
- Works naturally with React Native's re-render model and Reanimated's worklet boundaries.

The store manages: `messages`, `replyTo`, `reactions` (per-message emoji), and `feedbackChips` (per-message dislike chip selection).

---

## Project Structure

```
mynaksh/
├── App.js                          # Root entry point
├── app.json                        # Expo config (newArchEnabled, dev-client plugin)
├── babel.config.js                 # Babel config with reanimated/plugin last
├── package.json                    # Dependencies (worklets pinned to 0.7.4)
└── src/
    ├── store/
    │   └── chatStore.js            # Zustand store
    ├── data/
    │   └── mockMessages.js         # Initial 6-message mock payload
    ├── screens/
    │   └── ChatScreen.jsx          # Header, FlatList, ReplyPreview, TextInput
    └── components/
        ├── MessageBubble.jsx       # Swipe-to-reply, long-press, emoji bar, AI feedback
        ├── ReplyPreview.jsx        # "Replying to…" strip above input
        ├── EmojiReactionBar.jsx    # Staggered animated emoji picker
        ├── AIFeedback.jsx          # Like/Dislike + animated feedback chips
        ├── StarRating.jsx          # Spring-animated 5-star rating
        └── EndChatOverlay.jsx      # Blurred full-screen session-end modal
```

---

## AI Tool Usage

This project was developed with AI assistance (Claude). Per the assignment's AI-first disclaimer, here's what was AI-assisted vs. manually reasoned:

- **AI-assisted:** Boilerplate, styling, mock data wiring, component scaffolding.
- **Manually reasoned:** Gesture composition strategy (`Simultaneous` vs `Exclusive`), `activeOffsetX` / `failOffsetY` tuning to prevent scroll conflicts, `runOnJS` placement decisions, Reanimated 4 + Worklets version pinning fix.