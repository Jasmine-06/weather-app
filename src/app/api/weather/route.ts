import { NextResponse } from 'next/server';
import { getWeatherByCity, getWeatherByCoordinates } from '@/lib/weather';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  try {
    if (city) {
      console.log(`Processing weather request for city: ${city}`);
      const weatherData = await getWeatherByCity(city);
      return NextResponse.json(weatherData);
    } else if (lat && lon) {
      console.log(`Processing weather request for coordinates: lat=${lat}, lon=${lon}`);
      const weatherData = await getWeatherByCoordinates(
        parseFloat(lat), 
        parseFloat(lon)
      );
      return NextResponse.json(weatherData);
    } else {
      return NextResponse.json(
        { error: 'Missing required parameters: city or lat,lon' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
