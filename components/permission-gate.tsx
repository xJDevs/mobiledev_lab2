import type { PermissionResponse } from "expo-camera";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Button,
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";

// este componente revisa los dos permisos y decide qué mostrar
// si falta alguno muestra una tarjeta por cada uno en vez del contenido de la pantalla
type Props = {
  camera: PermissionResponse | null;
  location: PermissionResponse | null;
  onRequestCamera: () => void;
  onRequestLocation: () => void;
  children: ReactNode;
};

export function PermissionGate({
  camera,
  location,
  onRequestCamera,
  onRequestLocation,
  children,
}: Props) {
  // mientras el hook todavía está leyendo el estado los valores vienen en null
  if (!camera || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  // con los dos concedidos dejo pasar el contenido normal de la pantalla
  if (camera.granted && location.granted) {
    return <>{children}</>;
  }

  // acá llego si falta al menos uno, muestro solo las tarjetas de los que faltan
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Permissions needed</Text>
      {!camera.granted && (
        <MissingPermission
          name="Camera"
          reason="to take the photo for each journal entry"
          canAskAgain={camera.canAskAgain}
          onRequest={onRequestCamera}
        />
      )}
      {!location.granted && (
        <MissingPermission
          name="Location"
          reason="to record where each photo was taken"
          canAskAgain={location.canAskAgain}
          onRequest={onRequestLocation}
        />
      )}
    </View>
  );
}

type MissingPermissionProps = {
  name: string;
  reason: string;
  canAskAgain: boolean;
  onRequest: () => void;
};

// tarjeta de un permiso faltante con el motivo y el botón para arreglarlo
function MissingPermission({
  name,
  reason,
  canAskAgain,
  onRequest,
}: MissingPermissionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{name} permission is missing</Text>
      <Text style={styles.cardText}>
        This app needs {name.toLowerCase()} access {reason}.
      </Text>
      {/* si el sistema todavía deja preguntar vuelvo a pedir el permiso */}
      {/* si ya no deja lo mando a ajustes, en iphone después de negar una vez siempre es este caso */}
      {canAskAgain ? (
        <Button title={`Allow ${name.toLowerCase()}`} onPress={onRequest} />
      ) : (
        <Button title="Open settings" onPress={() => Linking.openSettings()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  card: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardText: { fontSize: 14, color: "#444" },
});
