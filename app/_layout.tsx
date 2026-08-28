import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { EntriesProvider } from "../context/entries-context";

// este archivo arma los dos tabs de la app
// el provider va por encima de los tabs para que las dos pantallas compartan la misma bitácora
export default function RootLayout() {
  return (
    <EntriesProvider>
      <Tabs>
        {/* index.tsx es la pantalla de captura y es la que abre primero */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Capture",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="camera" color={color} size={size} />
            ),
          }}
        />
        {/* journal.tsx es la lista de las fotos que ya tomé */}
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
