import { MetadataRoute } from "next";
import locations from "./components/weather/locations";

const LOCATION_PATH_SUFFIX = "-weather-river-gauge";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://activeflyfishing.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  
  // Homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // All river pages
  const riverPages: MetadataRoute.Sitemap = locations.map((location) => ({
    url: `${BASE_URL}/${location.id}${LOCATION_PATH_SUFFIX}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [...routes, ...riverPages];
}

