import type React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import GeneralPanel from '../../common/GeneralPanel';
import type { ConferenceEntity } from '../../entities/conference';
import { selectIsPreparingUserInfo, selectUserInfo } from '../user/userSlice';
import AbstractEditor from './AbstractEditor';

interface Props {
  conference: ConferenceEntity;
}

const AbstractSubmissionPanel: React.FC<Props> = (props) => {
  const { conference } = props;
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);

  if (userInfo == null) {
    return isPreparingUserInfo ? null : <Navigate to="/login" />;
  }
  const isManager = userInfo.isAdmin || conference.isOwner;

  return (
    <GeneralPanel title={conference.name} titleLinkTo={`/conference/${conference.shortName}`}>
      <h3 className="mb-3">New abstract</h3>
      {conference.isOpen || isManager ? (
        <AbstractEditor key="new" conference={conference} abstract={null} />
      ) : (
        <AlertPanel variant="warning">The submission for this conference is closed.</AlertPanel>
      )}
    </GeneralPanel>
  );
};

export default AbstractSubmissionPanel;
