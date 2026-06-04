// // Utility functions for distance calculation and nearby filtering

// export function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Earth's radius in kilometers
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//             Math.sin(dLon/2) * Math.sin(dLon/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c;
// }

// export function formatDistance(distance) {
//   if (distance < 1) {
//     return `${Math.round(distance * 1000)}m`;
//   }
//   return `${distance.toFixed(1)}km`;
// }

// // Get user's current location
// export async function getUserLocation() {
//   return new Promise((resolve, reject) => {
//     if (!navigator.geolocation) {
//       reject(new Error('Geolocation not supported'));
//       return;
//     }
    
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         resolve({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//           accuracy: position.coords.accuracy
//         });
//       },
//       (error) => {
//         let errorMessage = 'Location access denied';
//         if (error.code === 1) errorMessage = 'Please allow location access to see nearby offers';
//         if (error.code === 2) errorMessage = 'Location unavailable';
//         if (error.code === 3) errorMessage = 'Location request timed out';
//         reject(new Error(errorMessage));
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0
//       }
//     );
//   });
// }

// // Check if user is near an offer (within specified radius in km)
// export function isNearby(adLocation, userLocation, radiusKm = 10) {
//   if (!adLocation || !userLocation) return false;
//   const distance = calculateDistance(
//     userLocation.lat,
//     userLocation.lng,
//     adLocation.lat,
//     adLocation.lng
//   );
//   return distance <= radiusKm;
// }

// // Sort offers by distance (nearest first)
// export function sortByDistance(ads, userLocation) {
//   return [...ads].sort((a, b) => {
//     const distA = a.distance || Infinity;
//     const distB = b.distance || Infinity;
//     return distA - distB;
//   });
// }

// // Get nearby offers within radius
// export function getNearbyOffers(ads, userLocation, radiusKm = 10) {
//   return ads.filter(ad => {
//     if (!ad.latitude || !ad.longitude) return false;
//     const distance = calculateDistance(
//       userLocation.lat,
//       userLocation.lng,
//       ad.latitude,
//       ad.longitude
//     );
//     ad.distance = distance; // Attach distance to ad object
//     return distance <= radiusKm;
//   }).sort((a, b) => a.distance - b.distance);
// }


// Utility functions for distance calculation and nearby filtering

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${distance.toFixed(1)}km away`;
}

// Get user's current location
export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Location access denied';
        if (error.code === 1) errorMessage = '❌ Please allow location access to see nearby offers';
        if (error.code === 2) errorMessage = '📍 Location unavailable. Please try again';
        if (error.code === 3) errorMessage = '⏱️ Location request timed out';
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// Get nearby offers within radius
export function getNearbyOffers(ads, userLocation, radiusKm = 10) {
  if (!userLocation || !ads.length) return [];
  
  return ads.filter(ad => {
    if (!ad.latitude || !ad.longitude) return false;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      ad.latitude,
      ad.longitude
    );
    ad.distance = distance; // Attach distance to ad object
    return distance <= radiusKm;
  });
}

// Sort offers by distance (nearest first)
export function sortByDistance(ads, userLocation) {
  return [...ads].sort((a, b) => {
    const distA = a.distance !== undefined ? a.distance : Infinity;
    const distB = b.distance !== undefined ? b.distance : Infinity;
    return distA - distB;
  });
}