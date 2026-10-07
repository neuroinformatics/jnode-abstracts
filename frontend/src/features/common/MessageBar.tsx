import React from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import { hideMessage, selectMessageState } from './commonSlice';

const MessageBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const messageState = useAppSelector(selectMessageState);
  const isShow = messageState.variant != null;

  const onCloseAlert = React.useCallback(() => {
    dispatch(hideMessage());
  }, [dispatch]);

  React.useEffect(() => {
    if (messageState.variant != null) {
      const timer = setTimeout(() => {
        onCloseAlert();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [messageState.variant, onCloseAlert]);

  return (
    <>
      {isShow && (
        <AlertPanel
          variant={messageState.variant || 'danger'}
          show={messageState.variant != null}
          dismissible
          onClose={onCloseAlert}
        >
          {messageState.message}
        </AlertPanel>
      )}
    </>
  );
};

export default MessageBar;
