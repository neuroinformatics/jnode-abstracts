import React from 'react';

import type { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import GeneralPanel from '../../common/GeneralPanel';
import { type ConferenceEntity } from '../../entities/conference';

import 'leaflet/dist/leaflet.css';

interface Props {
  conference: ConferenceEntity;
}

interface FloorPlan {
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
    const getFloorPlan = (feature: Feature): FloorPlan | null => {
      if (feature.geometry.type === 'Point' && feature.properties != null) {
        const { name, description = null, floorplans } = feature.properties;
        if (name != null && floorplans != null && Array.isArray(floorplans)) {
          return { name, description, floorplans };
        }
      }
      return null;
    };
    if (data.type === 'FeatureCollection') {
      const featureCollection = data as FeatureCollection;
      return featureCollection.features.map((feature) => getFloorPlan(feature)).filter((data) => data != null);
    } else if (data.type === 'Feature') {
      const ret = getFloorPlan(data as Feature);
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
      {plans.map((plan, idx) => {
        return (
          <div key={`${idx}-${plan.name}`} className="text-center mb-3">
            <h2>{plan.name}</h2>
            {plan.description != null && <p>{plan.description}</p>}
            {plan.floorplans.map((url, idx2) => {
              return (
                <div key={`${idx}-${plan.name}-${idx2}`} className="border mb-5">
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
