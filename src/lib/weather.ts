import mockWeatherData from '@/data/mockWeatherData.json';
import citiesData from '@/data/cities.json';






export interface WeatherData {
  cityName: string;
  countryCode: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCondition: string;
  weatherDescription: string;
  weatherIcon: string;
  pressure: number;
  visibility: number;
  timestamp: number;
  lat?: number;
  lon?: number;
}

// Helper function to add random variation to temperature to simulate weather changes
function addVariation(value: number, range: number = 2): number {
  const variation = (Math.random() * 2 - 1) * range;
  return Math.round((value + variation) * 10) / 10;
}

// Update the timestamp to current time
function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

// Get mock weather data with some random variations to simulate changes
function getMockWeatherWithVariation(cityName: string): WeatherData | null {
  const cityWeather = (mockWeatherData as Record<string, WeatherData>)[cityName];
  
  if (!cityWeather) {
    return null;
  }
  
  return {
    ...cityWeather,
    temperature: addVariation(cityWeather.temperature),
    feelsLike: addVariation(cityWeather.feelsLike),
    humidity: Math.min(100, Math.max(0, Math.round(cityWeather.humidity + (Math.random() * 10 - 5)))),
    windSpeed: Math.max(0, addVariation(cityWeather.windSpeed, 1)),
    timestamp: getCurrentTimestamp()
  };
}

export async function getWeatherByCity(cityName: string): Promise<WeatherData> {
  // Add a small artificial delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const weatherData = getMockWeatherWithVariation(cityName);
  
  if (!weatherData) {
    throw new Error(`Weather data not available for ${cityName}`);
  }
  
  return weatherData;
}

export async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
  // Add a small artificial delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find the closest city from our mock data based on coordinates
  const cities = citiesData as Array<{name: string, country: string, lat: number, lon: number}>;
  
  let closestCity = '';
  let minDistance = Number.MAX_VALUE;
  
  for (const city of cities) {
    const distance = Math.sqrt(
      Math.pow(city.lat - lat, 2) + 
      Math.pow(city.lon - lon, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city.name;
    }
  }
  
  const weatherData = getMockWeatherWithVariation(closestCity);
  
  if (!weatherData) {
    throw new Error(`Weather data not available for coordinates (${lat}, ${lon})`);
  }
  
  // Add the coordinates to the weather data
  return {
    ...weatherData,
    lat,
    lon
  };
}
