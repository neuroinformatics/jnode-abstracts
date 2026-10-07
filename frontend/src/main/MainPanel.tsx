import type React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from '../common/PageNotFound';
import AbstractEditorPanel from '../features/abstract/AbstractEditorPanel';
import AbstractViewPanel from '../features/abstract/AbstractViewPanel';
import MyAbstractsPanel from '../features/abstract/MyAbstractsPanel';
import DashboardAccountsPanel from '../features/account/DashboardAccountsPanel';
import MessageBar from '../features/common/MessageBar';
import ConferenceListPanel from '../features/conference/ConferenceListPanel';
import ConferenceRouterPanel from '../features/conference/ConferenceRouterPanel';
import DashboardConferenceCreatePanel from '../features/conference/DashboardConferenceCreatePanel';
import DashboardConferenceRouterPanel from '../features/conference/DashboardConferenceRouterPanel';
import ChangeEmailPanel from '../features/user/ChangeEmailPanel';
import ChangePasswordPanel from '../features/user/ChangePasswordPanel';
import ForgotPasswordPanel from '../features/user/ForgotPasswordPanel';
import LoginPanel from '../features/user/LoginPanel';
import LogoutPanel from '../features/user/LogoutPanel';
import ResetPasswordPanel from '../features/user/ResetPasswordPanel';
import AboutPanel from './AboutPanel';
import ContactPanel from './ContactPanel';

const MainPanel: React.FC = () => {
  return (
    <main className="main-content">
      <MessageBar />
      <Routes>
        <Route path="/" element={<Navigate to="/conferences" />} />
        <Route path="login" element={<LoginPanel />} />
        <Route path="logout" element={<LogoutPanel />} />
        <Route path="forgotpassword" element={<ForgotPasswordPanel />} />
        <Route path="resetpassword" element={<ResetPasswordPanel />} />
        <Route path="password" element={<ChangePasswordPanel />} />
        <Route path="email" element={<ChangeEmailPanel />} />
        <Route path="about" element={<AboutPanel />} />
        <Route path="contact" element={<ContactPanel />} />
        <Route path="conferences" element={<ConferenceListPanel />} />
        <Route path="conference/:shortName/*" element={<ConferenceRouterPanel />} />
        <Route path="abstracts/:uuid" element={<AbstractViewPanel />} />
        <Route path="myabstracts" element={<MyAbstractsPanel />} />
        <Route path="myabstracts/:uuid/edit" element={<AbstractEditorPanel />} />
        <Route path="dashboard/conference" element={<DashboardConferenceCreatePanel />} />
        <Route path="dashboard/conference/:uuid/*" element={<DashboardConferenceRouterPanel />} />
        <Route path="dashboard/accounts" element={<DashboardAccountsPanel />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </main>
  );
};

export default MainPanel;
