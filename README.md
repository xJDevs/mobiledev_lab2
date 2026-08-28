# Bitácora Geográfica

Laboratorio 2 del curso TPA-4001 (Integración de Hardware y Sensores). Mini app móvil hecha con Expo que toma una fotografía con la cámara del teléfono, lee el GPS en el instante exacto de la captura y guarda cada foto con sus coordenadas y una descripción.

## Cómo cumple cada requisito

| Requisito | Dónde está |
|---|---|
| 1. Solicitar y gestionar los permisos de cámara y ubicación | `app/index.tsx` pide los permisos al entrar a Capture; `components/permission-gate.tsx` muestra qué permiso falta, con botón para volver a pedirlo o abrir los ajustes del sistema. La app nunca falla si se niegan. |
| 2. Acceder a la cámara para capturar una fotografía | `app/index.tsx` usa `CameraView` de `expo-camera` con un visor dentro de la app y un botón de disparo. |
| 3. Leer el GPS en el momento exacto de la captura | En `takePhoto()` la foto (`takePictureAsync`) y la posición (`readLocation`, en `lib/read-location.ts`) se lanzan en el mismo instante, sin esperar una para empezar la otra. |
| 4. Mostrar la imagen con sus coordenadas y una descripción | La vista previa en Capture muestra la foto, latitud y longitud con cinco decimales, la precisión en metros y un campo de descripción. Journal lo muestra para cada entrada guardada. |
| 5. Una página para tomar fotos y otra para verlas, conservando el estado | Dos tabs con `expo-router`: **Capture** (`app/index.tsx`) y **Journal** (`app/journal.tsx`). El estado vive en un `useContext` (`context/entries-context.tsx`) que envuelve a los dos tabs. |

## Qué se necesita para probarla

- Node.js LTS y npm.
- Un **teléfono físico** (iPhone o Android) con la app **Expo Go** instalada desde la tienda. El simulador de iOS no tiene cámara, así que no sirve para este lab.
- La computadora y el teléfono en la **misma red Wi-Fi**.

No hace falta cuenta de Expo ni development build: `expo-camera` y `expo-location` vienen incluidos en Expo Go para el SDK 54.

## Instalación y ejecución

```bash
git clone https://github.com/xJDevs/mobiledev_lab2.git
cd mobiledev_lab2
npm install
npx expo start
```

En la terminal aparece un código QR:

- **iPhone**: escanearlo con la app Cámara y tocar el aviso que abre Expo Go.
- **Android**: abrir Expo Go y usar "Scan QR code".

Si el teléfono no logra conectarse (redes de la universidad suelen bloquearlo), correr `npx expo start --tunnel` y escanear el nuevo QR.

## Cómo usar la app

1. Al abrir **Capture** la app pide el permiso de cámara y luego el de ubicación.
2. Con ambos concedidos aparece el visor. Tocar el botón redondo para disparar.
3. Se muestra la vista previa con la foto y, en unos segundos, las coordenadas y la precisión.
4. Escribir una descripción y tocar **Save** (queda deshabilitado mientras la descripción esté vacía o el GPS todavía esté leyendo). **Discard** vuelve al visor sin guardar.
5. La app salta a **Journal**, donde cada entrada muestra la foto, las coordenadas, la descripción y la fecha y hora de la captura, de la más reciente a la más antigua.

## Cómo probar el manejo de permisos

Los permisos pertenecen a la app Expo Go, no a este proyecto, así que para probar los casos de denegación hay que cambiarlos desde el sistema:

- **iPhone**: Ajustes > Expo Go > apagar Cámara y poner Ubicación en "Nunca". iOS reinicia Expo Go al cambiar un permiso; es normal.
- **Android**: Ajustes > Aplicaciones > Expo Go > Permisos > negar Cámara y Ubicación.

Con eso, al entrar a Capture se ve el aviso **"Permissions needed"** con una tarjeta por cada permiso faltante y un botón:

- **Allow ...** si el sistema todavía permite mostrar el diálogo (vuelve a pedir el permiso).
- **Open settings** si el permiso fue negado de forma permanente (abre los ajustes de la app). Al volver con el permiso concedido, la pantalla pasa al visor sin reiniciar la app.

El tab Journal sigue funcionando aunque falten permisos.

Para ver de nuevo los diálogos de "primera vez" hay que dejar los permisos sin decidir: en iPhone, Ajustes > General > Transferir o restablecer > Restablecer > Restablecer ubicación y privacidad (afecta a todas las apps), o desinstalar y reinstalar Expo Go.

**GPS apagado**: con el permiso concedido pero los servicios de ubicación del teléfono apagados, la foto se toma igual y la vista previa muestra "Location unavailable" con el motivo y un botón **Retry** que vuelve a leer solo la posición. Si el GPS tarda más de 10 segundos pasa lo mismo. La entrada se puede guardar sin coordenadas; Journal la muestra como "Location unavailable".

## Notas

- Las entradas viven en memoria: al cerrar la app por completo la bitácora vuelve a empezar vacía (el enunciado permite `useState`/`useContext` sin persistencia).
- La precisión depende del GPS del teléfono: en exteriores suele ser de pocos metros, en interiores puede ser peor o tardar más.
- Los textos de permiso configurados en `app.json` (plugins de `expo-camera` y `expo-location`) aplican en un build nativo; en Expo Go se ven los textos propios de Expo Go.

## Estructura del proyecto

```
app/
  _layout.tsx          tabs Capture y Journal, envueltos en el provider
  index.tsx            pantalla Capture: permisos, visor, disparo, vista previa y guardado
  journal.tsx          pantalla Journal: lista de entradas
components/
  permission-gate.tsx  aviso de permisos faltantes con botón para corregirlos
  location-summary.tsx coordenadas, espera o aviso de ubicación no disponible
context/
  entries-context.tsx  estado compartido de la bitácora (useContext + useState)
lib/
  read-location.ts     lectura del GPS con verificación de servicios y timeout
app.json               configuración de Expo y plugins de cámara y ubicación
```

## Tecnologías

Expo SDK 54, expo-router, expo-camera, expo-location, expo-image, React Native 0.81, TypeScript.

## Autor

xJDevs
