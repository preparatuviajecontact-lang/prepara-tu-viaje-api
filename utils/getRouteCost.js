import { getFuelPrices } from "./getFuelPrices.js";

export const getRouteCost = async (totalTollCost, distance, vehicleOctane, vehiclePerformance, originArray) => {

    // Combustible necesario (litros)
    const getLitersNeeded = () => {
        const liters = Number(distance) / Number(vehiclePerformance);
        return Number(liters.toFixed(2));
    };

    const litersNeeded = getLitersNeeded();

    // Precio del combustible (valor numérico)
    const getFuelPrice = async () => {
        const fuelPrices = await getFuelPrices(originArray);

        const fuel = fuelPrices.fuelData.find(f =>
            f.fuelType.startsWith(vehicleOctane.toString())
        );

        if (!fuel) {
            throw new Error(`No se encontró precio para octanaje ${vehicleOctane}`);
        }

        const raw = fuel.price.replace('$', '');
        return Math.round(Number(raw));
    };

    const fuelPrice = await getFuelPrice();

    const getTotalFuelSpent = async () => {
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
            totalFuelSpent,
            litersNeeded,
            fuelPrice
        };

    } catch (error) {
        console.error(error);
    }
};
