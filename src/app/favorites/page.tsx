"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import WeatherCard from "@/app/_components/WeatherCard";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { WeatherData } from "@/lib/weather";

interface FavoriteCity {
  _id: string;
  cityName: string;
  countryCode: string;
  lat: number;
  lon: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch favorites when component mounts
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Fetch weather data for all favorites
  useEffect(() => {
    const fetchWeatherForFavorites = async () => {
      if (favorites.length === 0) return;

      const weatherPromises = favorites.map(favorite => 
        axios.get('/api/weather', {
          params: {
            lat: favorite.lat,
            lon: favorite.lon
          }
        })
        .then(res => ({ [favorite._id]: res.data }))
        .catch(() => null)
      );

      try {
        const results = await Promise.all(weatherPromises);
        // Fix the TypeScript error by properly typing the reducer
        const weatherDataMap = results.reduce<Record<string, WeatherData>>((acc, data) => {
          if (data) {
            return { ...acc, ...data };
          }
          return acc;
        }, {});
        
        setWeatherData(weatherDataMap);
      } catch (err) {
        setError("Failed to load weather data for some favorites");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherForFavorites();
  }, [favorites]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/favorites');
      setFavorites(response.data);
    } catch (err) {

      setError("Failed to load your favorite cities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (cityId: string) => {
    try {
      // Immediately remove from UI first (optimistic update)
      setFavorites(prev => prev.filter(fav => fav._id !== cityId));
      setWeatherData(prev => {
        const newData = { ...prev };
        delete newData[cityId];
        return newData;
      });
      
      // Then make the API call
      await axios.delete(`/api/favorites/${cityId}`);
    } catch (err) {
      // If the API call fails, restore the data (fetch favorites again)
      fetchFavorites();
      setError("Failed to remove city from favorites");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Your Favorite Cities</h1>
        <p className="text-muted-foreground">
          Track weather conditions for cities you've added to favorites
        </p>
      </div>
      
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(3).fill(0).map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : favorites.length > 0 ? (
          favorites.map(favorite => {
            const weather = weatherData[favorite._id];
            return weather ? (
              <WeatherCard 
                key={favorite._id}
                weatherData={weather}
                isFavorite={true}
                onFavoriteToggle={() => handleRemoveFavorite(favorite._id)}
              />
            ) : (
              <Card key={favorite._id}>
                <CardHeader>
                  <CardTitle>{favorite.cityName}</CardTitle>
                  <CardDescription>{favorite.countryCode}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Loading weather data...</p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No favorites yet</CardTitle>
              <CardDescription>
                Search for cities from the home page and add them to your favorites
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-6">
              <div className="text-6xl">⭐</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
