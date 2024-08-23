import React from 'react';

import { Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import PageNotFound from '../common/PageNotFound';
import LoginPanel from '../features/user/LoginPanel';
import LogoutPanel from '../features/user/LogoutPanel';
import { restore, selectUserInfo } from '../features/user/userSlice';

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
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="login" element={<LoginPanel />} />
        <Route path="logout" element={<LogoutPanel />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </main>
  );
};

export default MainPanel;
