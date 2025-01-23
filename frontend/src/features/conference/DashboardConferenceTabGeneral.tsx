import React from 'react';

import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import moment, { Moment } from 'moment';
import Datetime from 'react-datetime';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ApiAsyncStatus } from '../../entities/api';
import { TopicEntity } from '../../entities/conference';
import { DashboardConferenceTabProps } from './DashboardConferenceTab';
import { getConferenceDetail, selectPageActionState, unsetPageActionState, updateConference } from './conferenceSlice';
import { getBannerUrl, getLogoUuid, getThumbnailUuid } from './conferenceUtilities';

import 'react-datetime/css/react-datetime.css';
import { showMessage } from '../common/commonSlice';
import styles from './DashboardConferenceTabGeneral.module.scss';

interface TopicItem extends TopicEntity {
  id: string;
}

interface TopicSortableItemProps {
  item: TopicItem;
  onClickDelete: (item: TopicEntity) => void;
}

const TopicSortableItem: React.FC<TopicSortableItemProps> = (props) => {
  const { item, onClickDelete } = props;
  const { isDragging, setActivatorNodeRef, attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={classNames(styles.topicItemWrapper, {
        active: isDragging,
      })}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className={styles.topicItem}>
        <div className={styles.topicItemContent}>
          <span
            className="badge bg-secondary"
            ref={setActivatorNodeRef}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            {...attributes}
            {...listeners}
          >
            {item.topic}
          </span>
          <a className={styles.topicRemoveBtn} onClick={() => onClickDelete(item)}>
            <FontAwesomeIcon icon={faTrash} />
          </a>
        </div>
      </div>
    </div>
  );
};

const DashboardConferenceTabGeneral: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  const pageActionState = useAppSelector(selectPageActionState);

  const [isOpen, setIsOpen] = React.useState<boolean>(conference.isOpen);
  const [isPublished, setIsPublished] = React.useState<boolean>(conference.isPublished);
  const [isActive, setIsActive] = React.useState<boolean>(conference.isActive);
  const [name, setName] = React.useState<string>(conference.name);
  const [shortName, setShortName] = React.useState<string>(conference.shortName);
  const [conferenceGroup, setConferenceGroup] = React.useState<string>(conference.conferenceGroup ?? '');
  const [cite, setCite] = React.useState<string>(conference.cite ?? '');
  const [startDate, setStartDate] = React.useState<Moment | string>(
    conference.startDate === '' ? '' : moment(conference.startDate),
  );
  const [endDate, setEndDate] = React.useState<Moment | string>(
    conference.endDate === '' ? '' : moment(conference.endDate),
  );
  const [deadline, setDeadline] = React.useState<Moment | string>(
    conference.deadline === '' ? '' : moment(conference.deadline),
  );
  const [logoUuid, setLogoUuid] = React.useState<string | null>(getLogoUuid(conference));
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoLink, setLogoLink] = React.useState<string>(conference.logo ?? '');
  const [thumbnailUuid, setThumbnailUuid] = React.useState<string | null>(getThumbnailUuid(conference));
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [thumbnailLink, setThumbnailLink] = React.useState<string>(conference.thumbnail ?? '');
  const [iosApp, setIosApp] = React.useState<string>(conference.iosApp ?? '');
  const [link, setLink] = React.useState<string>(conference.link ?? '');
  const [description, setDescription] = React.useState<string>(conference.description);
  const [notice, setNotice] = React.useState<string>(conference.notice ?? '');
  const [hasPresentationPrefs, setHasPresentationPrefs] = React.useState<boolean>(conference.hasPresentationPrefs);
  const [topics, setTopics] = React.useState<TopicItem[]>(
    conference.topics.map((topic) => {
      return { ...topic, id: topic.uuid };
    }),
  );
  const [addTopic, setAddTopic] = React.useState<string>('');
  const [abstractMaxLength, setAbstractMaxLength] = React.useState<number>(conference.abstractMaxLength);
  const [abstractMaxFigures, setAbstractMaxFigures] = React.useState<number>(conference.abstractMaxFigures);

  React.useEffect(() => {
    if (pageActionState.type === 'general') {
      if (pageActionState.status === ApiAsyncStatus.idle) {
        const message = 'Info successfully updated.';
        dispatch(showMessage({ variant: 'success', message }));
        dispatch(getConferenceDetail(conference.uuid));
        dispatch(unsetPageActionState());
      } else if (pageActionState.status === ApiAsyncStatus.failed) {
        dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
        dispatch(unsetPageActionState());
      }
    }
  }, [conference.uuid, dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const onSubmitSave = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      dispatch(
        updateConference({
          uuid: conference.uuid,
          isOpen,
          isPublished,
          isActive,
          name,
          shortName,
          conferenceGroup,
          cite,
          startDate: moment.isMoment(startDate) ? startDate.format('YYYY-MM-DD[T]HH:mm:SS') : '',
          endDate: moment.isMoment(endDate) ? endDate.format('YYYY-MM-DD[T]HH:mm:SS') : '',
          deadline: moment.isMoment(deadline) ? deadline.format('YYYY-MM-DD[T]HH:mm:SS') : '',
          logoUuid,
          logoFile,
          logoLink,
          thumbnailUuid,
          thumbnailFile,
          thumbnailLink,
          iosApp,
          link,
          description,
          notice,
          hasPresentationPrefs,
          topics,
          abstractMaxLength,
          abstractMaxFigures,
        }),
      );
    },
    [
      abstractMaxFigures,
      abstractMaxLength,
      cite,
      conference.uuid,
      conferenceGroup,
      deadline,
      description,
      dispatch,
      endDate,
      hasPresentationPrefs,
      iosApp,
      isActive,
      isOpen,
      isPublished,
      link,
      logoFile,
      logoLink,
      logoUuid,
      name,
      notice,
      shortName,
      startDate,
      thumbnailFile,
      thumbnailLink,
      thumbnailUuid,
      topics,
    ],
  );

  console.log(conference);

  return (
    <div className={styles.general}>
      <div className="row">
        <label htmlFor="submission" className="col-sm-2 col-form-label">
          Submission
        </label>
        <div className="col-sm-10 form-check">
          <input
            id="submission"
            type="checkbox"
            className="form-check-input"
            checked={isOpen}
            onChange={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>
      <div className="row">
        <label htmlFor="published" className="col-sm-2 col-form-label">
          Published
        </label>
        <div className="col-sm-10 form-check">
          <input
            id="published"
            type="checkbox"
            className="form-check-input"
            checked={isPublished}
            onChange={() => setIsPublished(!isPublished)}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="active" className="col-sm-2 col-form-label">
          Active
        </label>
        <div className="col-sm-10 form-check">
          <input
            id="active"
            type="checkbox"
            className="form-check-input"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="name" className="col-sm-2 col-form-label">
          Name
        </label>
        <div className="col-sm-10">
          <input
            id="name"
            type="text"
            className="form-control"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="short" className="col-sm-2 col-form-label">
          Short
        </label>
        <div className="col-sm-10">
          <input
            id="short"
            type="text"
            className="form-control"
            placeholder="Short name"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            maxLength={255}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="group" className="col-sm-2 col-form-label">
          Group
        </label>
        <div className="col-sm-10">
          <input
            id="group"
            type="text"
            className="form-control"
            placeholder="The conference group"
            value={conferenceGroup}
            onChange={(e) => setConferenceGroup(e.target.value)}
            maxLength={255}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="cite" className="col-sm-2 col-form-label">
          Cite
        </label>
        <div className="col-sm-10">
          <input
            id="cite"
            type="text"
            className="form-control"
            placeholder="Cite text"
            value={cite}
            onChange={(e) => setCite(e.target.value)}
            maxLength={255}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="start" className="col-sm-2 col-form-label">
          Start
        </label>
        <div className="col-sm-10">
          <Datetime
            dateFormat="YYYY-MM-DD"
            timeFormat={false}
            inputProps={{ id: 'start', placeholder: 'Start date' }}
            value={startDate}
            onChange={(value) => setStartDate(value)}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="end" className="col-sm-2 col-form-label">
          End
        </label>
        <div className="col-sm-10">
          <Datetime
            dateFormat="YYYY-MM-DD"
            timeFormat={false}
            inputProps={{ id: 'end', placeholder: 'End date' }}
            value={endDate}
            onChange={(value) => setEndDate(value)}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="deadline" className="col-sm-2 col-form-label">
          Deadline
        </label>
        <div className="col-sm-10">
          <Datetime
            dateFormat="YYYY-MM-DD"
            timeFormat={false}
            inputProps={{ id: 'deadline', placeholder: 'Abstract submission deadline' }}
            value={deadline}
            onChange={(value) => setDeadline(value)}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="logo-file" className="col-sm-2 col-form-label">
          Logo File
        </label>
        <div className="col-sm-10">
          {logoUuid != null ? (
            <div>
              <div className="banner-box">
                <img className="conference-logo img-fluid rounded" src={getBannerUrl(logoUuid)} alt="Conference Logo" />
              </div>
              <button className="btn-banner-remove btn btn-secondary btn-sm" onClick={() => setLogoUuid(null)}>
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div>Images of format "jpg", "gif", "png" are supported; the size limit is 5MB.</div>
              <input
                id="logo-file"
                type="file"
                className="form-control"
                accept="image/jpeg, image/gif, image/png"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              <div>Note: The image will be uploaded when the conference is saved.</div>
            </div>
          )}
        </div>
      </div>

      <div className="row">
        <label htmlFor="logo" className="col-sm-2 col-form-label">
          Logo Link
        </label>
        <div className="col-sm-10">
          <input
            id="logo"
            type="url"
            className="form-control"
            placeholder="Banner Logo url"
            value={logoLink}
            onChange={(e) => setLogoLink(e.target.value)}
            maxLength={255}
          />
          <div>Note: If a logo image is uploaded, the logo link will not be used.</div>
        </div>
      </div>

      <div className="row">
        <label htmlFor="thumbnail-file" className="col-sm-2 col-form-label">
          Thumbnail File
        </label>
        <div className="col-sm-10">
          {thumbnailUuid != null ? (
            <div>
              <button className="btn-banner-remove btn btn-secondary btn-sm" onClick={() => setThumbnailUuid(null)}>
                Remove
              </button>
              <div className="banner-box">
                <img
                  className="conference-logo img-fluid rounded"
                  src={getBannerUrl(thumbnailUuid)}
                  alt="Conference Banner"
                />
              </div>
            </div>
          ) : (
            <div>
              <div>Images of format "jpg", "gif", "png" are supported; the size limit is 5MB.</div>
              <input
                id="thumbnail-file"
                type="file"
                className="form-control"
                accept="image/jpeg, image/gif, image/png"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
              <div>Note: The image will be uploaded when the conference is saved.</div>
            </div>
          )}
        </div>
      </div>

      <div className="row">
        <label htmlFor="thumbnail" className="col-sm-2 col-form-label">
          Thumbnail Link
        </label>
        <div className="col-sm-10">
          <input
            id="thumbnail"
            type="url"
            className="form-control"
            placeholder="Thumbnail image url"
            value={thumbnailLink}
            onChange={(e) => setThumbnailLink(e.target.value)}
            maxLength={255}
          />
          <div>Note: If a thumbnail image is uploaded, the thumbnail link will not be used.</div>
        </div>
      </div>

      <div className="row">
        <label htmlFor="iosApp" className="col-sm-2 col-form-label">
          iOS App
        </label>
        <div className="col-sm-10">
          <input
            id="iosApp"
            type="text"
            className="form-control"
            placeholder="iOS App id"
            value={iosApp}
            onChange={(e) => setIosApp(e.target.value)}
            maxLength={255}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="link" className="col-sm-2 col-form-label">
          Link
        </label>
        <div className="col-sm-10">
          <input
            id="link"
            type="url"
            className="form-control"
            placeholder="Link to the conference homepage"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            maxLength={255}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="desc" className="col-sm-2 col-form-label">
          Description
        </label>
        <div className="col-sm-10">
          <textarea
            id="desc"
            className="form-control"
            rows={4}
            placeholder="Conference description (max. 500 characters). Use Markdown."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          ></textarea>
        </div>
      </div>

      <div className="row">
        <label htmlFor="notice" className="col-sm-2 col-form-label">
          Notice
        </label>
        <div className="col-sm-10">
          <textarea
            id="notice"
            className="form-control"
            rows={4}
            placeholder="Conference notice (max. 500 characters). Use Markdown."
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            maxLength={500}
          ></textarea>
        </div>
      </div>

      <div className="row">
        <label htmlFor="presentation" className="col-sm-2 col-form-label">
          Presentation Preferences
        </label>
        <div className="col-sm-10 form-check align-self-center">
          <input
            type="checkbox"
            className="form-check-input"
            id="presentation"
            name="presentation"
            checked={hasPresentationPrefs}
            onChange={() => setHasPresentationPrefs(!hasPresentationPrefs)}
          />
        </div>
      </div>

      <div className="row">
        <label className="col-sm-2 col-form-label">Topics</label>
        <div className="col-sm-10">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (over == null || active.id === over.id) {
                return;
              }
              const oldIndex = topics.findIndex((item) => item.uuid === active.id);
              const newIndex = topics.findIndex((item) => item.uuid === over.id);
              const newItems = arrayMove(topics, oldIndex, newIndex);
              setTopics(newItems);
            }}
          >
            <SortableContext items={topics}>
              {topics.map((item) => (
                <TopicSortableItem
                  key={item.id}
                  item={item}
                  onClickDelete={(item) => {
                    setTopics((prev) => {
                      const items: TopicItem[] = [];
                      prev.forEach((pItem) => {
                        if (item.position !== pItem.position) {
                          items.push({ ...pItem, position: items.length });
                        }
                      });
                      return items;
                    });
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="row">
            <div className="col-sm-6 align-self-center">
              <input
                type="text"
                className="form-control"
                placeholder="topic"
                value={addTopic}
                onChange={(e) => setAddTopic(e.target.value)}
                maxLength={255}
              />
            </div>
            <div className="col-sm-6 align-self-center">
              <a
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const topic = addTopic.trim();
                  if (topic.length > 0) {
                    const id = crypto.randomUUID();
                    setTopics((prev) => {
                      const item: TopicItem = { id, uuid: '', position: prev.length, topic: addTopic };
                      return [...prev, item];
                    });
                    setAddTopic('');
                  }
                }}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Topic
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <label htmlFor="mAbsLen" className="col-sm-3 col-form-label">
          Max. Abs. Len.
        </label>
        <div className="col-sm-3">
          <input
            id="mAbsLen"
            type="text"
            className="form-control"
            placeholder="Maximum Abstract Length (chars)"
            value={abstractMaxLength}
            onChange={(e) => setAbstractMaxLength(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="row">
        <label htmlFor="mFigs" className="col-sm-3 col-form-label">
          Max. Figs.
        </label>
        <div className="col-sm-3">
          <input
            id="mFigs"
            type="text"
            className="form-control"
            placeholder="Maximum Number Of Figures"
            value={abstractMaxFigures}
            onChange={(e) => setAbstractMaxFigures(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="text-center">
          <form onSubmit={onSubmitSave}>
            <button type="submit" className="btn btn-success">
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardConferenceTabGeneral;
