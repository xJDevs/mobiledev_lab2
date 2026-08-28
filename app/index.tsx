import { useCameraPermissions } from "expo-camera";
import { useForegroundPermissions } from "expo-location";
import { useEffect } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";
import { PermissionGate } from "../components/permission-gate";

// pantalla de captura, por ahora solo maneja los permisos, la cámara viene después
export default function CaptureScreen() {
  // cada hook me da tres cosas: el estado del permiso, una función para pedirlo y otra para releerlo
  const [cameraPermission, requestCameraPermission, getCameraPermission] =
    useCameraPermissions();
  const [locationPermission, requestLocationPermission, getLocationPermission] =
    useForegroundPermissions();

  // al entrar por primera vez pido los permisos que todavía no se han decidido
  // primero cámara y después ubicación para que los diálogos del sistema no se pisen
  useEffect(() => {
    async function askMissingPermissions() {
      const camera = await getCameraPermission();
      if (camera.status === "undetermined") {
        await requestCameraPermission();
      }
      const location = await getLocationPermission();
      if (location.status === "undetermined") {
        await requestLocationPermission();
      }
    }
    askMissingPermissions();
  }, [
    getCameraPermission,
    requestCameraPermission,
    getLocationPermission,
    requestLocationPermission,
  ]);

  // si me fui a ajustes a conceder un permiso, al volver a la app releo los dos
  // en iphone el sistema reinicia la app al cambiar un permiso, en android esto es lo que actualiza la pantalla
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        getCameraPermission();
        getLocationPermission();
      }
    });
    return () => subscription.remove();
  }, [getCameraPermission, getLocationPermission]);

  // el gate decide si muestra el contenido o el aviso de permisos faltantes
  return (
    <PermissionGate
      camera={cameraPermission}
      location={locationPermission}
      onRequestCamera={requestCameraPermission}
      onRequestLocation={requestLocationPermission}
    >
      {/* esto es temporal, acá va a ir el visor de la cámara */}
      <View style={styles.container}>
        <Text style={styles.title}>Camera ready</Text>
        <Text>Both permissions granted</Text>
      </View>
    </PermissionGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  title: { fontSize: 24, fontWeight: "bold" },
});
