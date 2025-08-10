import "dotenv/config";
import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "uplook",
  slug: "uplook",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "uplook",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-secure-store",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      clerk_public_key:
        process.env.CLERK_PUBLIC_KEY,
    },
  },
});
