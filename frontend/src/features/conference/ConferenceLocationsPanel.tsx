import React from 'react';

import type { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import { type LatLngExpression, Layer, latLng } from 'leaflet';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import GeneralPanel from '../../common/GeneralPanel';
import type { ConferenceEntity } from '../../entities/conference';

import 'leaflet/dist/leaflet.css';

interface Props {
  conference: ConferenceEntity;
}

const ConferenceLocationsPanel: React.FC<Props> = (props) => {
  const { conference } = props;

  // const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const url = 'https://{s}.tile.openstreetmap.jp/{z}/{x}/{y}.png';

  if (conference.geo == null) {
    return null;
  }
  const data = JSON.parse(conference.geo) as GeoJsonObject;

  const getCenter = (data: GeoJsonObject): LatLngExpression => {
    if (data.type === 'FeatureCollection') {
      const featureCollection = data as FeatureCollection;
      for (const feature of featureCollection.features) {
        if (feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates;
          return latLng(coordinates[1], coordinates[0]);
        }
      }
    }
    return latLng(35.7809183, 139.6089651); // RIKEN
  };

  const center = getCenter(data);

  const onEachFeature = (feature: Feature, layer: Layer) => {
    if (feature.properties != null) {
      const { name, description } = feature.properties;
      if (name != null) {
        const text = `<b>${name}</b>${description != null ? `<br />${description}` : ''}`;
        layer.bindPopup(text);
      }
    }
  };

  return (
    <GeneralPanel title="Locations">
      <MapContainer center={center} zoom={13} zoomControl={true} id="map">
        <TileLayer attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' url={url} />
        <GeoJSON data={data} onEachFeature={onEachFeature} />
      </MapContainer>
    </GeneralPanel>
  );
};

export default ConferenceLocationsPanel;
