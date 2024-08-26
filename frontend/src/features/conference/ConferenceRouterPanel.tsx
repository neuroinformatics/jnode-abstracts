import React from 'react';

import { Route, Routes } from 'react-router-dom';
import PageNotFound from '../../common/PageNotFound';
import ConferenceListPanel from './ConferenceListPanel';
import ConferencesDetailPanel from './ConferencesDetailRouterPanel';

const ConferenceRouterPanel: React.FC = () => {
  return (
    <div className="conferences">
      <Routes>
        <Route path="/" element={<ConferenceListPanel />} />
        <Route path="/:shortName/*" element={<ConferencesDetailPanel />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

export default ConferenceRouterPanel;
