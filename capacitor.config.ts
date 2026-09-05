import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.willy.kilotakip',
  appName: 'Willy Kilo Takip',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Use Capacitor's bundled native HTTP transport on Android/iOS.
    // This bypasses WebView CORS/origin restrictions for production API calls.
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
