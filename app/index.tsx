import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useForegroundPermissions } from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Button,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { LocationSummary, type LocationStatus } from "../components/location-summary";
import { PermissionGate } from "../components/permission-gate";
import { useEntries } from "../context/entries-context";
import { readLocation } from "../lib/read-location";

// la pantalla pasa por tres etapas: viendo la cámara, disparando y revisando la foto
type Stage = "camera" | "capturing" | "review";

// pantalla de captura, maneja los permisos, el visor, el disparo y el guardado
export default function CaptureScreen() {
  // cada hook me da tres cosas: el estado del permiso, una función para pedirlo y otra para releerlo
  const [cameraPermission, requestCameraPermission, getCameraPermission] =
    useCameraPermissions();
  const [locationPermission, requestLocationPermission, getLocationPermission] =
    useForegroundPermissions();

  const { addEntry } = useEntries();
  const isFocused = useIsFocused();

  // con el ref le hablo a la cámara para pedirle la foto
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const [stage, setStage] = useState<Stage>("camera");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [takenAt, setTakenAt] = useState(0);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({ kind: "loading" });
  const [description, setDescription] = useState("");

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

  // cuando salgo del tab la cámara se desmonta, así que al volver tengo que esperar onCameraReady otra vez
  useEffect(() => {
    if (!isFocused) {
      setCameraReady(false);
    }
  }, [isFocused]);

  // acá pasa lo importante del lab: la foto y el gps se piden en el mismo instante
  async function takePhoto() {
    if (!cameraRef.current || !cameraReady) {
      return;
    }
    const shotAt = Date.now();
    setStage("capturing");

    // lanzo las dos promesas juntas sin esperar a que termine la primera
    const photoPromise = cameraRef.current.takePictureAsync({ quality: 0.7 });
    const locationPromise = readLocation();

    try {
      const photo = await photoPromise;
      if (!photo?.uri) {
        throw new Error("no photo");
      }
      // apenas tengo la foto paso a revisión, el gps puede seguir llegando
      setPhotoUri(photo.uri);
      setTakenAt(shotAt);
      setLocationStatus({ kind: "loading" });
      setStage("review");
    } catch {
      Alert.alert("Could not take the photo", "Please try again");
      setStage("camera");
      return;
    }

    applyLocationResult(await locationPromise);
  }

  // vuelvo a leer solo el gps, la foto se queda como está
  async function retryLocation() {
    setLocationStatus({ kind: "loading" });
    applyLocationResult(await readLocation());
  }

  function applyLocationResult(result: Awaited<ReturnType<typeof readLocation>>) {
    if (result.ok) {
      setLocationStatus({ kind: "ok", location: result.location });
    } else {
      setLocationStatus({ kind: "failed", reason: result.reason });
    }
  }

  // limpio todo para que la siguiente foto arranque desde cero
  function reset() {
    setStage("camera");
    setPhotoUri(null);
    setTakenAt(0);
    setDescription("");
    setLocationStatus({ kind: "loading" });
  }

  // guardo la entrada en el contexto y me voy al journal a verla
  function save() {
    if (!photoUri) {
      return;
    }
    addEntry({
      id: shotId(takenAt),
      uri: photoUri,
      description: description.trim(),
      takenAt,
      location: locationStatus.kind === "ok" ? locationStatus.location : null,
    });
    reset();
    router.navigate("/journal");
  }

  const canSave = description.trim().length > 0 && locationStatus.kind !== "loading";

  function renderCamera() {
    return (
      <View style={styles.container}>
        {/* solo monto la cámara cuando este tab está visible, si no queda encendida de fondo */}
        {isFocused && (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onCameraReady={() => setCameraReady(true)}
          />
        )}
        <View style={styles.shutterRow}>
          {/* el botón se bloquea mientras la cámara no está lista o ya estoy disparando */}
          <Pressable
            onPress={takePhoto}
            disabled={!cameraReady || stage === "capturing"}
            style={({ pressed }) => [
              styles.shutter,
              (pressed || !cameraReady || stage === "capturing") && styles.shutterDisabled,
            ]}
          >
            {stage === "capturing" && <ActivityIndicator color="#000" />}
          </Pressable>
        </View>
      </View>
    );
  }

  function renderReview() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.review} keyboardShouldPersistTaps="handled">
          <Image source={{ uri: photoUri ?? undefined }} style={styles.preview} contentFit="cover" />
          <LocationSummary status={locationStatus} onRetry={retryLocation} />
          <TextInput
            style={styles.input}
            placeholder="Describe this place"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.actions}>
            <Button title="Discard" color="#b00020" onPress={reset} />
            <Button title="Save" onPress={save} disabled={!canSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // el gate decide si muestra la pantalla o el aviso de permisos faltantes
  return (
    <PermissionGate
      camera={cameraPermission}
      location={locationPermission}
      onRequestCamera={requestCameraPermission}
      onRequestLocation={requestLocationPermission}
    >
      {stage === "review" && photoUri ? renderReview() : renderCamera()}
    </PermissionGate>
  );
}

// uso la hora del disparo como id, dos fotos nunca salen en el mismo milisegundo
function shotId(takenAt: number) {
  return takenAt.toString();
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  shutterRow: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterDisabled: { opacity: 0.5 },
  review: { padding: 16, gap: 16 },
  preview: { width: "100%", aspectRatio: 3 / 4, borderRadius: 12, backgroundColor: "#ddd" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 16,
  },
  actions: { flexDirection: "row", justifyContent: "space-between" },
});
