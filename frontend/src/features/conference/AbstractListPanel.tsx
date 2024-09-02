import React from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import KeywordHighlight from '../../common/KeywordHighlight';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import { ApiAsyncStatus } from '../../entities/api';
import { ConferenceEntity } from '../../entities/conference';
import AbstractPanel from './AbstractPanel';
import { getConferenceAbstracts, selectAbstractsInfo, selectGetAbstractsState } from './conferenceSlice';
import { formatAuthorCitation, getAbstractId } from './conferenceUtilities';

interface Props {
  conference: ConferenceEntity;
}

const AbstractListPanel: React.FC<Props> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  // const userInfo = useAppSelector(selectUserInfo);
  const abstractsInfo = useAppSelector(selectAbstractsInfo);
  const abstractsState = useAppSelector(selectGetAbstractsState);

  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = React.useState<string>('');
  const [tab, setTab] = React.useState<string>('');

  const hashAbstractUuid = location.hash.match(/^#\/uuid\/(.*)/)?.[1] ?? null;
  const hasAbstract = hashAbstractUuid != null && abstractsInfo.allIds.includes(hashAbstractUuid);
  const badAbstract = hashAbstractUuid != null && !hasAbstract && abstractsInfo.allIds.length > 0;

  React.useEffect(() => {
    dispatch(getConferenceAbstracts(conference.uuid));
  }, [dispatch, conference.uuid]);

  // const isAdmin = userInfo?.isAdmin ?? false;

  const filterTab = (uuid: string): boolean => {
    return tab === '' ? true : abstractsInfo.byId[uuid].abstractGroupUuid === tab;
  };
  const filterKeyword = (uuid: string): boolean => {
    const _keyword = keyword.toUpperCase();
    const abstract = abstractsInfo.byId[uuid];
    return (
      abstract.title.toUpperCase().includes(_keyword) ||
      abstract.text.toUpperCase().includes(_keyword) ||
      abstract.authors.find((author) => {
        return (
          author.firstName.toUpperCase().includes(_keyword) ||
          (author.middleName?.toUpperCase().includes(_keyword) ?? false) ||
          author.lastName.toUpperCase().includes(_keyword)
        );
      }) != null
    );
  };
  const abstractUuids = abstractsInfo.allIds.filter(filterTab).filter(filterKeyword);

  const onClickTab = (name: string) => {
    setTab(name);
    if (location.hash.length > 0) {
      navigate(`/conferences/${conference.shortName}/abstracts`);
    }
  };

  return (
    <>
      {badAbstract ? (
        <PageNotFound />
      ) : (
        <div className="abstracts">
          <GeneralPanel title={conference.name} titleLinkTo={`/conferences/${conference.shortName}/abstracts`}>
            <div>
              {abstractsState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Loading..." />}
              {abstractsInfo.allIds.length > 0 && (
                <>
                  <ul className="nav nav-tabs d-print-none">
                    <li className="nav-item">
                      <button className={`nav-link${tab === '' ? ' active' : ''}`} onClick={() => onClickTab('')}>
                        All
                      </button>
                    </li>
                    {conference.abstractGroups.map((abstractGroup) => (
                      <li key={abstractGroup.uuid} className="nav-item">
                        <button
                          className={`nav-link${tab === abstractGroup.uuid ? ' active' : ''}`}
                          onClick={() => onClickTab(abstractGroup.uuid)}
                        >
                          {abstractGroup.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {hasAbstract ? (
                    <AbstractPanel conference={conference} abstract={abstractsInfo.byId[hashAbstractUuid]} />
                  ) : (
                    <>
                      <div className="my-3 d-print-none">
                        <input
                          type="text"
                          placeholder="Search abstracts..."
                          onChange={(e) => setKeyword(e.target.value)}
                        />
                      </div>
                      <div className="abstract-list list-group">
                        {abstractUuids.map((abstractUuid) => {
                          const abstract = abstractsInfo.byId[abstractUuid];
                          const abstractId = getAbstractId(conference, abstract);
                          const abstractUrl = `/conferences/${conference.shortName}/abstracts#/uuid/${abstract.uuid}`;
                          return (
                            <div key={abstractUuid} className="list-group-item" onClick={() => navigate(abstractUrl)}>
                              <div className="abstract">
                                <div className="sortId">{abstractId}</div>
                                <div className="box">
                                  <h5 className="my-1">
                                    <KeywordHighlight keyword={keyword}>{abstract.title}</KeywordHighlight>
                                  </h5>
                                  <div className="list-group-item-text">
                                    <ul className="authors">
                                      {abstract.authors.map((author) => (
                                        <li key={author.uuid}>
                                          <KeywordHighlight keyword={keyword}>
                                            {formatAuthorCitation(author)}
                                          </KeywordHighlight>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </GeneralPanel>
        </div>
      )}
    </>
  );
};

export default AbstractListPanel;
