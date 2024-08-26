import React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import PageNotFound from '../common/PageNotFound';
import ConferenceRouterPanel from '../features/conference/ConferenceRouterPanel';
import LoginPanel from '../features/user/LoginPanel';
import LogoutPanel from '../features/user/LogoutPanel';
import { restore, selectUserInfo } from '../features/user/userSlice';
import AboutPanel from './AboutPanel';
import ContactPanel from './ContactPanel';

const MainPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);

  React.useEffect(() => {
    if (userInfo == null) {
      dispatch(restore());
    }
  }, [dispatch, userInfo]);

  return (
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Navigate to="/conferences" />} />
        <Route path="login" element={<LoginPanel />} />
        <Route path="logout" element={<LogoutPanel />} />
        <Route path="about" element={<AboutPanel />} />
        <Route path="contact" element={<ContactPanel />} />
        <Route path="conferences/*" element={<ConferenceRouterPanel />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </main>
  );
};

export default MainPanel;
