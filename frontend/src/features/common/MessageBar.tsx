import React from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import { hideMessage, selectMessageState } from './commonSlice';

const MessageBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const messageState = useAppSelector(selectMessageState);
  const [isShow, setIsShow] = React.useState<boolean>(false);

  const onCloseAlert = React.useCallback(() => {
    setIsShow(false);
    dispatch(hideMessage());
  }, [dispatch]);

  React.useEffect(() => {
    if (messageState.variant != null) {
      setIsShow(true);
      setTimeout(() => {
        onCloseAlert();
      }, 10000);
    } else {
      setIsShow(false);
    }
  }, [dispatch, messageState.variant, onCloseAlert]);

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
