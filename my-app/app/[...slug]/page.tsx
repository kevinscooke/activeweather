import type { Metadata } from "next";
import WeatherPage from "../components/weather/page";

export const metadata: Metadata = {
  title: "North Carolina Fly Fishing Weather Dashboard | Search & Be Found",
  description: "Live weather, river flows, and hatch insights for fly fishing North Carolina. Plan every angling session with real-time forecasts tailored to trout streams statewide.",
};

export default function LocationWeatherPage() {
  return <WeatherPage />;
}

