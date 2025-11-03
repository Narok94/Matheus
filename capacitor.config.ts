import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inspecpro.app',
  appName: 'InspecPro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
