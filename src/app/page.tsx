"use client";

import { useState, useEffect } from "react";
import SearchBar from "./_components/SearchBar";
import WeatherCard from "./_components/WeatherCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import type { WeatherData } from "@/lib/weather";
import { useAuth } from "@/hooks/useAuth";

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface FavoriteCity {
  _id: string;
  cityName: string;
  countryCode: string;
  lat: number;
  lon: number;
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const { user } = useAuth();
  
  // Check if current city is in favorites
  const isCityInFavorites = weatherData ? 
    favorites.some(fav => 
      fav.cityName === weatherData.cityName && 
      fav.countryCode === weatherData.countryCode
    ) : false;

  // Fetch user's favorites when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoritesLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const response = await axios.get('/api/favorites');
      setFavorites(response.data);
    } catch (err) {
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleSelectCity = async (city: City) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/weather', {
        params: {
          lat: city.lat,
          lon: city.lon
        }
      });
      
      setWeatherData({
        ...response.data,
        lat: city.lat,
        lon: city.lon
      });
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!weatherData || !user) return;
    
    // We don't need to do anything here since the WeatherCard now handles its own state
    // Just refresh the favorites list to keep it in sync
    fetchFavorites();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Weather Dashboard</h1>
        <p className="text-muted-foreground">
          Search for cities and track their weather conditions
        </p>
      </div>
      
      <div className="max-w-md mx-auto">
        <SearchBar onSelectCity={handleSelectCity} />
      </div>
      
      {/* Weather for searched city */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card className="col-span-full animate-pulse">
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ) : weatherData ? (
          <WeatherCard 
            weatherData={weatherData} 
            isFavorite={isCityInFavorites}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ) : user && favorites.length > 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Your Weather Dashboard</CardTitle>
              <CardDescription>
                Search for a city or check your favorite cities below
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Add your first city</CardTitle>
              <CardDescription>
                Search for a city above to view its weather data
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-6">
              <div className="text-6xl">🏙️</div>
            </CardContent>
          </Card>
        )}
        
        {error && (
          <Card className="col-span-full border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Display favorite cities on home page */}
      {user && favorites.length > 0 && (
        <>
          <div className="text-center pt-8">
            <h2 className="text-2xl font-bold">Your Favorite Cities</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favoritesLoading ? (
              Array(2).fill(0).map((_, idx) => (
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
            ) : (
              favorites.map(favorite => (
                <FavoriteCityCard 
                  key={favorite._id} 
                  favorite={favorite} 
                  onRemove={() => {
                    axios.delete(`/api/favorites/${favorite._id}`).then(() => {
                      fetchFavorites();
                    });
                  }}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// New component for favorite city cards
function FavoriteCityCard({ favorite, onRemove }: { 
  favorite: { _id: string; cityName: string; countryCode: string; lat: number; lon: number; };
  onRemove: () => void;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('/api/weather', {
          params: {
            lat: favorite.lat,
            lon: favorite.lon
          }
        });
        setWeather(response.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [favorite.lat, favorite.lon]);

  const handleRemove = () => {
    setIsRemoving(true);
    onRemove();
  };

  if (isRemoving) {
    return (
      <Card className="animate-pulse opacity-50">
        <CardHeader>
          <CardTitle>Removing...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return weather ? (
    <WeatherCard
      weatherData={weather}
      isFavorite={true}
      onFavoriteToggle={handleRemove}
    />
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>{favorite.cityName}</CardTitle>
        <CardDescription>{favorite.countryCode}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Unable to load weather data</p>
      </CardContent>
    </Card>
  );
}
