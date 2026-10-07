import classNames from 'classnames';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import KeywordHighlight from '../../common/KeywordHighlight';
import LinkOrSpan from '../../common/LinkOrSpan';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import type { AbstractSimpleEntity } from '../../entities/abstract';
import { isApiPreparing } from '../../entities/api';
import type { ConferenceEntity } from '../../entities/conference';
import AbstractPanel from './AbstractPanel';
import { getConferenceAbstracts, selectAbstractsInfo, selectGetAbstractsState } from './conferenceSlice';
import { formatAuthorCitation, getAbstractId, getAbstractUrl } from './conferenceUtilities';

interface TabNavigationBarProps {
  conference: ConferenceEntity;
  tab: string;
  onClick: (tab: string) => void;
}

const TabNavigationBar: React.FC<TabNavigationBarProps> = (props) => {
  const { conference, tab, onClick: onClickTab } = props;
  return (
    <ul className="nav nav-tabs mb-4 d-print-none">
      <li className="nav-item">
        <button className={classNames('nav-link', { active: tab === '' })} onClick={() => onClickTab('')}>
          All
        </button>
      </li>
      {conference.abstractGroups.map((abstractGroup) => (
        <li key={abstractGroup.uuid} className="nav-item">
          <button
            className={classNames('nav-link', { active: tab === abstractGroup.uuid })}
            onClick={() => onClickTab(abstractGroup.uuid ?? '')}
          >
            {abstractGroup.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

interface PageNavigationBarProps {
  conference: ConferenceEntity;
  abstract: AbstractSimpleEntity;
  abstractUuids: string[];
}

const PageNavigationBar: React.FC<PageNavigationBarProps> = (props) => {
  const { conference, abstract, abstractUuids } = props;
  const abstractsInfo = useAppSelector(selectAbstractsInfo);
  const abstractId = getAbstractId(conference, abstract);
  const idx = abstractUuids.findIndex((f) => f === abstract.uuid);
  const prevUuid = idx > 0 ? abstractUuids[idx - 1] : null;
  const nextUuid = idx !== -1 && idx < abstractUuids.length - 1 ? abstractUuids[idx + 1] : null;
  return (
    <nav className="page-navigation mb-4 d-print-none" aria-label="Page navigation">
      <ul className="pagination">
        <li className={classNames('page-item', { disabled: prevUuid == null })}>
          <LinkOrSpan
            className="page-link"
            aria-label="Previous"
            to={getAbstractUrl(conference, abstractsInfo.byId[prevUuid ?? ''])}
          >
            <span aria-hidden="true">&larr; </span>Previous
          </LinkOrSpan>
        </li>
        <li className="page-item">
          <span className="page-link active">
            <span>{abstractId}</span>
          </span>
        </li>
        <li className={classNames('page-item', { disabled: nextUuid == null })}>
          <LinkOrSpan
            className="page-link"
            aria-label="Next"
            to={getAbstractUrl(conference, abstractsInfo.byId[nextUuid ?? ''])}
          >
            Next<span aria-hidden="true"> &rarr;</span>
          </LinkOrSpan>
        </li>
      </ul>
    </nav>
  );
};

interface Props {
  conference: ConferenceEntity;
}

const AbstractListPanel: React.FC<Props> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  const abstractsInfo = useAppSelector(selectAbstractsInfo);
  const abstractsState = useAppSelector(selectGetAbstractsState);

  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = React.useState<string>('');
  const [tab, setTab] = React.useState<string>('');

  const hashAbstractGroups = location.hash.match(/^#\/groups\/(.*)/)?.[1] ?? null;
  const abstractGroups =
    (hashAbstractGroups != null && conference.abstractGroups.find((g) => g.shortName === hashAbstractGroups)) || null;
  const badAbstractGroups =
    hashAbstractGroups != null && abstractGroups == null && conference.abstractGroups.length > 0;

  const hashAbstractUuid = location.hash.match(/^#\/uuid\/(.*)/)?.[1] ?? null;
  const hasAbstract = hashAbstractUuid != null && abstractsInfo.allIds.includes(hashAbstractUuid);
  const badAbstract = hashAbstractUuid != null && !hasAbstract && abstractsInfo.allIds.length > 0;

  React.useEffect(() => {
    dispatch(getConferenceAbstracts(conference.uuid));
  }, [dispatch, conference.uuid]);

  // sync tab with location hash, keeping the current tab while an abstract is shown
  if (!badAbstractGroups) {
    if (abstractGroups != null && tab !== (abstractGroups.uuid ?? '')) {
      setTab(abstractGroups.uuid ?? '');
    } else if (abstractGroups == null && tab !== '' && !badAbstract && !hasAbstract) {
      setTab('');
    }
  }

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

  const onClickTab = (uuid: string) => {
    const abstractGroup = conference.abstractGroups.find((g) => g.uuid === uuid)?.shortName;
    const hash = abstractGroup != null ? `#/groups/${abstractGroup}` : '';
    navigate(`/conference/${conference.shortName}/abstracts${hash}`);
  };

  return (
    <>
      {badAbstract || badAbstractGroups ? (
        <PageNotFound />
      ) : (
        <div className="abstracts">
          <GeneralPanel title={conference.name} titleLinkTo={`/conference/${conference.shortName}/abstracts`}>
            <div>
              {isApiPreparing(abstractsState) && <LoadingOverlay message="Loading..." />}
              {abstractsInfo.allIds.length > 0 && (
                <>
                  <TabNavigationBar conference={conference} tab={tab} onClick={onClickTab} />
                  {hasAbstract ? (
                    <>
                      <PageNavigationBar
                        conference={conference}
                        abstract={abstractsInfo.byId[hashAbstractUuid]}
                        abstractUuids={abstractUuids}
                      />
                      <AbstractPanel conference={conference} abstract={abstractsInfo.byId[hashAbstractUuid]} />
                    </>
                  ) : (
                    <>
                      <div className="my-3 d-print-none">
                        <input
                          type="text"
                          placeholder="Search abstracts..."
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                        />
                      </div>
                      <div className="abstract-list list-group">
                        {abstractUuids.map((abstractUuid) => {
                          const abstract = abstractsInfo.byId[abstractUuid];
                          const abstractId = getAbstractId(conference, abstract);
                          const abstractUrl = getAbstractUrl(conference, abstract);
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
