// Dynamic Expo config. Everything static lives in app.json; this file layers on
// top of it (Expo passes app.json's contents in as `config`) to inject secrets
// from the environment so they never get committed.
//
// The Android Google Maps key is read from ANDROID_GOOGLE_MAPS_API_KEY (set it
// in mobile/.env, which is gitignored, or via an EAS build secret). Note that an
// Android Maps SDK key is a *client* key — it is embedded in the APK and can't
// be hidden — so also restrict it in Google Cloud Console to the package
// `com.loyainiti.app` + your signing SHA-1, limited to "Maps SDK for Android".
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
      },
    },
  },
});
