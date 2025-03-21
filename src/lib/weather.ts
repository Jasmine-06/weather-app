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


function addVariation(value: number, range: number = 2): number {
  const variation = (Math.random() * 2 - 1) * range;
  return Math.round((value + variation) * 10) / 10;
}


function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}


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
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const weatherData = getMockWeatherWithVariation(cityName);
  
  if (!weatherData) {
    throw new Error(`Weather data not available for ${cityName}`);
  }
  
  return weatherData;
}

export async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
 
  await new Promise(resolve => setTimeout(resolve, 300));
  
  
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
  
  
  return {
    ...weatherData,
    lat,
    lon
  };
}
