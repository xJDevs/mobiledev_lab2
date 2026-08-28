import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";
import type { EntryLocation } from "../context/entries-context";
import { describeLocationFailure, type LocationFailure } from "../lib/read-location";

// en qué va la lectura del gps mientras reviso la foto
export type LocationStatus =
  | { kind: "loading" }
  | { kind: "ok"; location: EntryLocation }
  | { kind: "failed"; reason: LocationFailure };

type Props = {
  status: LocationStatus;
  onRetry: () => void;
};

// muestra las coordenadas, el spinner de espera o el aviso de que no hubo ubicación
export function LocationSummary({ status, onRetry }: Props) {
  if (status.kind === "loading") {
    return (
      <View style={styles.row}>
        <ActivityIndicator />
        <Text style={styles.muted}>Getting location...</Text>
      </View>
    );
  }

  if (status.kind === "ok") {
    const { latitude, longitude, accuracy } = status.location;
    return (
      <View style={styles.block}>
        {/* cinco decimales son más o menos un metro de precisión, suficiente para la bitácora */}
        <Text style={styles.coords}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
        {accuracy != null && (
          <Text style={styles.muted}>accuracy ±{Math.round(accuracy)} m</Text>
        )}
      </View>
    );
  }

  // si llego acá el gps falló, dejo la foto y ofrezco volver a intentar solo la lectura
  return (
    <View style={styles.block}>
      <Text style={styles.warning}>Location unavailable</Text>
      <Text style={styles.muted}>{describeLocationFailure(status.reason)}</Text>
      <Button title="Retry" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  block: { gap: 4 },
  coords: { fontSize: 16, fontWeight: "600" },
  warning: { fontSize: 16, fontWeight: "600", color: "#b00020" },
  muted: { fontSize: 14, color: "#666" },
});
