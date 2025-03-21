"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, Droplet, Wind, Thermometer } from "lucide-react";
import type { WeatherData } from "@/lib/weather";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

interface WeatherCardProps {
  weatherData: WeatherData;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export default function WeatherCard({ weatherData, isFavorite = false, onFavoriteToggle }: WeatherCardProps) {
  const [loading, setLoading] = useState(false);
  const [currentFavoriteState, setCurrentFavoriteState] = useState(isFavorite);
  const [isRemoving, setIsRemoving] = useState(false);  // Add this state
  const { user } = useAuth();
  const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weatherIcon}@2x.png`;
  const formattedDate = new Date(weatherData.timestamp * 1000).toLocaleString();

  // Update local state when props change
  useEffect(() => {
    setCurrentFavoriteState(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // If removing from favorites, show removal animation
    if (currentFavoriteState && onFavoriteToggle) {
      setIsRemoving(true);
      // Call the parent's callback directly - parent will handle the API call
      onFavoriteToggle();
      return; // Exit early - parent component will handle the API call
    }
    
    // For adding to favorites, proceed as before
    setCurrentFavoriteState(!currentFavoriteState);
    
    try {
      // Only handle the "add to favorites" case here
      if (!currentFavoriteState) {
        await axios.post('/api/favorites', {
          cityName: weatherData.cityName,
          countryCode: weatherData.countryCode,
          lat: weatherData.lat || 0,
          lon: weatherData.lon || 0
        });
        
        // Call parent callback if provided
        if (onFavoriteToggle) {
          onFavoriteToggle();
        }
      }
    } catch (error: any) {
      // ...existing error handling...
      setCurrentFavoriteState(currentFavoriteState); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  // If removing, show a fade-out animation
  if (isRemoving) {
    return (
      <div className="animate-fadeOut">
        <Card className="opacity-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{weatherData.cityName}</CardTitle>
                <CardDescription>{weatherData.countryCode}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">Removing...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{weatherData.cityName}</CardTitle>
            <CardDescription>{weatherData.countryCode}</CardDescription>
          </div>
          <img 
            src={iconUrl} 
            alt={weatherData.weatherDescription} 
            className="w-16 h-16 -mt-4 -mr-4"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="text-4xl font-bold">{Math.round(weatherData.temperature)}°C</div>
          <div className="text-lg text-muted-foreground capitalize">
            {weatherData.weatherDescription}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Feels like {Math.round(weatherData.feelsLike)}°C</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Droplet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{weatherData.humidity}% Humidity</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{weatherData.windSpeed} m/s</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleToggleFavorite}
          disabled={loading}
        >
          <Star className={`mr-2 h-4 w-4 ${currentFavoriteState ? "fill-yellow-400" : ""}`} />
          {currentFavoriteState ? "Remove from favorites" : "Add to favorites"}
        </Button>
      </CardFooter>
    </Card>
  );
}
