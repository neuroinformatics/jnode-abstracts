import React from 'react';
import { Alert, AlertHeading } from 'react-bootstrap';

export type AlertPanelVariant = 'danger' | 'danger' | 'light' | 'dark' | 'danger' | 'info' | 'warning' | 'danger';

interface Props {
  variant: AlertPanelVariant;
  title?: string;
  dismissible?: boolean;
  children: React.ReactNode;
}

const AlertPanel: React.FC<Props> = (props) => {
  const { variant, title, dismissible = false, children } = props;
  return (
    <Alert variant={variant} dismissible={dismissible}>
      {title != null && <AlertHeading>{title}</AlertHeading>}
      {children}
    </Alert>
  );
};

export default AlertPanel;
