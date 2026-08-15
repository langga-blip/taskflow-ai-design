<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bcd5e76b-c5c4-4735-bc71-ca74e5ffeed5

## Android APK (matches AI Studio preview)

The Android app is a **WebView shell** that loads the **full React UI** from Google AI Studio (not the old simplified Compose screens).

CI builds the Vite app into `app/src/main/assets/www/` and packages it into the APK. The APK will be larger (often well over 40 MB once assets are included) because it contains the real product UI.

**Local Android build:**

1. `npm install`
2. `npx vite build`
3. `mkdir -p app/src/main/assets/www && cp -R dist/. app/src/main/assets/www/`
4. Open in Android Studio and run, or `./gradlew assembleDebug`

**Note:** `/api/*` calls need your backend (`npm run dev` / deployed server). Without a server, the UI still loads fully; AI endpoints use built-in fallbacks.

## Run web app locally

**Prerequisites:** Node.js 20+

1. `npm install`
2. Create `.env` with `GEMINI_API_KEY=...` (see `.env.example`)
3. `npm run dev` — opens the same experience as AI Studio

## Run in Android Studio only

1. Open this project in Android Studio
2. Ensure web assets exist under `app/src/main/assets/www/` (run the local Android build steps above if empty)
3. Run on an emulator or device
