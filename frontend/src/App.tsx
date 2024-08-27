import React from 'react';

import { Container } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { getConferenceList } from './features/conference/conferenceSlice';
import { restore, selectUserInfo } from './features/user/userSlice';
import FooterPanel from './main/FooterPanel';
import HeaderPanel from './main/HeaderPanel';
import MainPanel from './main/MainPanel';

let isFirst = true;

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);

  React.useEffect(() => {
    if (isFirst) {
      isFirst = false;
      dispatch(restore());
    }
    dispatch(getConferenceList());
  }, [dispatch, userInfo]);

  return (
    <Container className="app">
      <HeaderPanel />
      <MainPanel />
      <FooterPanel />
    </Container>
  );
};

export default App;
