import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { tokens } from '../design-system/tokens';

type Props = {
  latitude: number;
  longitude: number;
  name: string;
};

/**
 * Read-only shop location map (iOS/Android). Uses react-native-maps — Apple Maps
 * on iOS, Google Maps on Android (needs an Android Google Maps API key in
 * app.json). A `.web.tsx` sibling renders nothing since the library has no web
 * build; Metro picks the right file per platform.
 */
export function ShopMap({ latitude, longitude, name }: Props) {
  return (
    <View
      style={{
        height: 220,
        borderRadius: tokens.radius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: tokens.colors.borderSubtle,
      }}
    >
      <MapView
        style={{ flex: 1 }}
        initialRegion={{ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={{ latitude, longitude }} title={name} />
      </MapView>
    </View>
  );
}
