import React from 'react';
import { tokens } from '../design-system/tokens';

type Props = {
  latitude: number;
  longitude: number;
  name: string;
};

/**
 * Web build of the shop map. react-native-maps has no web support, so on the
 * Expo web target (`expo start --web`) we embed a free, keyless OpenStreetMap
 * map via an iframe — same provider as the web app's Leaflet map. The native
 * `ShopMap.tsx` uses react-native-maps; Metro picks the right file per platform.
 */
export function ShopMap({ latitude, longitude, name }: Props) {
  const d = 0.006; // ~600m half-span box around the marker
  const bbox = `${longitude - d},${latitude - d},${longitude + d},${latitude + d}`;
  const src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}` +
    `&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div
      style={{
        height: 220,
        borderRadius: tokens.radius.xl,
        overflow: 'hidden',
        border: `1px solid ${tokens.colors.borderSubtle}`,
      }}
    >
      <iframe
        title={`Map showing ${name}`}
        src={src}
        loading="lazy"
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    </div>
  );
}
