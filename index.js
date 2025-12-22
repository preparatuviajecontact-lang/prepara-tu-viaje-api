import cors from "cors";
import express from 'express';
import { getRoute } from "./utils/getRoute.js";
import { determinateTolls } from "./utils/determinateTolls.js";
import { getRouteCost } from './utils/getRouteCost.js';
import { fetchCoordinates } from './utils/fetchCoordinates.js';
import { registerApiUsage } from './utils/registerApiUsage.js';
import { authApiKey } from './middlewares/auth.js';

const app = express();
app.use(express.json());
app.use(cors({
  allowedHeaders: ["Content-Type", "x-api-key"]
}));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// MODO 1 SE LE PASARÁN LAS COORDENADAS DE ORIGEN Y DESTINO
app.get('/api/v1/coord-mode/:origin/:destination/:vehicleTypeKey/:vehicleOctane/:vehiclePerformance', authApiKey, async (req, res) => {
    try {
      const { origin, destination, vehicleTypeKey, vehicleOctane, vehiclePerformance } = req.params;

      const originArray = origin.split(',').map(Number);
      const destArray = destination.split(',').map(Number);

      const vehicleType = Number(vehicleTypeKey);
      const octane = Number(vehicleOctane);
      const performance = Number(vehiclePerformance);

      const isValidCoord = (arr) =>
        arr.length === 2 && arr.every(n => !isNaN(n));

      if (!isValidCoord(originArray) || !isValidCoord(destArray)) {
        return res.status(400).json({
          error: "Formato de coordenadas inválido. Usa: lat,lng"
        });
      }

      const { coordinates, distance, routeSteps } = await getRoute(originArray, destArray);
      const { nearbyPolylineTolls, totalTollCost } = await determinateTolls(coordinates, vehicleType);
      const { totalCost, totalFuelSpent } = await getRouteCost(
        totalTollCost,
        distance,
        octane,
        performance,
        originArray
      );

      res.json({
        success: true,
        totalTollCost,
        totalFuelSpent,
        totalCost,
        count: nearbyPolylineTolls.length,
        distance,
        tolls: nearbyPolylineTolls,
        routeSteps,
        polyline: coordinates
      });

      registerApiUsage(req.apiKey).catch(console.error);

    } catch (error) {
      console.error("Error en /coord-mode:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        details: error.message
      });
    }
  }
);


// MODO 2 SE LE PASARÁN LOS NOMBRES DEL LUGAR DE ORIGEN Y DESTINO
app.get('/api/v1/places-mode/:origin/:destination/:vehicleTypeKey/:vehicleOctane/:vehiclePerformance', authApiKey, async (req, res) => {
    try {
        const { origin, destination, vehicleTypeKey, vehicleOctane, vehiclePerformance } = req.params;

        const startCoordinates = await fetchCoordinates(origin);
        const endCoordinates = await fetchCoordinates(destination);

        if (!startCoordinates) {
            return res.status(404).json({ error: `No se pudo geocodificar el origen: ${origin}` });
        }
        
        if (!endCoordinates) {
            return res.status(404).json({ error: `No se pudo geocodificar el destino: ${destination}` });
        }

        const originArray = [
            Number(startCoordinates.lat),
            Number(startCoordinates.lon)
        ];

        const destArray = [
            Number(endCoordinates.lat),
            Number(endCoordinates.lon)
        ];

        const isValidCoord = (arr) =>
            arr.length === 2 && arr.every(n => !isNaN(n));

        if (!isValidCoord(originArray) || !isValidCoord(destArray)) {
            return res.status(400).json({
            error: "Coordenadas inválidas obtenidas desde geocodificación"
            });
        }

        const vehicleType = Number(vehicleTypeKey);
        const octane = Number(vehicleOctane);
        const performance = Number(vehiclePerformance);

        const { coordinates, distance, routeSteps } = await getRoute(originArray, destArray);
        const { nearbyPolylineTolls, totalTollCost } = await determinateTolls(coordinates, vehicleType);
        const { totalCost, totalFuelSpent } = await getRouteCost(
            totalTollCost,
            distance,
            octane,
            performance,
            originArray
        );

        res.json({
            success: true,
            totalTollCost,
            totalFuelSpent,
            totalCost,
            count: nearbyPolylineTolls.length,
            distance,
            tolls: nearbyPolylineTolls,
            routeSteps,
            polyline: coordinates
        });

        registerApiUsage(req.apiKey).catch(console.error);

    } catch (error) {
        console.error("Error en /places-mode:", error);
        res.status(500).json({
            message: "Error interno del servidor",
            details: error.message
        });
    }
  }
);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor API listo en puerto ${PORT}`);
});
