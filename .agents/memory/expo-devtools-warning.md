---
name: Expo DevTools warning
description: A non-blocking missing-GLib error seen while starting the Expo workflow in this workspace.
---

The Expo workflow can report a React Native DevTools installation error because `libglib-2.0.so.0` is unavailable in the container. Metro may still start, provide an Expo Go QR code, and render the app preview.

**Why:** The missing library affects the optional debugger shell, not necessarily the app bundle or Metro server.

**How to apply:** If this exact warning appears, first confirm Metro is running and the app route loads. Do not change app dependencies just to silence it unless DevTools itself is needed.
