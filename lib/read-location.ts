import * as Location from "expo-location";
import type { EntryLocation } from "../context/entries-context";

// cuánto espero al gps antes de rendirme, en milisegundos
const LOCATION_TIMEOUT_MS = 10_000;

// motivos por los que puede fallar la lectura, los uso para el mensaje en pantalla
export type LocationFailure = "services-off" | "timeout" | "error";

// la lectura o sale bien con la posición o falla con un motivo, nunca revienta
export type LocationResult =
  | { ok: true; location: EntryLocation }
  | { ok: false; reason: LocationFailure };

// lee la posición actual del teléfono una sola vez
// primero reviso que el gps esté encendido y después pido la posición con un límite de tiempo
export async function readLocation(): Promise<LocationResult> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    return { ok: false, reason: "services-off" };
  }

  try {
    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      LOCATION_TIMEOUT_MS,
    );
    return {
      ok: true,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof TimeoutError ? "timeout" : "error",
    };
  }
}

// texto que le muestro al usuario según el motivo del fallo
export function describeLocationFailure(reason: LocationFailure): string {
  switch (reason) {
    case "services-off":
      return "Location services are turned off on this phone";
    case "timeout":
      return "The GPS did not answer in time";
    case "error":
      return "The location could not be read";
  }
}

// error propio para distinguir el timeout de cualquier otro fallo del gps
class TimeoutError extends Error {}

// corre la promesa contra un reloj, gana el que termine primero
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
