import { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'appliance-buddy',
  slug: 'appliance-buddy',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.appliancebuddy.app'
  },
  android: {
    package: 'com.appliancebuddy.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    }
  },
  updates: {
    url: 'https://u.expo.dev/cada56c7-e8d9-499a-87fb-5c6f4b7c5e1a'
  },
  runtimeVersion: {
    policy: 'appVersion'
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png'
  },
  plugins: ['expo-font', 'expo-secure-store'],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api',
    eas: {
      projectId: 'cada56c7-e8d9-499a-87fb-5c6f4b7c5e1a'
    },
    projectName: 'appliance-buddy'
  }
});
