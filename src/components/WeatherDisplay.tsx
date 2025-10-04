import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudSnow, Wind } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

const WeatherDisplay = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 60000);

    // Fetch weather data for Burlington, IL
    const fetchWeather = async () => {
      try {
        // Using Open-Meteo API (free, no API key needed)
        // Burlington, IL coordinates: 42.0456° N, 88.5534° W
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=42.0456&longitude=-88.5534&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America/Chicago'
        );
        const data = await response.json();
        
        // Map weather codes to conditions
        const getWeatherCondition = (code: number) => {
          if (code === 0) return "Clear";
          if (code <= 3) return "Partly Cloudy";
          if (code <= 67) return "Rainy";
          if (code <= 77) return "Snowy";
          if (code <= 99) return "Stormy";
          return "Cloudy";
        };

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition: getWeatherCondition(data.current.weather_code),
          icon: data.current.weather_code.toString()
        });
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const weatherTimer = setInterval(fetchWeather, 1800000);

    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
    };
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className="h-4 w-4" />;
      case "rainy":
        return <CloudRain className="h-4 w-4" />;
      case "snowy":
        return <CloudSnow className="h-4 w-4" />;
      case "stormy":
        return <Wind className="h-4 w-4" />;
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center gap-2 lg:gap-4 text-[0.8625rem] font-bold text-primary-foreground">
      {/* Desktop only: Full date */}
      <span className="hidden lg:inline">{formatDate(dateTime)}</span>
      
      {weather && (
        <>
          <span className="hidden lg:inline">|</span>
          <a 
            href="https://weather.com/weather/radar/interactive/l/53203840c46936ec797e1de85c5a5467b73139e1ca5e1a3c2ff94e5c1f302cc9" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 lg:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {getWeatherIcon(weather.condition)}
            <span>{weather.temp}°F</span>
            <span className="hidden lg:inline">{weather.condition}</span>
          </a>
        </>
      )}
    </div>
  );
};

export default WeatherDisplay;
