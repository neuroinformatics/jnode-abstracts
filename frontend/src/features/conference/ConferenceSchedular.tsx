import React from 'react';

import {
  faBackwardStep,
  faChevronLeft,
  faChevronRight,
  faForwardStep,
  faMinus,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { scheduler } from 'dhtmlx-scheduler';
import { Button, Modal } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { DhtmlxSchedulerEvent, ScheduleJSON_Entities, SchedulerModel, ScheduleUtility } from './scheduler';

import 'dhtmlx-scheduler/codebase/dhtmlxscheduler.css';

interface Props {
  entities: ScheduleJSON_Entities;
}

type EventContainersState = {
  id: string;
  el: HTMLElement;
}[];

interface EventModalState {
  show: boolean;
  id: string;
  parentId: string | null;
}

type ScheduleEventType = 's' | 't' | 'e';

let isMounted = false;
let onViewChangeEventId = '';

const ConferenceScheduler: React.FC<Props> = (props) => {
  const { entities } = props;
  const [height, setHeight] = React.useState<string>('700px');
  const container = React.useRef<HTMLDivElement>(null);
  const [eventContainers, setEventContainers] = React.useState<EventContainersState>([]);
  const model = React.useMemo<SchedulerModel>(() => new SchedulerModel(entities), [entities]);
  const [currentDate, setCurrentDate] = React.useState<Date>(model.getInitialDate());
  const [eventModalState, setEventModalState] = React.useState<EventModalState>({
    show: false,
    id: '',
    parentId: null,
  });
  const isStartDate = ScheduleUtility.isSameDate(currentDate, model.startDate);
  const isEndDate = ScheduleUtility.isSameDate(currentDate, model.endDate);
  const events = model.getEvents();
  const typeLabels: Record<ScheduleEventType, string> = { s: 'Session', t: 'Track', e: 'Event' };

  React.useEffect(() => {
    if (!isMounted) {
      isMounted = true;
      if (container.current != null) {
        onViewChangeEventId = scheduler.attachEvent('onViewChange', (mode: string, date: Date) => {
          if (mode === 'day') {
            const hoursByDate = model.getHoursByDate(date);
            if (hoursByDate != null) {
              scheduler.config.first_hour = hoursByDate.firstHour;
              scheduler.config.last_hour = hoursByDate.lastHour;
            } else {
              scheduler.config.first_hour = 0;
              scheduler.config.last_hour = 24;
            }
            setHeight(
              `${1 + (scheduler.config.last_hour - scheduler.config.first_hour) * scheduler.config.hour_size_px}px`,
            );
          } else {
            scheduler.config.first_hour = 0;
            scheduler.config.last_hour = 24;
            setHeight('900px');
          }
          setCurrentDate(date);
          scheduler.updateView();
        });
        // disable editing events
        scheduler.config.readonly = true;
        // prevent short events from overlapping
        scheduler.config.separate_short_events = true;
        scheduler.config.multi_day = false;
        // set zero for padding to a view column
        scheduler.config.day_column_padding = 0;
        /*
         * Disable dragging events by touching.
         * This can also be set to "false" to completely disable dragging,
         * but some touch functionality will break that way.
         */
        scheduler.config.touch_drag = 99999999;
        /*
         * Size of the x-axis hour steps.
         * Must be a multiple of 44 for proper alignment (default skin).
         * This number may vary between different skins.
         */
        scheduler.config.hour_size_px = 264;

        // scheduler.skin = 'terrace';
        // display custom event box
        scheduler.renderEvent = (container: HTMLElement, ev: DhtmlxSchedulerEvent) => {
          const matches = ev.id.match(/(\d{4}-\d{2}-\d{2})(?:#(.+))?/);
          if (matches == null) {
            return false;
          }
          setEventContainers((prev) => {
            const arr = prev.filter((entry) => entry.id !== ev.id);
            return [...arr, { id: ev.id, el: container }];
          });
          return true;
        };

        scheduler.config.header = ['day', 'date', 'prev', 'today', 'next'];
        scheduler.init(container.current, currentDate, 'day');
        scheduler.clearAll();
        scheduler.parse(events);
      }
    }
    return () => {
      isMounted = false;
      if (onViewChangeEventId !== '') {
        scheduler.detachEvent(onViewChangeEventId);
        onViewChangeEventId = '';
      }
      scheduler.clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onShowEventModal = (id: string, parentId: string | null) => {
    setEventModalState({ show: true, id, parentId });
  };
  const onHideEventModal = () => {
    setEventModalState({ show: false, id: '', parentId: null });
  };

  const onClickCollapseEvent = React.useCallback<React.MouseEventHandler<HTMLSpanElement>>(
    (ev) => {
      const id = ev.currentTarget.getAttribute('data-id') ?? '';
      const { append, remove } = model.collapseEvent(id);
      append.forEach((id) => {
        const ev = model.getEventById(id);
        scheduler.addEvent(ev);
      });
      remove.forEach((id) => {
        // @ts-expect-error disable ts(2554) error
        scheduler.deleteEvent(id, true);
      });
      onHideEventModal();
    },
    [model],
  );

  const onClickExpandEvent = React.useCallback<React.MouseEventHandler<HTMLSpanElement>>(
    (ev) => {
      const id = ev.currentTarget.getAttribute('data-id') ?? '';
      const { append, remove } = model.expandEvent(id);
      append.forEach((id) => {
        const ev = model.getEventById(id);
        scheduler.addEvent(ev);
      });
      remove.forEach((id) => {
        // @ts-expect-error disable ts(2554) error
        scheduler.deleteEvent(id, true);
      });
      onHideEventModal();
    },
    [model],
  );

  const renderEvent = (id: string) => {
    const matches = id.match(/(\d{4}-\d{2}-\d{2})(?:#(.+))?/);
    if (matches == null) {
      return false;
    }
    const ev = model.getEventById(id);
    // const dateKey = matches[1];
    const resourceId = matches[2];
    // const resource = resourceId != null ? model.getResourceById(resourceId) : null;
    const subtype = resourceId != null ? resourceId.replace(/(:|\d)/g, '') : 'e';
    const type = subtype.substring(subtype.length - 1) as ScheduleEventType;
    return (
      <div key={id} className={`conference-scheduler-event event-${subtype}`}>
        <div className="conference-scheduler-header" onClick={() => onShowEventModal(id, null)}>
          <span className={`badge badge-${type}`}>{typeLabels[type]}</span>
          <h4>{scheduler.templates.event_text(ev.start_date, ev.end_date, ev)}</h4>
          <span className="time">{scheduler.templates.event_header(ev.start_date, ev.end_date, ev)}</span>
        </div>
        <div className="conference-scheduler-body">
          <div className="conference-scheduler-modification">
            {model.canCollapse(id) && (
              <span title="Collapse" data-id={id} onClick={onClickCollapseEvent}>
                <FontAwesomeIcon icon={faMinus} />
              </span>
            )}
            {model.canExpand(id) && (
              <span title="Expand" data-id={id} onClick={onClickExpandEvent}>
                <FontAwesomeIcon icon={faPlus} />
              </span>
            )}
          </div>
          {(type === 's' || type === 't') && (
            <div className="conference-scheduler-timeline">
              {ev.childrenIds.map((childId) => {
                const child = model.getEventById(childId);
                return (
                  <div
                    key={childId}
                    className="d-flex align-items-center justify-content-between"
                    onClick={() => onShowEventModal(childId, id)}
                  >
                    <div>
                      <strong>{child.text}</strong>
                    </div>
                    <div>
                      <div>{dayjs(child.start_date).format('HH:mm')}</div>
                      <div>{dayjs(child.end_date).format('HH:mm')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderModalTitle = (id: string) => {
    const matches = id.match(/\d{4}-\d{2}-\d{2}(?:#(.+))?/);
    if (matches == null) {
      return null;
    }
    const ev = model.getEventById(id);
    const resourceId = matches[1];
    const subtype = resourceId != null ? resourceId.replace(/(:|\d)/g, '') : 'e';
    const type = subtype.substring(subtype.length - 1) as ScheduleEventType;
    const resource = model.getResourceById(resourceId);
    const subtitle = resource?.entity?.subtitle;
    return (
      <div className="d-flex align-items-center">
        <div>
          <span className={`badge badge-${type}`}>{typeLabels[type]}</span>
        </div>
        <div>
          <h3>{ev.text}</h3>
          {subtitle && <h4>{subtitle}</h4>}
        </div>
      </div>
    );
  };

  const renderModalBody = (id: string) => {
    const matches = id.match(/\d{4}-\d{2}-\d{2}(?:#(.+))?/);
    if (matches == null) {
      return null;
    }
    const ev = model.getEventById(id);
    const resourceId = matches[1];
    const resource = model.getResourceById(resourceId);
    const entity = resource != null ? resource.entity : null;
    return (
      <div>
        {entity != null ? (
          <React.Fragment>
            <p>
              <strong>Date: </strong>
              <span>{dayjs(ev.start_date).format('D MMMM YYYY')}</span>
            </p>
            <p>
              <strong>Time: </strong>
              <span>
                {dayjs(ev.start_date).format('HH:mm')} - {dayjs(ev.end_date).format('HH:mm')}
              </span>
            </p>
            {model.isTrack(entity) && (
              <React.Fragment>
                {entity.chair != null && entity.chair.length > 0 && (
                  <p>
                    <strong>Chair: </strong>
                    <span>{entity.chair.join(', ')}</span>
                  </p>
                )}
              </React.Fragment>
            )}
            {model.isEvent(entity) && (
              <React.Fragment>
                {entity.location != null && entity.location !== '' && (
                  <p>
                    <strong>Location: </strong>
                    <span>{entity.location}</span>
                  </p>
                )}
                {entity.type != null && entity.type !== '' && (
                  <p>
                    <strong>Type: </strong>
                    <span>{entity.type}</span>
                  </p>
                )}
                {entity.authors != null && entity.authors.length > 0 && (
                  <p>
                    <strong>Authors: </strong>
                    <span>{entity.authors.join(', ')}</span>
                  </p>
                )}
                {entity.abstract != null && entity.abstract !== '' && (
                  <p>
                    <strong>Abstract: </strong>
                    <Link to={`./abstracts#/uuid/${entity.abstract}`}>Link</Link>
                  </p>
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        ) : (
          <div>No Event Scheduled</div>
        )}
      </div>
    );
  };

  const onClickGoToFirstDate = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    scheduler.setCurrentView(model.eventDates[0]);
  }, [model]);

  const onClickGoToNextDate = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    const date = dayjs(currentDate).add(1, 'day').toDate();
    scheduler.setCurrentView(date);
  }, [currentDate]);

  const onClickDate = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>((e) => {
    const date = e.currentTarget.getAttribute('data-date');
    scheduler.setCurrentView(dayjs(date).toDate());
  }, []);

  const onClickGoToPrevDate = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    const date = dayjs(currentDate).subtract(1, 'day').toDate();
    scheduler.setCurrentView(date);
  }, [currentDate]);

  const onClickGoToLastDate = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    scheduler.setCurrentView(model.eventDates[model.eventDates.length - 1]);
  }, [model]);

  return (
    <div className="scheduler">
      <div className="conference-scheduler-navbar btn-toolbar justify-content-between" role="toolbar">
        <div className="btn-group" role="group">
          <button className="btn btn-outline-secondary" disabled={isStartDate} onClick={onClickGoToFirstDate}>
            <FontAwesomeIcon icon={faBackwardStep} />
          </button>
          <button className="btn btn-outline-secondary" disabled={isStartDate} onClick={onClickGoToPrevDate}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>
        <div className="btn-group conference-scheduler-navbar-days" role="group">
          {model.eventDates.map((date) => {
            const key = ScheduleUtility.makeDateKey(date);
            const isActive = ScheduleUtility.isSameDate(date, currentDate);
            return (
              <button
                key={key}
                className={classNames('btn btn-outline-secondary', isActive && 'active')}
                data-date={key}
                onClick={onClickDate}
              >
                {dayjs(date).format('DD MMMM YYYY')}
              </button>
            );
          })}
        </div>
        <div className="btn-group" role="group">
          <button className="btn btn-outline-secondary" disabled={isEndDate} onClick={onClickGoToNextDate}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <button className="btn btn-outline-secondary" disabled={isEndDate} onClick={onClickGoToLastDate}>
            <FontAwesomeIcon icon={faForwardStep} />
          </button>
        </div>
      </div>
      <div ref={container} style={{ height: height }}></div>
      {eventContainers.map((entry) => {
        return createPortal(renderEvent(entry.id), entry.el);
      })}
      <Modal id="conference-scheduler-info" show={eventModalState.show} onHide={onHideEventModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{renderModalTitle(eventModalState.id)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderModalBody(eventModalState.id)}</Modal.Body>
        <Modal.Footer>
          {model.canExpand(eventModalState.parentId ?? eventModalState.id) && (
            <Button
              variant="danger"
              data-id={eventModalState.parentId ?? eventModalState.id}
              onClick={onClickExpandEvent}
            >
              Expand
            </Button>
          )}
          {model.canCollapse(eventModalState.parentId ?? eventModalState.id) && (
            <Button
              variant="success"
              data-id={eventModalState.parentId ?? eventModalState.id}
              onClick={onClickCollapseEvent}
            >
              Collapse
            </Button>
          )}
          <Button variant="secondary" onClick={onHideEventModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ConferenceScheduler;
