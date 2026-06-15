import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

type Props = {
  latitude: number;
  longitude: number;
  name: string;
  address?: string | null;
};

/**
 * Small read-only location map for a shop, using free OpenStreetMap tiles via
 * Leaflet. A CircleMarker is used instead of the default pin so we don't depend
 * on Leaflet's marker image assets (which break under bundlers).
 */
export function ShopMap({ latitude, longitude, name, address }: Props) {
  return (
    <div
      style={{
        height: 260,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={[latitude, longitude]}
          radius={10}
          pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.6, weight: 2 }}
        >
          <Popup>
            <strong>{name}</strong>
            {address ? (
              <>
                <br />
                {address}
              </>
            ) : null}
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
