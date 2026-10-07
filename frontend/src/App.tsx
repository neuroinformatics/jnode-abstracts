import { MathJaxContext } from 'better-react-mathjax';
import React from 'react';
import { ScrollRestoration } from 'react-router-dom';
import { useAppDispatch } from './app/hooks';
import { getConfig } from './features/common/commonSlice';
import { getConferenceList } from './features/conference/conferenceSlice';
import { restore } from './features/user/userSlice';
import FooterPanel from './main/FooterPanel';
import HeaderPanel from './main/HeaderPanel';
import MainPanel from './main/MainPanel';

let isFirst = true;

// MathJax is served by this site (see scripts/copy-mathjax.mjs) instead of a CDN
const MATHJAX_SRC = '/mathjax/tex-mml-chtml.js';

const MATHJAX_CONFIG = {
  loader: {
    // the safe extension drops dangerous links and styles, e.g. \href{javascript:...} in abstracts
    load: ['ui/safe'],
    paths: { fonts: '/mathjax/fonts' },
  },
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

  React.useEffect(() => {
    if (isFirst) {
      isFirst = false;
      dispatch(getConfig());
      dispatch(restore());
      dispatch(getConferenceList());
    }
  }, [dispatch]);

  return (
    <div className="app container">
      <MathJaxContext config={MATHJAX_CONFIG} src={MATHJAX_SRC}>
        <HeaderPanel />
        <MainPanel />
        <FooterPanel />
        <ScrollRestoration />
      </MathJaxContext>
    </div>
  );
};

export default App;
