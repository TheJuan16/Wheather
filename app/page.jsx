"use client";
import { useState, useEffect } from "react";
import { getWeatherByCity, getWeatherByCoords } from "@/lib/weather";
import InstallPrompt from "./components/InstallPrompt";

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cachedWeather = localStorage.getItem("last_weather");
    if (cachedWeather) {
      setWeather(JSON.parse(cachedWeather));
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    executeFetch(() => getWeatherByCity(city));
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        executeFetch(() => getWeatherByCoords(latitude, longitude));
      },
      () => setError("Permiso de ubicación denegado.")
    );
  };

  const executeFetch = async (apiCall) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiCall();
      setWeather(data);

      localStorage.setItem("last_weather", JSON.stringify(data));
    } catch (err) {
      setError(err.message || "Error al obtener datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1329] text-white p-4 flex flex-col items-center justify-center">
      {/* Contenedor Principal */}
      <div className="w-full max-w-lg bg-[#11192e] p-6 rounded-xl flex flex-col gap-4 border border-slate-800/80 shadow-2xl">
        
        {/* Encabezado con InstallPrompt opcional */}
        <header className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold text-cyan-400">WeatherPWA</h1>
          <InstallPrompt />
        </header>

        {/* Controles de Búsqueda y Ubicación */}
        <section className="space-y-3">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Ejemplo: Oaxaca, Madrid..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#1b2640] text-slate-200 placeholder-slate-400 px-4 py-2.5 rounded-lg border border-slate-700/60 focus:outline-none focus:border-cyan-500 transition"
            />
            <button
              type="submit"
              className="bg-[#00a8e8] hover:bg-[#0096d1] text-white font-bold px-5 py-2.5 rounded-lg transition shrink-0"
            >
              Buscar
            </button>
          </form>

          <button
            onClick={handleGeoLocation}
            className="w-full bg-[#1b2640] hover:bg-[#233152] text-cyan-400 font-semibold py-2.5 rounded-lg border border-slate-700/60 flex items-center justify-center gap-2 transition text-sm"
          >
            <span>📍</span> Usar mi ubicación actual
          </button>
        </section>

        {/* Indicadores de Estado */}
        {loading && (
          <p className="text-slate-400 animate-pulse text-center py-4">
            Cargando datos del clima...
          </p>
        )}
        
        {error && (
          <p className="text-red-400 font-medium bg-red-950/40 p-3 rounded-lg border border-red-800/60 text-center text-sm">
            {error}
          </p>
        )}

        {/* Tarjeta con los Datos del Clima */}
        {weather && !loading && (
          <article className="bg-[#1b2640] rounded-xl p-8 flex flex-col items-center border border-slate-700/60 mt-1 shadow-lg">
            <h2 className="text-white text-3xl font-extrabold tracking-wide mb-6 text-center">
              {weather.name}, {weather.sys.country}
            </h2>

            {/* Icono y Temperatura */}
            <div className="flex items-center justify-center gap-4 my-2">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="w-16 h-16 object-contain"
              />
              <span className="text-white text-6xl font-black">
                {Math.round(weather.main.temp)}°C
              </span>
            </div>

            {/* Descripción */}
            <p className="capitalize text-slate-300 text-lg font-medium mt-6 mb-8">
              {weather.weather[0].description}
            </p>

            <hr className="w-full border-slate-700/60 mb-6" />

            {/* Detalles Inferiores */}
            <div className="w-full flex justify-around text-slate-300 text-sm font-medium">
              <div>
                Humedad: <strong className="text-white font-bold">{weather.main.humidity}%</strong>
              </div>
              <div>
                Viento: <strong className="text-white font-bold">{weather.wind.speed} m/s</strong>
              </div>
            </div>
          </article>
        )}

      </div>
    </main>
  );
}
