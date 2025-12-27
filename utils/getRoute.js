import axios from "axios";
import polyline from '@mapbox/polyline';

export const getRoute = async (startLatLng, endLatLng) => {
    const start = [startLatLng[1], startLatLng[0]];
    const end = [endLatLng[1], endLatLng[0]];

    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=polyline&steps=true&alternatives=true`;

    const response = await axios.get(url);
    const routes = response.data.routes;

    if (!routes || routes.length === 0) {
      throw new Error("No se encontraron rutas.");
    }

    // Decodificar todas las rutas encontradas
    const decodedRoutes = routes.map((r) => ({
      coordinates: polyline.decode(r.geometry).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      })),
      distance: r.distance / 1000, // km
      routeSteps: formatSteps(r.legs[0].steps),
    }));

    // Ordenar por distancia (ascendente)
    decodedRoutes.sort((a, b) => a.distance - b.distance);

    // La ruta más corta será la principal
    const mainRoute = decodedRoutes[0];
    // La más larga será la secondRoute (si existe)
    const secondRoute = decodedRoutes[decodedRoutes.length - 1] !== mainRoute
      ? decodedRoutes[decodedRoutes.length - 1]
      : null;

    // console.log(mainRoute.distance)

    return {
      coordinates: mainRoute.coordinates,
      distance: Math.round(mainRoute.distance),
      routeSteps: mainRoute.routeSteps,
      secondRoute,
    };

};

const formatSteps = (steps) => {
  if (!steps || steps.length === 0) return [{ text: 'Sin indicaciones disponibles' }];

  const filteredSteps = steps.filter(step => 
    step.distance > 10 || step.maneuver.type === 'arrive'
  );

  if (filteredSteps.length === 0) return [{ text: 'Sin indicaciones disponibles' }];

  return filteredSteps.map((step, index) => {
    const { maneuver, name, distance, duration } = step;
    const action = getActionText(maneuver.type, maneuver.modifier);
    const roadName = name || '';
    const distKm = +(distance / 1000).toFixed(3);
    const durationMin = (duration / 60).toFixed(2);

    return {
      index: index + 1,
      text: `${action}${roadName ? ` por ${roadName}` : ''}`,
      distance: distKm,
      duration: durationMin,
      maneuver: step.maneuver, 
      roadName,
      action,
      heading: maneuver.bearing_after
    };
  });
};


const getActionText = (type, modifier) => {
  // Casos que dependen estrictamente del type
  if (type === 'depart') return 'Conduce';
  if (type === 'arrive') return 'Has llegado a tu destino';
  if (type === 'new name') return 'Continúa recto';

  // Ahora usamos switch en modifier
  switch (modifier) {
    case 'left':
    case 'sharp_left':
      return 'Gira a la izquierda';
    case 'right':
    case 'sharp_right':
      return 'Gira a la derecha';
    case 'straight':
      return 'Sigue recto';
    case 'slight_left':
      return 'Gira levemente a la izquierda';
    case 'slight_right':
      return 'Gira levemente a la derecha';
    case 'uturn':
      return 'Gira en U';
    default:
      return 'Conduce';
  }
};