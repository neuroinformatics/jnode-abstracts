import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import type React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { AbstractSimpleEntity } from '../../entities/abstract';
import { showMessage } from '../common/commonSlice';
import { selectUserInfo } from '../user/userSlice';
import { addFavorite, removeFavorite, selectFavoriteAbstractsInfo } from './abstractSlice';

interface Props {
  abstract: AbstractSimpleEntity;
  className?: string;
}

/**
 * Toggles whether the abstract is a favorite of the logged in user; shown only while logged in.
 */
const FavoriteButton: React.FC<Props> = (props) => {
  const { abstract, className } = props;
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const favoritesInfo = useAppSelector(selectFavoriteAbstractsInfo);

  if (userInfo == null) {
    return null;
  }
  const isFavorite = favoritesInfo.allIds.includes(abstract.uuid);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    // the button may be placed inside a link
    e.preventDefault();
    e.stopPropagation();
    const request = isFavorite ? dispatch(removeFavorite(abstract.uuid)) : dispatch(addFavorite(abstract));
    request.then((result) => {
      if (result.meta.requestStatus === 'rejected') {
        dispatch(showMessage({ variant: 'danger', message: String(result.payload ?? '') }));
      }
    });
  };

  return (
    <button
      type="button"
      className={classNames('btn btn-sm btn-link p-0 d-print-none', className)}
      title={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
      aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFavorite}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faStar} className={isFavorite ? 'text-warning' : 'text-secondary opacity-25'} />
    </button>
  );
};

export default FavoriteButton;
