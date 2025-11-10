import type { Metadata } from "next";
import WeatherPage from "../components/weather/page";
import locations, { type WeatherLocation } from "../components/weather/locations";

const LOCATION_PATH_SUFFIX = "-weather-river-gauge";

// Map location IDs to city names for metadata
const cityByLocation: Partial<Record<WeatherLocation["id"], string>> = {
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

const getLocationFromSlug = (slug: string[]): WeatherLocation | null => {
  if (!slug || slug.length === 0) return null;
  
  const pathSegment = slug[0];
  if (!pathSegment || !pathSegment.endsWith(LOCATION_PATH_SUFFIX)) {
    return null;
  }

  const locationId = pathSegment.slice(
    0,
    pathSegment.length - LOCATION_PATH_SUFFIX.length,
  );

  return locations.find((location) => location.id === locationId) ?? null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = slug ? getLocationFromSlug(slug) : null;

  // Fallback to default metadata if location not found
  if (!location) {
    return {
      title: "North Carolina Fly Fishing Weather Dashboard | Active Fly Fishing",
      description: "Live weather, river flows, and hatch insights for fly fishing North Carolina. Plan every angling session with real-time forecasts tailored to trout streams statewide.",
    };
  }

  const cityName = cityByLocation[location.id] ?? location.region;
  const title = `${location.name} Flow, Water Temp & Fishing Conditions (${cityName}, NC) | Active Fly Fishing`;
  const description = `Real-time ${location.name} flow, water temperature, and weather conditions near ${cityName}, NC. Live USGS gauge data, wind forecasts, and fishing insights for planning your next trout fishing trip.`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://activeflyfishing.com";
  const url = `${baseUrl}/${location.id}${LOCATION_PATH_SUFFIX}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Active Fly Fishing",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/icon.svg`,
          width: 100,
          height: 100,
          alt: `${location.name} Fly Fishing`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [`${baseUrl}/icon.svg`],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function LocationWeatherPage() {
  return <WeatherPage />;
}

