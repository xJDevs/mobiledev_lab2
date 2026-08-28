import { Image } from "expo-image";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useEntries, type Entry } from "../context/entries-context";

// pantalla de la bitácora, lista todas las fotos que guardé con su ubicación y descripción
export default function JournalScreen() {
  // leo la lista desde el contexto compartido, ya viene de la más reciente a la más vieja
  const { entries } = useEntries();

  return (
    <FlatList
      data={entries}
      keyExtractor={(entry) => entry.id}
      renderItem={({ item }) => <EntryCard entry={item} />}
      contentContainerStyle={entries.length === 0 ? styles.emptyContainer : styles.list}
      // esto se muestra solo cuando la lista está vacía
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your journal is empty</Text>
          <Text style={styles.muted}>Take your first photo in the Capture tab</Text>
        </View>
      }
    />
  );
}

// tarjeta de una entrada: la foto, dónde y cuándo la tomé y lo que escribí
function EntryCard({ entry }: { entry: Entry }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: entry.uri }} style={styles.photo} contentFit="cover" />
      <View style={styles.body}>
        {/* si el gps no respondió cuando tomé la foto location viene en null */}
        {entry.location ? (
          <>
            <Text style={styles.coords}>
              {entry.location.latitude.toFixed(5)}, {entry.location.longitude.toFixed(5)}
            </Text>
            {entry.location.accuracy != null && (
              <Text style={styles.muted}>accuracy ±{Math.round(entry.location.accuracy)} m</Text>
            )}
          </>
        ) : (
          <Text style={styles.warning}>Location unavailable</Text>
        )}
        <Text style={styles.description}>{entry.description}</Text>
        <Text style={styles.muted}>{new Date(entry.takenAt).toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 16 },
  emptyContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  empty: { alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "bold" },
  card: {
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    overflow: "hidden",
  },
  photo: { width: "100%", aspectRatio: 4 / 3, backgroundColor: "#ddd" },
  body: { padding: 12, gap: 4 },
  coords: { fontSize: 16, fontWeight: "600" },
  warning: { fontSize: 16, fontWeight: "600", color: "#b00020" },
  description: { fontSize: 16, marginTop: 4 },
  muted: { fontSize: 13, color: "#666" },
});
