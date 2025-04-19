/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LatLngTuple } from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

interface AirportMapProps {
  height?: string;
}

function AirportMapComponent({ height = "300px" }: AirportMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Changi Airport coordinates
  const changiAirport = {
    position: [1.3586, 103.9899] as LatLngTuple,
    name: "Changi Airport",
    description: "Singapore Changi Airport",
  };

  useEffect(() => {
    // Load CSS asynchronously to avoid TypeScript errors
    const loadLeafletCSS = async () => {
      try {
        await import("leaflet/dist/leaflet.css");
      } catch (error) {
        console.warn("Failed to load Leaflet CSS:", error);
      }
    };

    loadLeafletCSS();

    // Dynamic import để fix Leaflet icons
    const fixLeafletIcon = async () => {
      if (typeof window !== "undefined") {
        const L = await import("leaflet");
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;

        // @ts-ignore
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });
      }
    };

    fixLeafletIcon();
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card className="w-full shadow overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Loading Airport Map...</CardTitle>
        </CardHeader>
        <CardContent
          className="flex justify-center items-center"
          style={{ height }}
        >
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  // Dynamic import cho components React-Leaflet
  const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
  );
  const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
  );
  const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
  );
  const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
  );

  return (
    <Card className="w-full shadow overflow-hidden">
      <CardContent className="p-0">
        <div style={{ height, width: "100%" }}>
          <style jsx global>{`
            .leaflet-container {
              z-index: 10 !important;
            }
            .leaflet-pane,
            .leaflet-control {
              z-index: 10 !important;
            }
            .leaflet-top,
            .leaflet-bottom {
              z-index: 20 !important;
            }
          `}</style>
          <MapContainer
            center={changiAirport.position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={changiAirport.position}>
              <Popup>
                <strong>{changiAirport.name}</strong>
                <br />
                {changiAirport.description}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Use dynamic import to solve hydration issues with leaflet
const AirportMap = dynamic(() => Promise.resolve(AirportMapComponent), {
  ssr: false,
  loading: () => (
    <Card className="w-full shadow overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Loading Airport Map...</CardTitle>
      </CardHeader>
      <CardContent
        className="flex justify-center items-center"
        style={{ height: "300px" }}
      >
        <LoadingSpinner size="md" />
      </CardContent>
    </Card>
  ),
});

export default AirportMap;
