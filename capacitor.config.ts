import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skoollhub.app',
  appName: 'SkoollHub',
  webDir: 'public',
  server: {
    url: 'https://skoollhub.netlify.app',
    cleartext: true
  }
};

export default config;