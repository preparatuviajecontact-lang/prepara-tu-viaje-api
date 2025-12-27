import { getFuelPrices } from "./getFuelPrices.js";

export const getRouteCost = async (
  totalTollCost,
  distance,
  vehicleOctane,
  vehiclePerformance,
  originArray
) => {

  try {
    // Litros necesarios
    const litersNeeded = Number(
      (Number(distance) / Number(vehiclePerformance)).toFixed(2)
    );

    // Obtener precios
    const fuelPrices = await getFuelPrices(originArray);

    // ALIDACIÓN CRÍTICA
    if (!fuelPrices || !Array.isArray(fuelPrices.fuelData)) {
      return {
        totalCost: Math.round(totalTollCost),
        totalFuelSpent: null,
        litersNeeded,
        fuelPrice: null,
        warning: "No hay datos de combustible para esta zona"
      };
    }

    const fuel = fuelPrices.fuelData.find(f =>
      f.fuelType.startsWith(vehicleOctane.toString())
    );

    if (!fuel || !fuel.price) {
      return {
        totalCost: Math.round(totalTollCost),
        totalFuelSpent: null,
        litersNeeded,
        fuelPrice: null,
        warning: `No se encontró combustible ${vehicleOctane}`
      };
    }

    const fuelPrice = Math.round(
      Number(fuel.price.replace(/[^\d]/g, ""))
    );

    const totalFuelSpent = Math.round(litersNeeded * fuelPrice);
    const totalCost = Number(totalTollCost) + totalFuelSpent;

    return {
      totalCost: Math.round(totalCost),
      totalFuelSpent,
      litersNeeded,
      fuelPrice
    };

  } catch (error) {
    console.error("Error en getRouteCost:", error);

    // Fallback seguro
    return {
      totalCost: Math.round(totalTollCost),
      totalFuelSpent: null,
      litersNeeded: null,
      fuelPrice: null,
      error: "No se pudo calcular el costo de combustible"
    };
  }
};
