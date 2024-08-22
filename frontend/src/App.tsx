import React from 'react';

import { Container } from 'react-bootstrap';
import FooterPanel from './main/FooterPanel';
import HeaderPanel from './main/HeaderPanel';
import MainPanel from './main/MainPanel';

const App: React.FC = () => {
  return (
    <Container className="app">
      <HeaderPanel />
      <MainPanel />
      <FooterPanel />
    </Container>
  );
};

export default App;
