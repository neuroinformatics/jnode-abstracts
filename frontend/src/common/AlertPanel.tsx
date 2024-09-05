import React from 'react';

import classNames from 'classnames';

export type AlertPanelVariant = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark';

interface Props {
  variant: AlertPanelVariant;
  title?: string;
  show?: boolean;
  dismissible?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

const AlertPanel: React.FC<Props> = (props) => {
  const { variant, title, show = true, dismissible = false, onClose, children } = props;

  const [isShow, setIsShow] = React.useState<boolean>(show);

  const onClickClose: React.MouseEventHandler<HTMLButtonElement> = () => {
    setIsShow(false);
    if (onClose) {
      onClose();
    }
  };
  return (
    <div
      className={classNames('alert', `alert-${variant}`, { 'alert-dismissible': dismissible }, 'fade', {
        show: isShow,
      })}
      role="alert"
    >
      {title != null && <div className="alert-heading h4">{title}</div>}
      {children}
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
          onClick={onClickClose}
        ></button>
      )}
    </div>
  );
};

export default AlertPanel;
