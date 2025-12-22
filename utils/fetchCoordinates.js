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
        const response = await axios.get(
            `https://eu1.locationiq.com/v1/search.php`,
            {
                params: {
                    key: apiKeyLocationIq,
                    q: term,
                    format: "json",
                    addressdetails: 1,
                    countrycodes: latinAmericanCountries.join(",")
                }
            }
        );

        const location = response.data.find(item => item.lat && item.lon);

        if (!location) return null;

        return { 
            lat: Number(location.lat), 
            lon: Number(location.lon) 
        };

    } catch (error) {
        console.error("Error al obtener coordenadas:", error.message);
        return null;
    }
};

