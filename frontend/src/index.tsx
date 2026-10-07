import React from 'react';

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import { store } from './app/store';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';

const router = createBrowserRouter([{ path: '*', element: <App /> }]);

const rootElement = document.getElementById('root');
if (rootElement == null) {
  throw new Error('root element not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
