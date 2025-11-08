import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mds.inspecoes',
  appName: 'MDS Inspeções',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;