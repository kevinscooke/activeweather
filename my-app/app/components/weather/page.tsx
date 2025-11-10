"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { fetchWeatherApi } from "openmeteo";
import Header from "../header";
import locations, { type WeatherLocation } from "./locations";

const statCardIcons = {
  windSpeed: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5 text-sky-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12h12.75a3.75 3.75 0 0 0 0-7.5h-.75M6 15h9.75a3.75 3.75 0 1 1 0 7.5H15"
      />
    </svg>
  ),
  humidity: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5 text-sky-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.75c-2.25 3-6.75 6.5-6.75 10.5a6.75 6.75 0 1 0 13.5 0c0-4-4.5-7.5-6.75-10.5Z"
      />
    </svg>
  ),
  temperature: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5 text-sky-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a3.5 3.5 0 0 0 3.5-3.5c0-1.15-.54-2.18-1.5-2.86V5a2 2 0 0 0-4 0v9.64c-.96.68-1.5 1.71-1.5 2.86A3.5 3.5 0 0 0 12 21Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12h3" />
    </svg>
  ),
  windDirection: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5 text-sky-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v14.25m0-14.25L8.25 7M12 3l3.75 4M4.5 20.25h15"
      />
    </svg>
  ),
} as const;

const locationCoordinates: Record<
  (typeof locations)[number]["id"],
  { latitude: number; longitude: number }
> = {
  "wilson-creek": { latitude: 35.9257, longitude: -81.6745 },
  "ararat-river": { latitude: 36.404389, longitude: -80.561694 },
  "big-horse-creek": { latitude: 36.503585, longitude: -81.514367 },
  "big-laurel-creek": { latitude: 35.919826, longitude: -82.76153 },
  "big-snowbird": { latitude: 35.311198, longitude: -83.859624 },
  "cane-creek": { latitude: 36.014385, longitude: -82.131672 },
  "cane-river": { latitude: 36.014556, longitude: -82.327631 },
  "catawba-river": { latitude: 35.707346, longitude: -82.033165 },
  "curtis-creek": { latitude: 35.63708, longitude: -82.157701 },
  "davidson-river": { latitude: 35.3209, longitude: -82.6221 },
  "east-fork-french-broad-river": {
    latitude: 35.139042,
    longitude: -82.805848,
  },
  "east-prong-roaring-river": { latitude: 36.381069, longitude: -81.06868 },
  "elk-creek": { latitude: 36.071389, longitude: -81.403056 },
  "elk-river": { latitude: 36.1707, longitude: -82.0187 },
  "fires-creek": { latitude: 35.077032, longitude: -83.864067 },
  "green-river": { latitude: 35.305671, longitude: -82.275115 },
  "helton-creek": { latitude: 36.544028, longitude: -81.434043 },
  "jacobs-fork": { latitude: 35.590556, longitude: -81.566944 },
  "little-river": { latitude: 35.192339, longitude: -82.613457 },
  "mill-creek": { latitude: 35.633176, longitude: -82.187059 },
  "mitchell-river": { latitude: 36.311389, longitude: -80.807222 },
  "nantahala-river": { latitude: 35.2137, longitude: -83.5596 },
  "north-fork-mills-river": { latitude: 35.406503, longitude: -82.648847 },
  "north-toe-river": { latitude: 35.899847, longitude: -82.030392 },
  "reddies-river": { latitude: 36.175, longitude: -81.168889 },
  "shelton-laurel-creek": { latitude: 35.931522, longitude: -82.735803 },
  "south-fork-new-river": { latitude: 36.393333, longitude: -81.406944 },
  "spring-creek": { latitude: 35.798714, longitude: -82.854308 },
  "stone-mountain-creek": { latitude: 36.398459, longitude: -81.05172 },
  "tuckasegee-river": { latitude: 35.3134, longitude: -83.1707 },
  "watauga-river": { latitude: 36.239167, longitude: -81.822222 },
  "west-fork-pigeon-river": { latitude: 35.426667, longitude: -82.919722 },
};

const riverGageSiteByLocation: Partial<
  Record<(typeof locations)[number]["id"], string>
> = {
  "ararat-river": "02113850",
  "wilson-creek": "02140510",
  "davidson-river": "03441000",
  "elk-creek": "02111180",
  "jacobs-fork": "02143040",
  "nantahala-river": "03505550",
  "reddies-river": "02111500",
  "south-fork-new-river": "03161000",
  "tuckasegee-river": "03508050",
  "watauga-river": "03479000",
  "west-fork-pigeon-river": "0345577330",
};

// Map location IDs to city names for H1 and metadata
const cityByLocation: Partial<
  Record<(typeof locations)[number]["id"], string>
> = {
  "ararat-river": "Mount Airy",
  "wilson-creek": "Grandfather Mountain",
  "big-horse-creek": "Ashe County",
  "big-laurel-creek": "Madison County",
  "big-snowbird": "Robbinsville",
  "cane-creek": "Fletcher",
  "cane-river": "Yancey",
  "catawba-river": "Lake James",
  "curtis-creek": "Pisgah Forest",
  "davidson-river": "Brevard",
  "east-fork-french-broad-river": "Rosman",
  "east-prong-roaring-river": "Stone Mountain",
  "elk-creek": "Wilkes County",
  "elk-river": "Banner Elk",
  "fires-creek": "Hayesville",
  "green-river": "Saluda",
  "helton-creek": "Ashe County",
  "jacobs-fork": "Morganton",
  "little-river": "DuPont State Forest",
  "mill-creek": "Old Fort",
  "mitchell-river": "Surry County",
  "nantahala-river": "Bryson City",
  "north-fork-mills-river": "Mills River",
  "north-toe-river": "Spruce Pine",
  "reddies-river": "Wilkes County",
  "shelton-laurel-creek": "Madison County",
  "south-fork-new-river": "Boone",
  "spring-creek": "Hot Springs",
  "stone-mountain-creek": "Stone Mountain",
  "tuckasegee-river": "Bryson City",
  "watauga-river": "Boone",
  "west-fork-pigeon-river": "Canton",
};

export const LOCATION_PATH_SUFFIX = "-weather-river-gauge";
const DEFAULT_LOCATION = locations[0] as WeatherLocation;

const getLocationFromPathname = (pathname: string | null | undefined) => {
  if (!pathname) return undefined;

  const [firstSegment] = pathname.split("/").filter(Boolean);
  if (!firstSegment || !firstSegment.endsWith(LOCATION_PATH_SUFFIX)) {
    return undefined;
  }

  const locationId = firstSegment.slice(
    0,
    firstSegment.length - LOCATION_PATH_SUFFIX.length,
  );

  return locations.find((location) => location.id === locationId);
};

const buildLocationPathname = (locationId: WeatherLocation["id"]) =>
  `/${locationId}${LOCATION_PATH_SUFFIX}`;

const buildUSGSStationUrl = (siteId: string) =>
  `https://waterdata.usgs.gov/monitoring-location/${siteId}/`;

const findNearbyGauges = (
  currentLocationId: string,
  allLocations: WeatherLocation[],
  gaugeMap: Partial<Record<string, string>>,
  maxResults = 3,
): WeatherLocation[] => {
  const currentLocation = allLocations.find((loc) => loc.id === currentLocationId);
  if (!currentLocation) return [];

  const currentCoords = locationCoordinates[currentLocationId];
  if (!currentCoords) return [];

  // Find other locations with gauges
  const locationsWithGauges = allLocations
    .filter((loc) => loc.id !== currentLocationId && gaugeMap[loc.id])
    .map((loc) => {
      const coords = locationCoordinates[loc.id];
      if (!coords) return null;

      // Simple distance calculation (Haversine approximation)
      const latDiff = coords.latitude - currentCoords.latitude;
      const lonDiff = coords.longitude - currentCoords.longitude;
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

      return { location: loc, distance };
    })
    .filter((item): item is { location: WeatherLocation; distance: number } => item !== null)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
    .map((item) => item.location);

  return locationsWithGauges;
};

const weatherCodeDescriptions: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Heavy hail",
};

const msToMph = (value: number | null) =>
  value == null ? null : value * 2.236936;
const mmToInches = (value: number | null) =>
  value == null ? null : value * 0.0393701;
const celsiusToFahrenheit = (value: number | null) =>
  value == null ? null : value * (9 / 5) + 32;

const degreesToCardinal = (degrees: number | null) => {
  if (degrees == null) return null;
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  TimeScale,
);

type WeatherSnapshot = {
  temperatureF: number | null;
  humidityPercent: number | null;
  precipitationIn: number | null;
  windSpeedMph: number | null;
  windDirectionDegrees: number | null;
  windDirectionCardinal: string | null;
  weatherCode: number | null;
  weatherDescription: string | null;
  observationTime: Date | null;
};

type UpcomingDay = {
  date: Date;
  maxTempF: number | null;
  minTempF: number | null;
  weatherCode: number | null;
  weatherDescription: string | null;
};

const CloudIcon = () => (
  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-500 sm:h-12 sm:w-12 md:h-14 md:w-14">
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className="h-10 w-10"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M24 42h18a10 10 0 0 0 0-20h-1A14 14 0 1 0 24 42Z"
      />
    </svg>
  </div>
);

const FlowGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 28 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M1 9c2-3 4-3 6 0s4 3 6 0 4-3 6 0 4 3 6 0"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function WeatherPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locationFromPath = useMemo(
    () => getLocationFromPathname(pathname),
    [pathname],
  );
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation>(
    () => locationFromPath ?? DEFAULT_LOCATION,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const selectedCoordinates = locationCoordinates[selectedLocation.id];
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [riverReadings, setRiverReadings] = useState<
    { timestamp: Date; value: number }[]
  >([]);
  const [isLoadingRiver, setIsLoadingRiver] = useState(false);
  const [riverError, setRiverError] = useState<string | null>(null);
  const [lastKnownReading, setLastKnownReading] = useState<{
    value: number;
    timestamp: Date;
  } | null>(null);
  const [upcomingForecast, setUpcomingForecast] = useState<UpcomingDay[]>([]);

  const filteredLocations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return locations;
    return locations.filter((location) =>
      `${location.name} ${location.region}`.toLowerCase().includes(query),
    );
  }, [searchTerm]);

  const groupedLocations = useMemo(() => {
    const groups = new Map<string, typeof locations>();

    for (const location of filteredLocations) {
      const letter = location.name.charAt(0)?.toUpperCase() ?? "#";
      const bucket = groups.get(letter);
      if (bucket) {
        bucket.push(location);
      } else {
        groups.set(letter, [location]);
      }
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, items]) => ({
        letter,
        items: items.slice().sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filteredLocations]);

  const resultsCount = filteredLocations.length;

  useEffect(() => {
    const nextLocation = locationFromPath ?? DEFAULT_LOCATION;

    setSelectedLocation((current) =>
      current.id === nextLocation.id ? current : nextLocation,
    );
  }, [locationFromPath]);

  useEffect(() => {
    const siteId = riverGageSiteByLocation[selectedLocation.id];
    let cancelled = false;
    const controller = new AbortController();

    // Clear last known reading when location changes
    setLastKnownReading(null);
    setRiverError(null);

    if (!siteId) {
      setRiverReadings([]);
      setRiverError("River gauge data is unavailable for this location.");
      setIsLoadingRiver(false);
      return () => {
        cancelled = true;
        controller.abort();
      };
    }

    const loadRiverData = async () => {
      setIsLoadingRiver(true);
      setRiverError(null);
      try {
        const url = new URL("https://waterservices.usgs.gov/nwis/iv/");
        url.searchParams.set("format", "json");
        url.searchParams.set("sites", siteId);
        url.searchParams.set("parameterCd", "00065");
        url.searchParams.set("period", "P7D");

        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`USGS request failed: ${response.statusText}`);
        }
        const json = await response.json();
        const valueSeries =
          json?.value?.timeSeries?.[0]?.values?.[0]?.value ?? [];

        const parsedReadings: { timestamp: Date; value: number }[] = [];

        for (const entry of valueSeries) {
          const reading = Number.parseFloat(entry?.value);
          const date = entry?.dateTime ? new Date(entry.dateTime) : null;
          if (
            Number.isFinite(reading) &&
            date instanceof Date &&
            !Number.isNaN(date.getTime())
          ) {
            parsedReadings.push({ value: reading, timestamp: date });
          }
        }

        if (!cancelled) {
          setRiverReadings(parsedReadings);
          // Store the latest reading as last known
          if (parsedReadings.length > 0) {
            const latest = parsedReadings[parsedReadings.length - 1];
            setLastKnownReading({
              value: latest.value,
              timestamp: latest.timestamp,
            });
          }
          setIsLoadingRiver(false);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load river data", error);
        // Don't clear readings on error - keep last known data visible
        setRiverError(
          error instanceof Error
            ? error.message
            : "Unable to fetch river data right now.",
        );
        setIsLoadingRiver(false);
      }
    };

    loadRiverData();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedLocation.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      const id = window.setTimeout(() => {
        desktopSearchRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const id = window.setTimeout(() => {
        mobileSearchRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      setIsLoadingWeather(true);
      setWeatherError(null);
      setUpcomingForecast([]);
      try {
        const params = {
          latitude: selectedCoordinates.latitude,
          longitude: selectedCoordinates.longitude,
          hourly: [
            "temperature_2m",
            "wind_speed_10m",
            "wind_direction_10m",
            "relative_humidity_2m",
            "precipitation",
            "weather_code",
          ],
          daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
          forecast_days: 4,
          timezone: "auto",
        } as const;

        const responses = await fetchWeatherApi(
          "https://api.open-meteo.com/v1/forecast",
          params
        );
        const response = responses[0];
        const hourly = response.hourly();
        const daily = response.daily();
        if (!hourly) {
          throw new Error("No hourly weather data received.");
        }

        const temperatureValues = hourly.variables(0)?.valuesArray();
        const windSpeedValues = hourly.variables(1)?.valuesArray();
        const windDirectionValues = hourly.variables(2)?.valuesArray();
        const humidityValues = hourly.variables(3)?.valuesArray();
        const precipitationValues = hourly.variables(4)?.valuesArray();
        const weatherCodeValues = hourly.variables(5)?.valuesArray();
        const referenceLength = temperatureValues?.length ?? 0;

        if (!referenceLength) {
          throw new Error("Temperature data is unavailable for this location.");
        }

        const interval = hourly.interval();
        const startTime = Number(hourly.time());
        const utcOffsetSeconds = response.utcOffsetSeconds();

        const nowUtcSeconds = Math.floor(Date.now() / 1000);
        const modelSeconds = nowUtcSeconds - utcOffsetSeconds;
        let index = Math.floor((modelSeconds - startTime) / interval);
        if (Number.isNaN(index) || index < 0) index = 0;
        if (index >= referenceLength) index = referenceLength - 1;

        const pickValue = (values?: Float32Array | null) => {
          if (!values || values.length === 0) return null;
          if (index >= 0 && index < values.length) {
            return values[index];
          }
          return values[values.length - 1];
        };

        const tempC = pickValue(temperatureValues);
        const windSpeedMs = pickValue(windSpeedValues);
        const windDirectionDeg = pickValue(windDirectionValues);
        const humidityPercent = pickValue(humidityValues);
        const precipitationMm = pickValue(precipitationValues);
        const weatherCode = pickValue(weatherCodeValues);

        const observationTimeSeconds =
          startTime + index * interval + utcOffsetSeconds;

        if (cancelled) return;

        const windDirectionRounded =
          windDirectionDeg == null ? null : Math.round(windDirectionDeg);
        const weatherCodeRounded =
          weatherCode == null ? null : Math.round(weatherCode);

        setWeather({
          temperatureF: celsiusToFahrenheit(tempC),
          humidityPercent,
          precipitationIn: mmToInches(precipitationMm),
          windSpeedMph: msToMph(windSpeedMs),
          windDirectionDegrees: windDirectionRounded,
          windDirectionCardinal: degreesToCardinal(windDirectionDeg),
          weatherCode: weatherCodeRounded,
          weatherDescription:
            weatherCodeRounded != null
              ? weatherCodeDescriptions[weatherCodeRounded] ?? "Updated conditions"
              : null,
          observationTime: new Date(observationTimeSeconds * 1000),
        });
        if (daily) {
          const dailyMaxValues = daily.variables(0)?.valuesArray();
          const dailyMinValues = daily.variables(1)?.valuesArray();
          const dailyWeatherCodes = daily.variables(2)?.valuesArray();
          const dailyStartTime = Number(daily.time());
          const dailyInterval = daily.interval();
          const dailyLength =
            dailyMaxValues?.length ??
            dailyMinValues?.length ??
            dailyWeatherCodes?.length ??
            0;

          if (Number.isFinite(dailyStartTime) && Number.isFinite(dailyInterval)) {
            const upcomingDays: UpcomingDay[] = [];
            for (let dayIndex = 1; dayIndex < Math.min(dailyLength, 4); dayIndex++) {
              const maxC = dailyMaxValues?.[dayIndex] ?? null;
              const minC = dailyMinValues?.[dayIndex] ?? null;
              const weatherCodeValue = dailyWeatherCodes?.[dayIndex] ?? null;
              const roundedCode =
                weatherCodeValue == null ? null : Math.round(weatherCodeValue);
              const description =
                roundedCode != null
                  ? weatherCodeDescriptions[roundedCode] ?? "Updated conditions"
                  : null;
              const dateSeconds =
                dailyStartTime + dayIndex * dailyInterval + utcOffsetSeconds;
              const date =
                Number.isFinite(dateSeconds) && !Number.isNaN(dateSeconds)
                  ? new Date(dateSeconds * 1000)
                  : new Date();

              upcomingDays.push({
                date,
                maxTempF: celsiusToFahrenheit(maxC),
                minTempF: celsiusToFahrenheit(minC),
                weatherCode: roundedCode,
                weatherDescription: description,
              });
            }
            setUpcomingForecast(upcomingDays);
          }
        }
        setIsLoadingWeather(false);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load weather data", error);
        setWeather(null);
        setWeatherError(
          error instanceof Error
            ? error.message
            : "Failed to load weather data."
        );
        setUpcomingForecast([]);
        setIsLoadingWeather(false);
      }
    };

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, [selectedCoordinates.latitude, selectedCoordinates.longitude]);

  const temperatureDisplay = useMemo(() => {
    if (weather?.temperatureF != null) {
      return `${Math.round(weather.temperatureF)}°F`;
    }
    return isLoadingWeather ? "…" : "--";
  }, [weather?.temperatureF, isLoadingWeather]);

  const feelsLikeDisplay = useMemo(() => {
    if (weather?.temperatureF != null) {
      return `${Math.round(weather.temperatureF)}°F`;
    }
    return isLoadingWeather ? "…" : "--";
  }, [weather?.temperatureF, isLoadingWeather]);

  const conditionDisplay = useMemo(() => {
    if (weather?.weatherDescription) {
      return weather.weatherDescription;
    }
    if (isLoadingWeather) {
      return "Fetching latest conditions…";
    }
    return "Conditions unavailable";
  }, [weather?.weatherDescription, isLoadingWeather]);

  const lastUpdated = useMemo(() => {
    if (!weather?.observationTime) return null;
    return weather.observationTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [weather?.observationTime]);

  const riverTooltipFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }),
    [],
  );

  const latestRiverReading = useMemo(() => {
    if (!riverReadings.length) return null;
    const latest = riverReadings[riverReadings.length - 1];
    return {
      value: latest.value,
      timestampLabel: riverTooltipFormatter.format(latest.timestamp),
    };
  }, [riverReadings, riverTooltipFormatter]);

  const metricsCards = useMemo(() => {
    const fallbackValue = isLoadingWeather ? "…" : "--";
    const fallbackSub = isLoadingWeather ? "Updating…" : "Unavailable";

    const formattedWindSpeed =
      weather?.windSpeedMph != null
        ? `${Math.round(weather.windSpeedMph)} mph`
        : fallbackValue;

    const windDirectionLabel =
      weather?.windDirectionCardinal ??
      (weather?.windDirectionDegrees != null
        ? `${weather.windDirectionDegrees}°`
        : null);

    const windDirectionSub =
      weather?.windDirectionCardinal && weather?.windDirectionDegrees != null
        ? `${weather.windDirectionCardinal} • ${weather.windDirectionDegrees}°`
        : weather?.windDirectionDegrees != null
        ? `${weather.windDirectionDegrees}°`
        : fallbackSub;

    const formattedHumidity =
      weather?.humidityPercent != null
        ? `${Math.round(weather.humidityPercent)}%`
        : fallbackValue;

    const formattedPrecipitation =
      weather?.precipitationIn != null
        ? `${weather.precipitationIn.toFixed(2)} in`
        : fallbackValue;

    const formattedStage =
      latestRiverReading != null
        ? `${latestRiverReading.value.toFixed(2)} ft`
        : isLoadingRiver
        ? "…"
        : "--";

    return [
      {
        key: "flow-stage",
        label: "River Stage",
        value: formattedStage,
        sublabel: latestRiverReading
          ? `Latest reading`
          : isLoadingRiver
          ? "Loading…"
          : "No gauge data",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5 text-sky-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 14s2.5-4 6-4 6 4 10 4 5-4 5-4"
            />
          </svg>
        ),
      },
      {
        key: "wind-speed",
        label: "Wind Speed",
        value: formattedWindSpeed,
        sublabel: windDirectionLabel ?? fallbackSub,
        icon: statCardIcons.windSpeed,
      },
      {
        key: "precipitation",
        label: "Precipitation",
        value: formattedPrecipitation,
        sublabel: "24h total",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5 text-sky-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v14.25m0-14.25L8.25 7M12 3l3.75 4M4.5 20.25h15"
            />
          </svg>
        ),
      },
      {
        key: "humidity",
        label: "Humidity",
        value: formattedHumidity,
        sublabel: "Relative",
        icon: statCardIcons.humidity,
      },
    ];
  }, [
    isLoadingWeather,
    isLoadingRiver,
    weather?.humidityPercent,
    weather?.windDirectionCardinal,
    weather?.windDirectionDegrees,
    weather?.windSpeedMph,
    weather?.precipitationIn,
    latestRiverReading,
  ]);

  const upcomingDayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }),
    [],
  );

  const formatForecastTemp = (value: number | null) =>
    value != null ? `${Math.round(value)}°` : "--";

  const riverTickMonthDayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        month: "short",
        day: "numeric",
      }),
    [],
  );

  const riverTickDayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        day: "numeric",
      }),
    [],
  );

  const riverTickPartsFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        month: "numeric",
        day: "numeric",
      }),
    [],
  );

  const currentSiteId = useMemo(
    () => riverGageSiteByLocation[selectedLocation.id],
    [selectedLocation.id],
  );

  const nearbyGauges = useMemo(() => {
    // Show nearby gauges if current location has no gauge OR if there's an error
    if (!currentSiteId || riverError) {
      return findNearbyGauges(
        selectedLocation.id,
        locations,
        riverGageSiteByLocation,
        3,
      );
    }
    return [];
  }, [selectedLocation.id, currentSiteId, riverError]);

  const cityName = useMemo(
    () => cityByLocation[selectedLocation.id] ?? selectedLocation.region,
    [selectedLocation.id],
  );

  const h1Title = useMemo(
    () => `${selectedLocation.name} Flow & Fly Fishing Conditions (${cityName}, NC)`,
    [selectedLocation.name, cityName],
  );

  const riverChartData = useMemo<ChartData<"line">>(() => {
    return {
      datasets: [
        {
          type: "line",
          label: "Gage height (ft)",
          data: riverReadings.map((reading) => ({
            x: reading.timestamp.getTime(),
            y: reading.value,
          })),
          borderColor: "#0ea5e9",
          backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
            const ctx = context.chart.ctx;
            const chartArea = context.chart.chartArea;
            
            if (!chartArea) {
              return "rgba(14, 165, 233, 0.15)";
            }
            
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(14, 165, 233, 0.4)");
            gradient.addColorStop(0.5, "rgba(14, 165, 233, 0.15)");
            gradient.addColorStop(1, "rgba(14, 165, 233, 0.02)");
            return gradient;
          },
          borderWidth: 3,
          borderCapStyle: "round" as const,
          borderJoinStyle: "round" as const,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 3,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#0ea5e9",
          pointHitRadius: 20,
          tension: 0.4,
        },
      ],
    };
  }, [riverReadings]);

  const riverChartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "nearest" as const,
      },
      scales: {
        x: {
          type: "time" as const,
          ticks: {
            maxRotation: 0,
            color: "#64748b",
            font: {
              size: 11,
              weight: 500,
            },
            padding: 12,
            callback: (value: string | number, index: number, ticks) => {
              const numericValue =
                typeof value === "number" ? value : Number(value);
              if (!Number.isFinite(numericValue)) return "";
              const currentDate = new Date(numericValue);

              let showMonth = index === 0;
              if (!showMonth && index > 0) {
                const previousValue =
                  typeof ticks[index - 1].value === "number"
                    ? ticks[index - 1].value
                    : Number(ticks[index - 1].value);
                if (Number.isFinite(previousValue)) {
                  const currentParts =
                    riverTickPartsFormatter.formatToParts(currentDate);
                  const previousParts = riverTickPartsFormatter.formatToParts(
                    new Date(previousValue),
                  );
                  const currentMonth = currentParts.find(
                    (part) => part.type === "month",
                  )?.value;
                  const previousMonth = previousParts.find(
                    (part) => part.type === "month",
                  )?.value;
                  showMonth = currentMonth !== previousMonth;
                }
              }

              return showMonth
                ? riverTickMonthDayFormatter.format(currentDate)
                : riverTickDayFormatter.format(currentDate);
            },
          },
          grid: {
            color: "rgba(148, 163, 184, 0.08)",
            drawBorder: false,
            lineWidth: 1,
          },
          border: {
            display: false,
          },
        },
        y: {
          title: {
            display: true,
            text: "Height (ft)",
            color: "#64748b",
            font: {
              size: 11,
              weight: 600,
            },
            padding: {
              top: 0,
              bottom: 8,
            },
          },
          ticks: {
            color: "#64748b",
            padding: 10,
            font: {
              size: 11,
              weight: 500,
            },
            callback: (value: string | number) => {
              const numericValue =
                typeof value === "number" ? value : Number(value);
              return Number.isFinite(numericValue)
                ? `${numericValue.toFixed(2)}`
                : "";
            },
          },
          grid: {
            color: "rgba(148, 163, 184, 0.08)",
            drawBorder: false,
            lineWidth: 1,
          },
          border: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          displayColors: false,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleColor: "#e2e8f0",
          bodyColor: "#ffffff",
          borderColor: "rgba(148, 163, 184, 0.2)",
          borderWidth: 1,
          padding: 12,
          titleFont: {
            size: 12,
            weight: 500,
          },
          bodyFont: {
            size: 14,
            weight: 600,
          },
          cornerRadius: 8,
          boxPadding: 6,
          usePointStyle: false,
          callbacks: {
            title: (items: TooltipItem<"line">[]) =>
              items.length
                ? riverTooltipFormatter.format(
                    new Date(items[0].parsed.x as number),
                  )
                : "",
            label: (item: TooltipItem<"line">) =>
              `${item.parsed.y?.toFixed(2) ?? "--"} ft`,
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeInOutQuart" as const,
      },
      elements: {
        point: {
          hoverRadius: 6,
          hoverBorderWidth: 3,
        },
      },
    }),
    [
      riverTickDayFormatter,
      riverTickMonthDayFormatter,
      riverTickPartsFormatter,
      riverTooltipFormatter,
    ],
  );

  const handleLocationSelect = useCallback(
    (locationId: string) => {
      const location = locations.find((loc) => loc.id === locationId);
      if (!location) return;

      setSelectedLocation((current) =>
        current.id === location.id ? current : location,
      );
      setIsMenuOpen(false);
      setIsMobileMenuOpen(false);
      setSearchTerm("");

      const nextPathname = buildLocationPathname(locationId);
      if (pathname !== nextPathname) {
        router.push(nextPathname, { scroll: false });
      }
    },
    [pathname, router],
  );

  const handleDesktopToggle = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setSearchTerm("");
    } else {
      setSearchTerm("");
      setIsMenuOpen(true);
    }
  };

  const handleMobileOpen = () => {
    setSearchTerm("");
    setIsMobileMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <Header selectedLocation={selectedLocation} />

      <main className="flex-1 bg-linear-to-b from-sky-100 via-sky-50 to-white px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {h1Title}
          </h1>

          <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
            {selectedLocation.description}
          </p>

          {/* Internal Linking System */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">Related:</span>
            <Link
              href="/"
              className="font-medium text-sky-600 hover:text-sky-700 underline"
            >
              Fly Fishing North Carolina
            </Link>
            {nearbyGauges.length > 0 && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Nearby rivers:</span>
                {nearbyGauges.slice(0, 3).map((location, index) => (
                  <span key={location.id}>
                    {index > 0 && <span className="text-slate-400">, </span>}
                    <button
                      onClick={() => handleLocationSelect(location.id)}
                      className="font-medium text-sky-600 hover:text-sky-700 underline"
                    >
                      {location.name}
                    </button>
                  </span>
                ))}
              </>
            )}
            {/* Placeholder for future explainer links */}
            {/* <span className="text-slate-400">•</span>
            <Link
              href="/how-to-read-gauges"
              className="font-medium text-sky-600 hover:text-sky-700 underline"
            >
              How to Read Gauges
            </Link> */}
          </div>

          <div className="w-full bg-slate-800 px-4 py-4 sm:hidden">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-slate-300">Powered by:</p>
              <div className="relative h-12 w-40">
                <Image
                  src="https://ik.imagekit.io/gfi2amo6o/Jesse-Brown-s-Logo-White-e1730748119626.png"
                  alt="Jesse Brown's Charlotte, NC"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-7">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="rounded-3xl bg-white/90 px-5 py-5 shadow-sm ring-1 ring-white/60 backdrop-blur sm:px-6 sm:py-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Current Temperature
                      </p>
                      <p className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                        {temperatureDisplay}
                      </p>
                      <p className="text-sm font-medium text-slate-600 sm:text-base">
                        {conditionDisplay}
                      </p>
                      <p className="text-xs text-slate-500">
                        Feels like {feelsLikeDisplay}
                      </p>
                    </div>
                    <div className="flex shrink-0 sm:hidden">
                      <CloudIcon />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-slate-400">
                    {lastUpdated ? <p>Updated {lastUpdated}</p> : null}
                    {weatherError ? (
                      <p className="text-rose-500">{weatherError}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-100/80 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Next 3 Days
                    </h2>
                    {isLoadingWeather ? (
                      <span className="text-xs text-slate-400">Updating…</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-3">
                    {upcomingForecast.length ? (
                      upcomingForecast.slice(0, 3).map((day) => (
                        <div
                          key={day.date.toISOString()}
                          className="flex items-start justify-between gap-4 rounded-xl bg-white/80 px-3 py-2 text-slate-600 shadow-sm ring-1 ring-white/60"
                        >
                          <div className="flex flex-col">
                            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                              {upcomingDayFormatter.format(day.date)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {day.weatherDescription ??
                                (isLoadingWeather
                                  ? "Updating…"
                                  : "Forecast unavailable")}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 sm:text-base">
                            {formatForecastTemp(day.maxTempF)} /{" "}
                            {formatForecastTemp(day.minTempF)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-4 text-xs text-slate-400">
                        Forecast data loading…
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/85 px-5 py-4 shadow-sm ring-1 ring-white/60 backdrop-blur sm:px-6 sm:py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Conditions At A Glance
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                {metricsCards.map((card) => (
                  <div
                    key={card.key}
                    className="flex h-full flex-col justify-between rounded-2xl border border-slate-100/80 bg-slate-50/80 p-3 text-slate-600 sm:p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-sky-50 p-2 text-sky-500 sm:p-2.5">
                        {card.icon}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          {card.label}
                        </span>
                        <span className="text-lg font-semibold text-slate-900">
                          {card.value}
                        </span>
                      </div>
                    </div>
                    <span className="mt-2 text-xs text-slate-400">
                      {card.sublabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="rounded-3xl bg-white/90 px-5 py-5 shadow-sm ring-1 ring-white/60 backdrop-blur sm:px-6 sm:py-6 lg:self-start">
            <div className="flex flex-col gap-2 text-slate-700">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5 text-sky-500 md:h-6 md:w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 14s2.5-4 6-4 6 4 10 4 5-4 5-4"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold">River Flow Data</h2>
                </div>
                {latestRiverReading ? (
                  <div className="text-left text-xs text-slate-400 sm:text-right">
                    <p className="text-[0.65rem] uppercase tracking-[0.18em]">
                      Latest Reading
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {latestRiverReading.value.toFixed(2)} ft
                    </p>
                    <p>{latestRiverReading.timestampLabel}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-4">
              {isLoadingRiver ? (
                <div className="flex h-96 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400 sm:h-[28rem]">
                  Loading gage height…
                </div>
              ) : riverError || !riverReadings.length ? (
                <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-2xl bg-slate-50 px-4 py-6 text-center sm:h-[28rem] sm:px-6">
                  {lastKnownReading ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-slate-600">
                        Last known reading
                      </p>
                      <p className="text-2xl font-semibold text-slate-900">
                        {lastKnownReading.value.toFixed(2)} ft
                      </p>
                      <p className="text-xs text-slate-500">
                        {riverTooltipFormatter.format(lastKnownReading.timestamp)}
                      </p>
                      {currentSiteId && (
                        <a
                          href={buildUSGSStationUrl(currentSiteId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                              clipRule="evenodd"
                            />
                            <path
                              fillRule="evenodd"
                              d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0V2.5a.75.75 0 00-.75-.75h-4.75a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                          View on USGS
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-slate-600">
                        {riverError || "No river readings available"}
                      </p>
                      {currentSiteId ? (
                        <a
                          href={buildUSGSStationUrl(currentSiteId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                              clipRule="evenodd"
                            />
                            <path
                              fillRule="evenodd"
                              d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0V2.5a.75.75 0 00-.75-.75h-4.75a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                          View on USGS
                        </a>
                      ) : null}
                    </div>
                  )}
                  {nearbyGauges.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      <p className="text-xs font-medium text-slate-500">
                        Nearby rivers with gauges:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {nearbyGauges.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => handleLocationSelect(location.id)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:border-sky-300"
                          >
                            {location.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 w-full sm:h-[28rem] rounded-xl overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/30 shadow-inner">
                  <Line options={riverChartOptions} data={riverChartData} />
                </div>
              )}
            </div>
            {/* Data Sources Footnote */}
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">
                <span className="font-medium">Data sources:</span> River gauge data from{" "}
                <a
                  href="https://dashboard.waterdata.usgs.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sky-600 hover:text-sky-700 underline"
                >
                  USGS National Water Dashboard
                </a>
                {currentSiteId && (
                  <>
                    {" "}
                    (Station {currentSiteId}
                    {lastKnownReading && (
                      <>
                        {" "}
                        • Last updated{" "}
                        {riverTooltipFormatter.format(lastKnownReading.timestamp)}
                      </>
                    )}
                    )
                  </>
                )}
                . Weather data from{" "}
                <a
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sky-600 hover:text-sky-700 underline"
                >
                  Open-Meteo
                </a>
                .
              </p>
            </div>
          </div>
        </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-slate-400 sm:text-base">
            <p className="max-w-2xl">
              From floating on the Watauga to wading Big Snowbird creek, we aim to give you the information you are looking for fast.
            </p>
            <div className="mt-2 flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
              <span>Developed by Search &amp; Be Found.</span>
              <a
                href="https://searchandbefound.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                What software can we build for you?
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
