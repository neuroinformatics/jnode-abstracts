import type { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import type React from 'react';
import GeneralPanel from '../../common/GeneralPanel';
import type { ConferenceEntity } from '../../entities/conference';

import 'leaflet/dist/leaflet.css';

interface Props {
  conference: ConferenceEntity;
}

interface FloorPlan {
  // feature id if exists, otherwise the position in the GeoJSON data
  key: string;
  name: string;
  description: string | null;
  floorplans: string[];
}

const ConferenceFloorplansPanel: React.FC<Props> = (props) => {
  const { conference } = props;

  if (conference.geo == null) {
    return null;
  }
  const data = JSON.parse(conference.geo) as GeoJsonObject;

  const getFloorPlans = (data: GeoJsonObject): FloorPlan[] => {
    const getFloorPlan = (feature: Feature, position: number): FloorPlan | null => {
      if (feature.geometry.type === 'Point' && feature.properties != null) {
        const { name, description = null, floorplans } = feature.properties;
        if (name != null && floorplans != null && Array.isArray(floorplans)) {
          const key = feature.id != null ? `id:${feature.id}` : `pos:${position}`;
          // drop duplicate urls so that each image can be keyed by its url
          return { key, name, description, floorplans: Array.from(new Set<string>(floorplans)) };
        }
      }
      return null;
    };
    if (data.type === 'FeatureCollection') {
      const featureCollection = data as FeatureCollection;
      return featureCollection.features
        .map((feature, position) => getFloorPlan(feature, position))
        .filter((data) => data != null);
    } else if (data.type === 'Feature') {
      const ret = getFloorPlan(data as Feature, 0);
      if (ret != null) {
        return [ret];
      }
    }
    return [];
  };

  const plans = getFloorPlans(data);
  if (plans.length === 0) {
    return null;
  }

  return (
    <GeneralPanel title="Floorplans">
      {plans.map((plan) => {
        return (
          <div key={plan.key} className="text-center mb-3">
            <h2>{plan.name}</h2>
            {plan.description != null && <p>{plan.description}</p>}
            {plan.floorplans.map((url) => {
              return (
                <div key={url} className="border mb-5">
                  <img src={url} alt={plan.name} />
                </div>
              );
            })}
          </div>
        );
      })}
    </GeneralPanel>
  );
};

export default ConferenceFloorplansPanel;
