import axios from "axios";
import { apiKeyLocationIq } from "../src/config/config.js";

const latinAmericanCountries = [
  "CL", // Chile
  "AR", // Argentina
  "BO", // Bolivia
  "BR", // Brasil
  "CO", // Colombia
  "CR", // Costa Rica
  "CU", // Cuba
  "DO", // República Dominicana
  "EC", // Ecuador
  "SV", // El Salvador
  "GT", // Guatemala
  "HN", // Honduras
  "MX", // México
  "NI", // Nicaragua
  "PA", // Panamá
  "PY", // Paraguay
  "PE", // Perú
  "PR", // Puerto Rico
  "UY", // Uruguay
  "VE", // Venezuela
];

export const fetchCoordinates = async (term) => {
    try {
        console.log(`[GEOCODE] Buscando coordenadas para: "${term}"`); // log 1

        const response = await axios.get(
            `https://eu1.locationiq.com/v1/search.php`,
            {
                params: {
                    key: apiKeyLocationIq,
                    q: term,
                    format: "json",
                    addressdetails: 1,
                    countrycodes: latinAmericanCountries.join(","),
                    limit: 1
                }
            }
        );

        console.log(`[GEOCODE] Response status: ${response.status}`); // log 2
        console.log(`[GEOCODE] Data recibida:`, response.data);       // log 3

        const location = response.data.find(item => item.lat && item.lon);

        if (!location) {
            console.warn(`[GEOCODE] No se encontró ubicación para: "${term}"`); // log 4
            return null;
        }

        console.log(`[GEOCODE] Coordenadas encontradas: lat=${location.lat}, lon=${location.lon}`); // log 5

        return { lat: Number(location.lat), lon: Number(location.lon) };

    } catch (error) {
        console.error(`[GEOCODE] Error al obtener coordenadas para "${term}":`, error.message);
        return null;
    }
};
