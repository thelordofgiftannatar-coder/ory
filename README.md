# Skeletor Video

A dark, local-first media player based on the supplied THE WITCHER.apk player interface, rebranded with the supplied Skeletor artwork.

## Features
- Local video and music library with file/folder import
- Playlists, search, folders, sorting, playback speed, seek and repeat/shuffle controls
- Android APK build and Windows 11 desktop build from the same web player
- Windows file associations for common video/audio formats (open a media file with Skeletor Video)
- Android VIEW intent filters for common video/audio MIME types

## Build from GitHub
1. Create a new GitHub repository and upload the contents of this folder to its `main` branch.
2. Open **Actions** and enable workflows if GitHub asks.
3. Run **Build Android APK** or **Build Windows 11 app** (or push a commit to `main`).
4. Open the completed workflow run and download its artifact:
   - Android: `Skeletor-Video-Android-APK` (`app-debug.apk`)
   - Windows: `Skeletor-Video-Windows-11` (installer and portable executable)

The Android artifact is a debug APK for personal testing, not a Play Store release. Windows file associations are registered by the installer; Windows may ask you to choose Skeletor Video as the default app.

## Run Windows locally
```bash
npm install
npm start
```

## Notes
- The app plays files stored on the device; it does not include or provide copyrighted videos.
- Browser and Android codec support depends on the device/runtime. MKV and some less-common codecs may not play on every device.
- Android's file-open chooser behavior varies by Android version and file manager. If Android does not route a file directly, use **Add files** inside the app.

## App icon
The supplied Skeletor artwork is included as the launcher/app icon for Android and Windows. The Android workflow copies the 512px icon into the launcher mipmap resources; the Windows installer uses `www/assets/icon.ico`.
