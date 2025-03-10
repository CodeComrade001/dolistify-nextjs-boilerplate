"use server";
import { fetchWeatherApi } from 'openmeteo';

interface Params {
  latitude: number;
  longitude: number;
  current: Array<string>;
  timezone: string;
}

const weatherConditionMap: { [key: number]: string } = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Slight thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

export default async function getWeatherInfo(queryData: Params) {
  const { latitude, longitude, current, timezone } = queryData;

  // Check if current is provided and is an array
  if (!current || !Array.isArray(current)) {
    console.error("Current data is missing or not an array.");
    return false;
  }

  try {
    // Construct the query parameters
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      timezone: timezone,
      current: current.join(","),  // Join the current variables into a comma-separated string
    });

    // Append query parameters to the URL
    url.search = params.toString();

    // Send the GET request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    // Assuming the API returns JSON data, parse it
    const data = await response.json();

    // console.log("🚀 ~ getWeatherInfo ~ data:", data);

    // Extract weather code from the response
    const weatherCode = data.current?.weather_code;
    let weatherCondition = "Unknown";

    // Map the weather code to a human-readable condition
    if (weatherCode !== undefined && weatherConditionMap[weatherCode]) {
      weatherCondition = weatherConditionMap[weatherCode];
    }

    // Return weather data with condition
    return {
      ...data,
      weatherCondition,
    };
  } catch (error: unknown) {
    console.error("Error fetching weather data:", error);
    return false;
  }
}
