import React from "react";
import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to the tabs layout
  return <Redirect href="/(tabs)/home" />;
}
