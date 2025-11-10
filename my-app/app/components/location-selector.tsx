"use client";

import { useRouter } from "next/navigation";
import locations from "../components/weather/locations";

const LOCATION_PATH_SUFFIX = "-weather-river-gauge";

const buildLocationPathname = (locationId: string) =>
  `/${locationId}${LOCATION_PATH_SUFFIX}`;

export default function LocationSelector() {
  const router = useRouter();

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = e.target.value;
    if (locationId) {
      router.push(buildLocationPathname(locationId));
    }
  };

  return (
    <div className="relative">
      <select
        onChange={handleLocationChange}
        defaultValue=""
        className="w-full appearance-none rounded-full bg-white/85 px-6 py-4 text-base font-semibold text-slate-900 shadow-sm ring-1 ring-white/60 backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 sm:text-lg"
      >
        <option value="" disabled>
          Select a Location
        </option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name} - {location.region}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 text-slate-400"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.108l3.71-3.877a.75.75 0 111.08 1.04l-4.25 4.45a.75.75 0 01-1.08 0l-4.25-4.45a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

