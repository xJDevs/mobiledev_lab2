import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { EntriesProvider } from "../context/entries-context";

export default function RootLayout() {
  return (
    <EntriesProvider>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: "Capture",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="camera" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: "Journal",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="images" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </EntriesProvider>
  );
}
