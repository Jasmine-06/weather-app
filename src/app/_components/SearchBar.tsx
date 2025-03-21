"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import citiesData from "@/data/cities.json";

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface SearchBarProps {
  onSelectCity: (city: City) => void;
}

export default function SearchBar({ onSelectCity }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState<number>(0);

  // Update the popover width when the component mounts or window resizes
  useEffect(() => {
    const updateWidth = () => {
      if (inputWrapperRef.current) {
        setInputWidth(inputWrapperRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = (citiesData as City[]).filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 5));
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try to find exact match in the cities data
      const city = (citiesData as City[]).find(
        c => c.name.toLowerCase() === query.toLowerCase()
      );
      
      if (city) {
        onSelectCity(city);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleSelectCity = (city: City) => {
    setQuery(city.name);
    onSelectCity(city);
    setIsOpen(false);
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex w-full max-w-md mx-auto items-center space-x-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <div ref={inputWrapperRef} className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for a city..."
                    className="pl-8"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent 
                className="p-0" 
                align="start" 
                style={{ width: inputWidth > 0 ? `${inputWidth}px` : '100%' }}
                sideOffset={5}
              >
                <Command>
                  <CommandList>
                    <CommandEmpty>No cities found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      {filteredCities.map((city) => (
                        <CommandItem
                          key={`${city.name}-${city.country}`}
                          onSelect={() => handleSelectCity(city)}
                        >
                          {city.name}, {city.country}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
