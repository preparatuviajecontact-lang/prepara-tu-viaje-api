import { getFuelPrices } from "./getFuelPrices.js";

export const getRouteCost = async (totalTollCost, distance, vehicleOctane, vehiclePerformance, originArray) => {

    // Combustible necesario (litros)
    const getLitersNeeded = () => {
        return Number(distance) / Number(vehiclePerformance);
    };

    // Precio del combustible (valor numérico)
    const getFuelPrice = async () => {
        const fuelPrices = await getFuelPrices(originArray);
    
        if (!fuelPrices || !fuelPrices.fuelData) {
            throw new Error("No se pudieron obtener precios de combustible");
        }
    
        const fuel = fuelPrices.fuelData.find(f =>
            f.fuelType.startsWith(String(vehicleOctane))
        );
    
        if (!fuel || !fuel.price) {
            throw new Error(`Octanaje no encontrado: ${vehicleOctane}`);
        }
    
        const raw = fuel.price.replace('$', '');
        return Math.round(Number(raw));
    };


    const getTotalFuelSpent = async () => {
        const litersNeeded = getLitersNeeded();
        const fuelPrice = await getFuelPrice();
        return Math.round(litersNeeded * fuelPrice);
    };

    const totalFuelSpent = await getTotalFuelSpent()

    const getTotalCost = async () => {
        const totalFuelCost = totalFuelSpent
        return Number(totalTollCost) + totalFuelCost;
    };

    try {
        const result = await getTotalCost();

        return {
            totalCost: Math.round(result),
            totalFuelSpent
        };

    } catch (error) {
        console.error(error);
    }
};
