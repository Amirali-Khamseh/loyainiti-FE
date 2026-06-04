// Metro config for Expo. Starts from the SDK 52 default and turns on
// package.json `exports` resolution.
//
// Why: Metro defaults to legacy `main`/`module` field resolution and ignores
// the modern `exports` map. Several dependencies (notably better-auth, which
// exposes `better-auth/react`, `better-auth/client/plugins`, etc.) only
// expose their entry points through `exports`. Without this flag, Metro
// throws "Unable to resolve <subpath>" even when the file is on disk.
//
// React Native 0.79+ will enable this by default; until then we opt in.
//
//   https://docs.expo.dev/guides/customizing-metro/#package-exports

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
