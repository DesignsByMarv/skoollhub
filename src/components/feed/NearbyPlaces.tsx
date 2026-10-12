import { MapPin, Navigation } from 'lucide-react';

type CampusPlace = {
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
};

const campusPlaces: CampusPlace[] = [
  { name: 'University of Ilorin', city: 'Ilorin', state: 'Kwara', latitude: 8.4799, longitude: 4.5418 },
  { name: 'Tanke Junction', city: 'Ilorin', state: 'Kwara', latitude: 8.471, longitude: 4.615 },
  { name: 'Sobi Hill', city: 'Ilorin', state: 'Kwara', latitude: 8.52, longitude: 4.56 },
  { name: 'Kwara State Polytechnic', city: 'Ilorin', state: 'Kwara', latitude: 8.489, longitude: 4.542 },
  { name: 'University of Lagos', city: 'Lagos', state: 'Lagos', latitude: 6.5158, longitude: 3.3895 },
  { name: 'National Museum Lagos', city: 'Lagos', state: 'Lagos', latitude: 6.4482, longitude: 3.3958 },
  { name: 'Nike Art Gallery', city: 'Lagos', state: 'Lagos', latitude: 6.435, longitude: 3.474 },
  { name: 'Lekki Conservation Centre', city: 'Lagos', state: 'Lagos', latitude: 6.4412, longitude: 3.535 },
  { name: 'University of Ibadan', city: 'Ibadan', state: 'Oyo', latitude: 7.441, longitude: 3.9003 },
  { name: 'Agodi Gardens', city: 'Ibadan', state: 'Oyo', latitude: 7.412, longitude: 3.909 },
  { name: 'Cocoa House', city: 'Ibadan', state: 'Oyo', latitude: 7.377, longitude: 3.901 },
  { name: 'Jabi Lake Mall', city: 'Abuja', state: 'FCT', latitude: 9.072, longitude: 7.427 },
  { name: 'Millennium Park', city: 'Abuja', state: 'FCT', latitude: 9.078, longitude: 7.49 },
  { name: 'National Mosque', city: 'Abuja', state: 'FCT', latitude: 9.052, longitude: 7.49 },
  { name: 'Covenant University', city: 'Ota', state: 'Ogun', latitude: 6.673, longitude: 3.158 },
  { name: 'Canaanland', city: 'Ota', state: 'Ogun', latitude: 6.671, longitude: 3.16 },
  { name: 'Federal University of Technology, Akure', city: 'Akure', state: 'Ondo', latitude: 7.299, longitude: 5.148 },
  { name: 'Deji of Akure Palace', city: 'Akure', state: 'Ondo', latitude: 7.252, longitude: 5.194 },
  { name: 'Ahmadu Bello University', city: 'Zaria', state: 'Kaduna', latitude: 11.15, longitude: 7.65 },
  { name: 'Gidan Makama Museum', city: 'Kano', state: 'Kano', latitude: 12.001, longitude: 8.516 },
  { name: 'Bayero University Kano', city: 'Kano', state: 'Kano', latitude: 12.003, longitude: 8.521 },
  { name: 'University of Benin', city: 'Benin City', state: 'Edo', latitude: 6.397, longitude: 5.619 },
  { name: 'Benin City National Museum', city: 'Benin City', state: 'Edo', latitude: 6.337, longitude: 5.626 },
  { name: 'Port Harcourt Pleasure Park', city: 'Port Harcourt', state: 'Rivers', latitude: 4.815, longitude: 7.015 },
  { name: 'Rivers State University', city: 'Port Harcourt', state: 'Rivers', latitude: 4.798, longitude: 7.002 },
  { name: 'University of Nigeria, Nsukka', city: 'Nsukka', state: 'Enugu', latitude: 6.858, longitude: 7.397 },
  { name: 'Ngwo Pine Forest', city: 'Enugu', state: 'Enugu', latitude: 6.448, longitude: 7.463 },
  { name: 'University of Calabar', city: 'Calabar', state: 'Cross River', latitude: 4.951, longitude: 8.341 },
  { name: 'Tinapa Resort', city: 'Calabar', state: 'Cross River', latitude: 4.991, longitude: 8.33 },
  { name: 'Federal University of Agriculture, Abeokuta', city: 'Abeokuta', state: 'Ogun', latitude: 7.231, longitude: 3.438 },
  { name: 'Olusegun Obasanjo Presidential Library', city: 'Abeokuta', state: 'Ogun', latitude: 7.147, longitude: 3.35 },
  { name: 'Obafemi Awolowo University', city: 'Ile-Ife', state: 'Osun', latitude: 7.518, longitude: 4.528 },
  { name: 'Oduduwa Museum', city: 'Ile-Ife', state: 'Osun', latitude: 7.48, longitude: 4.56 },
  { name: 'Federal University of Technology, Minna', city: 'Minna', state: 'Niger', latitude: 9.523, longitude: 6.45 },
  { name: 'University of Jos', city: 'Jos', state: 'Plateau', latitude: 9.957, longitude: 8.896 },
  { name: 'University of Uyo', city: 'Uyo', state: 'Akwa Ibom', latitude: 5.034, longitude: 7.927 },
  { name: 'Modibbo Adama University', city: 'Yola', state: 'Adamawa', latitude: 9.203, longitude: 12.484 },
  { name: 'Usmanu Danfodiyo University', city: 'Sokoto', state: 'Sokoto', latitude: 13.12, longitude: 5.215 },
  { name: 'University of Maiduguri', city: 'Maiduguri', state: 'Borno', latitude: 11.828, longitude: 13.15 },
  { name: 'Nnamdi Azikiwe University', city: 'Awka', state: 'Anambra', latitude: 6.246, longitude: 7.118 },
  { name: 'Federal University of Technology, Owerri', city: 'Owerri', state: 'Imo', latitude: 5.39, longitude: 6.996 },
];

function distanceInKilometers(a: CampusPlace, latitude: number, longitude: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const deltaLatitude = radians(a.latitude - latitude);
  const deltaLongitude = radians(a.longitude - longitude);
  const distance = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(radians(latitude)) * Math.cos(radians(a.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(distance), Math.sqrt(1 - distance));
}

export default function NearbyPlaces({
  city,
  state,
  latitude,
  longitude,
  locationSharingEnabled,
}: {
  city?: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationSharingEnabled?: boolean;
}) {
  const userLocation = locationSharingEnabled && typeof latitude === 'number' && typeof longitude === 'number'
    ? { latitude, longitude }
    : null;
  const places = userLocation
    ? campusPlaces
      .map((place) => ({ place, distance: distanceInKilometers(place, userLocation.latitude, userLocation.longitude) }))
      .filter((entry) => entry.distance <= 40)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map((entry) => entry.place)
    : campusPlaces
      .filter((place) => city && place.city.toLowerCase() === city.toLowerCase())
      .slice(0, 5);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><MapPin size={16} /></span>
        <div>
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">Popular places</h2>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400">{userLocation ? 'Near your shared approximate location' : city ? `Around ${city}${state ? `, ${state}` : ''}` : 'Around Nigerian campuses'}</p>
        </div>
      </div>
      {places.length ? (
        <ul className="mt-3 space-y-1">
          {places.map((place) => (
            <li key={`${place.name}-${place.city}`}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.city}, ${place.state}, Nigeria`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-[11px] text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-indigo-300"
              >
                <Navigation size={13} className="shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate">{place.name}</span>
                {userLocation && (
                  <span className="shrink-0 text-[9px] text-slate-400">{distanceInKilometers(place, userLocation.latitude, userLocation.longitude).toFixed(1)} km</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[11px] leading-5 text-slate-500 dark:text-zinc-400">
          Turn on nearby suggestions to find popular places near you. Your exact location stays private.
        </p>
      )}
    </section>
  );
}
