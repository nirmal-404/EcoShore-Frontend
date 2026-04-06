import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HeatmapTracker = ({ beaches }) => {
  // Center map on Sri Lanka
  const center = [7.8731, 80.7718];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl shadow-emerald-500/5 border border-gray-100 dark:border-gray-700 mt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Sri Lanka Live Pollution Map
      </h3>
      <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600 relative z-0">
        <MapContainer
          center={center}
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {beaches?.map((beach) => {
            const coords = beach.location?.coordinates;
            // Leaflet uses [latitude, longitude], MongoDB sometimes uses [longitude, latitude]
            // heatmap.service exposes coords as [lon, lat] and we need it [lat, lon]
            if (!coords || coords.length !== 2) return null;

            // Check to make sure we don't map [0,0]
            if (coords[0] === 0 && coords[1] === 0) return null;

            // Map MongoDB format [lon, lat] to Leaflet [lat, lon]
            let lat, lon;
            if (coords[0] > 60 && coords[1] < 20) {
              // Format is [lon, lat] (correct for Sri Lanka: lon~79-81, lat~6-9)
              lon = coords[0];
              lat = coords[1];
            } else {
              // Format is likely [lat, lon] natively ? Just safely handle
              lat = coords[0];
              lon = coords[1];
            }

            const position = [lat, lon];

            // Color map
            let color = '#22c55e'; // default LOW
            if (beach.currentSeverityLevel === 'CRITICAL') color = '#ef4444';
            else if (beach.currentSeverityLevel === 'HIGH') color = '#f97316';
            else if (beach.currentSeverityLevel === 'MODERATE')
              color = '#eab308';

            return (
              <CircleMarker
                key={beach.beachId}
                center={position}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
                radius={10 + beach.currentSeverityScore / 10} // Scale radius slightly with score
              >
                <Popup>
                  <div className="font-sans font-medium text-gray-800">
                    <p className="font-bold text-sm mb-1">{beach.beachName}</p>
                    <p className="text-xs">
                      Severity Level:
                      <span className="font-bold ml-1" style={{ color }}>
                        {beach.currentSeverityLevel}
                      </span>
                    </p>
                    <p className="text-xs">
                      Score: {beach.currentSeverityScore.toFixed(1)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default HeatmapTracker;
