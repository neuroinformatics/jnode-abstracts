import type React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import type { AbstractSimpleEntity } from '../../entities/abstract';
import { isApiPreparing } from '../../entities/api';
import { selectConferencesInfo } from '../conference/conferenceSlice';
import { formatAbstractAuthorsCitation } from '../conference/conferenceUtilities';
import { selectIsPreparingUserInfo, selectUserInfo } from '../user/userSlice';
import { selectFavoriteAbstractsInfo, selectGetFavoritesState } from './abstractSlice';
import FavoriteButton from './FavoriteButton';

const FavoriteAbstractsPanel: React.FC = () => {
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);
  const favoritesInfo = useAppSelector(selectFavoriteAbstractsInfo);
  const favoritesState = useAppSelector(selectGetFavoritesState);
  const conferencesInfo = useAppSelector(selectConferencesInfo);

  if (userInfo == null) {
    return isPreparingUserInfo ? null : <Navigate to="/login" />;
  }

  // group the favorites by conference, keeping the order of the list (newest conferences first)
  const groups: { conferenceUuid: string; abstracts: AbstractSimpleEntity[] }[] = [];
  favoritesInfo.allIds.forEach((uuid) => {
    const abstract = favoritesInfo.byId[uuid];
    const group = groups.find((g) => g.conferenceUuid === abstract.conferenceUuid);
    if (group != null) {
      group.abstracts.push(abstract);
    } else {
      groups.push({ conferenceUuid: abstract.conferenceUuid, abstracts: [abstract] });
    }
  });

  return (
    <GeneralPanel title="My Favourites">
      {isApiPreparing(favoritesState) && <LoadingOverlay message="Loading..." />}
      {favoritesInfo.allIds.length === 0 && !isApiPreparing(favoritesState) && (
        <p>You have no favourite abstracts yet. Mark abstracts with the star in the abstract lists.</p>
      )}
      {groups.map((group) => {
        const conference = conferencesInfo.byId[group.conferenceUuid];
        return (
          <div key={group.conferenceUuid} className="mb-4">
            <h5>
              {conference != null ? (
                <Link to={`/conference/${conference.shortName}`}>{conference.name}</Link>
              ) : (
                'Unknown conference'
              )}
            </h5>
            <ul className="list-group">
              {group.abstracts.map((abstract) => (
                <li key={abstract.uuid} className="list-group-item d-flex align-items-start gap-2">
                  <FavoriteButton abstract={abstract} className="mt-1" />
                  <div>
                    <Link to={`/abstracts/${abstract.uuid}`}>{abstract.title}</Link>
                    <div className="small text-secondary">{formatAbstractAuthorsCitation(abstract)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </GeneralPanel>
  );
};

export default FavoriteAbstractsPanel;
