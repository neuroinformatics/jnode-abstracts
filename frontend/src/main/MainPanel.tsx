import React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from '../common/PageNotFound';
import ConferenceListPanel from '../features/conference/ConferenceListPanel';
import ConferenceRouterPanel from '../features/conference/ConferenceRouterPanel';
import ChangePasswordPanel from '../features/user/ChangePasswordPanel';
import LoginPanel from '../features/user/LoginPanel';
import LogoutPanel from '../features/user/LogoutPanel';
import AboutPanel from './AboutPanel';
import ContactPanel from './ContactPanel';

const MainPanel: React.FC = () => {
  return (
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Navigate to="/conferences" />} />
        <Route path="login" element={<LoginPanel />} />
        <Route path="logout" element={<LogoutPanel />} />
        <Route path="password" element={<ChangePasswordPanel />} />
        <Route path="about" element={<AboutPanel />} />
        <Route path="contact" element={<ContactPanel />} />
        <Route path="conferences" element={<ConferenceListPanel />} />
        <Route path="conference/:shortName/*" element={<ConferenceRouterPanel />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </main>
  );
};

export default MainPanel;
