import { cneEmail, cnePassword } from '../src/config/config.js';
import { getCachedFuelPrices, setCachedFuelPrices } from "../cache/fuelPriceCache.js";
import { getCachedCneToken, setCachedCneToken } from "../cache/cneTokenCache.js";

const regionsAndCode = [
    {name:'Tarapacá', code:'01'},
    {name:'Antofagasta', code:'02'},
    {name:'Atacama', code:'03'},
    {name:'Coquimbo', code:'04'},
    {name:'Valparaíso', code:'05'},
    {name:'Del Libertador Gral. Bernardo O’Higgins', code:'06'},
    {name:'Del Maule', code:'07'},
    {name:'Del Biobío', code:'08'},
    {name:'De la Araucanía', code:'09'},
    {name:'De los Lagos', code:'10'},
    {name:'Aysén del Gral. Carlos Ibáñez del Campo', code:'11'},
    {name:'Magallanes y de la Antártica Chilena', code:'12'},
    {name:'Metropolitana de Santiago', code:'13'},
    {name:'De los Ríos', code:'14'},
    {name:'Arica y Parinacota', code:'15'},
    {name:'Ñuble', code:'16'},
]
const extraerPrecio = (precio) => (precio ? parseFloat(precio.precio) : null);

const getUserRegionCode = async (locationArray) => {

    const [lat, lng] = [locationArray[0], locationArray[1]];

    if (!lat || !lng) {
        throw new Error("Coordenadas requeridas");
    }

    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
            headers: {
                "User-Agent": "your-api-name"
            }
        }
    );

    if (!response.ok) {
        throw new Error("Error en reverse geocoding");
    }

    const data = await response.json();

    // Chile
    const userRegionName =
        data.address?.state ||
        data.address?.region ||
        data.address?.state_district;

    if (!userRegionName) {
        throw new Error("No se pudo determinar la región");
    }

    // Normalización
    const normalize = str =>
        str.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z\s]/g, "");

    const normalizedUserRegion = normalize(userRegionName).split(" ");

    let bestMatch = null;
    let maxMatchCount = 0;

    regionsAndCode.forEach(region => {
        const normalizedRegionName = normalize(region.name).split(" ");
        const matchCount = normalizedRegionName.filter(word =>
            normalizedUserRegion.includes(word)
        ).length;

        if (matchCount > maxMatchCount) {
            maxMatchCount = matchCount;
            bestMatch = region;
        }
    });

    if (!bestMatch) {
        throw new Error(`Región no encontrada: ${userRegionName}`);
    }

    return {
        regionCode: bestMatch.code, 
        userRegionName
    };
};

const getCneToken = async () => {
    const cached = getCachedCneToken();
    if (cached) return cached;

    try {
        const urlencoded = new URLSearchParams();
        urlencoded.append("email", cneEmail);
        urlencoded.append("password", cnePassword);

        const requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded", //OBLIGATORIO EN RN
                "Accept": "application/json"
            },
            body: urlencoded.toString(), // RN no siempre acepta URLSearchParams directamente
            redirect: 'follow'
        };

        const response = await fetch("https://api.cne.cl/api/login", requestOptions);

        const text = await response.text();

        // Si la respuesta comienza con HTML → login falló
        if (text.startsWith("<!DOCTYPE html>")) {
            throw new Error("La API devolvió HTML: credenciales incorrectas o falta Content-Type.");
        }

        // Convertir a JSON
        const json = JSON.parse(text);
        

        const token = json.token;

        setCachedCneToken(token);
        return token;

    } catch (error) {
        console.error("Error obteniendo token CNE:", error);
        return null;
    }
};

export const getFuelPrices = async (locationArray) => {
    try {
        const { regionCode, userRegionName } = await getUserRegionCode(locationArray);

        const cached = getCachedFuelPrices(regionCode);
        if (cached) {
            return cached;
        }

        const cneApiKey = await getCneToken();

        const headers = new Headers();
        headers.append("Authorization", `Bearer ${cneApiKey}`);

        const response = await fetch(
            "https://api.cne.cl/api/v4/estaciones",
            { method: 'GET', headers }
        );

        if (!response.ok)
            throw new Error(`Error API CNE: ${response.status}`);

        const estaciones = await response.json();

        const estacionesRegion = estaciones.filter(
            est => est?.ubicacion?.codigo_region === regionCode
        );

        if (estacionesRegion.length === 0)
            throw new Error('No hay estaciones para la región');

        const tiposCombustible = ['93', '95', '97', 'DI'];

        const promedios = tiposCombustible.reduce((acc, tipo) => {
            const precios = estacionesRegion
                .map(est => extraerPrecio(est?.precios?.[tipo]))
                .filter(valor => valor !== null);

            acc[tipo] =
                precios.length > 0
                    ? (precios.reduce((a, b) => a + b, 0) / precios.length).toFixed(2)
                    : null;

            return acc;
        }, {});

        const fuelData = [
            { fuelType: "93 Octanos", price: `$${promedios['93']}` },
            { fuelType: "95 Octanos", price: `$${promedios['95']}` },
            { fuelType: "97 Octanos", price: `$${promedios['97']}` },
            { fuelType: "Diésel",     price: `$${promedios['DI']}` }
        ];

        const result = {
            fuelData,
            userRegionName,
            regionCode
        };

        setCachedFuelPrices(regionCode, result);

        return result;

    } catch (error) {
        console.error('Error obteniendo precios:', error.message || error);
        return null;
    }
};




