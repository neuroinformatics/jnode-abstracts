import React from 'react';

import { MathJaxContext } from 'better-react-mathjax';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { getConferenceList } from './features/conference/conferenceSlice';
import { restore, selectUserInfo } from './features/user/userSlice';
import FooterPanel from './main/FooterPanel';
import HeaderPanel from './main/HeaderPanel';
import MainPanel from './main/MainPanel';

let isFirst = true;

const MATHJAX_CONFIG = {
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: true,
  },
  svg: {
    fontCache: 'global',
  },
  options: {
    skipHtmlTags: ['svg', 'script', 'noscript', 'style', 'textarea', 'pre', 'code'],
  },
};

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
    <div className="app container">
      <MathJaxContext config={MATHJAX_CONFIG}>
        <HeaderPanel />
        <MainPanel />
        <FooterPanel />
      </MathJaxContext>
    </div>
  );
};

export default App;
