import { StyleSheet, Text, View } from "react-native";
import { useEntries } from "../context/entries-context";

// pantalla de la bitácora, por ahora solo muestra cuántas entradas hay
// me sirve para comprobar que el contexto llega bien a esta pantalla
export default function JournalScreen() {
  // leo la lista desde el contexto compartido
  const { entries } = useEntries();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal</Text>
      <Text>{entries.length} entries</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  title: { fontSize: 24, fontWeight: "bold" },
});
