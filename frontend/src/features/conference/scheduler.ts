import dayjs from 'dayjs';
import type { NormalizedState } from '../../common/normalizedState';

export interface ScheduleJSON_EventEntity {
  title: string;
  subtitle?: string | null;
  start: string; // HH:MM
  end?: string | null; // HH:MM (default: 23:59)
  date: string; // YYYY-MM-DD
  location?: string | null;
  type?: string;
  authors?: string[] | null;
  abstract?: string | null;
}

export interface ScheduleJSON_TrackEntity {
  title: string;
  subtitle?: string | null;
  chair: string[];
  events: ScheduleJSON_EventEntity[];
}

export interface ScheduleJSON_SessionEntity {
  title: string;
  subtitle?: string | null;
  tracks: ScheduleJSON_TrackEntity[];
}

export type ScheduleJSON_Entity = ScheduleJSON_EventEntity | ScheduleJSON_TrackEntity | ScheduleJSON_SessionEntity;
export type ScheduleJSON_Entities = ScheduleJSON_Entity[];

export interface ScheduleJSON_EntityResource {
  id: string;
  parentId: string;
  childrenIds: string[];
  startDate: Date;
  endDate: Date;
  eventDates: string[];
  entity: ScheduleJSON_Entity;
}

export interface DhtmlxSchedulerEvent {
  id: string;
  childrenIds: string[];
  start_date: Date;
  end_date: Date;
  text: string;
}
export type DhtmlxSchedulerEvents = DhtmlxSchedulerEvent[];

export class SchedulerModel {
  private readonly resources: NormalizedState<ScheduleJSON_EntityResource, string>;
  private readonly events: NormalizedState<DhtmlxSchedulerEvent, string>;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly eventDates: Date[];
  readonly toggleState: Record<string, boolean> = {};
  readonly visibleIds: string[] = [];
  readonly dailyEvents: NormalizedState<{ ids: string[]; firstHour: number; lastHour: number }, string>;

  constructor(entities: ScheduleJSON_Entities) {
    this.resources = { allIds: [], byId: {} };
    this.events = { allIds: [], byId: {} };
    this.dailyEvents = { allIds: [], byId: {} };
    let idx = 0;
    const findStartDate = (resourceIds: string[]): Date =>
      resourceIds
        .map((resourceId) => this.resources.byId[resourceId].startDate)
        .reduce((d1, d2) => (d1.getTime() < d2.getTime() ? d1 : d2), new Date(8.64e15));
    const findEndDate = (resourceIds: string[]): Date =>
      resourceIds
        .map((resourceId) => this.resources.byId[resourceId].endDate)
        .reduce((d1, d2) => (d1.getTime() > d2.getTime() ? d1 : d2), new Date(0));
    const flattenEventDates = (resourceIds: string[]): string[] => [
      ...new Set(resourceIds.map((resourceId) => this.resources.byId[resourceId].eventDates).flat()),
    ];
    const registerEvent = (entity: ScheduleJSON_EventEntity, parentId: string): ScheduleJSON_EntityResource => {
      const id = `${parentId !== '' ? `${parentId}:` : ''}e${idx++}`;
      const startDate = SchedulerModel.parseStartDate(entity);
      const endDate = SchedulerModel.parseEndDate(entity);
      const dateKey = ScheduleUtility.makeDateKey(startDate);
      const resource: ScheduleJSON_EntityResource = {
        id,
        parentId,
        childrenIds: [],
        startDate,
        endDate,
        eventDates: [dateKey],
        entity,
      };
      this.resources.allIds.push(id);
      this.resources.byId[id] = resource;
      // get daily event information.
      const key = ScheduleUtility.makeDateKey(resource.startDate);
      if (this.dailyEvents.byId[key] == null) {
        this.dailyEvents.allIds.push(key);
        this.dailyEvents.byId[key] = {
          ids: [id],
          firstHour: resource.startDate.getHours(),
          lastHour: resource.endDate.getHours() + 1,
        };
      } else {
        this.dailyEvents.byId[key].ids.push(id);
        this.dailyEvents.byId[key].firstHour = Math.min(
          this.dailyEvents.byId[key].firstHour,
          resource.startDate.getHours(),
        );
        this.dailyEvents.byId[key].lastHour = Math.max(
          this.dailyEvents.byId[key].lastHour,
          resource.endDate.getHours() + 1,
        );
      }
      return resource;
    };
    const registerTrack = (entity: ScheduleJSON_TrackEntity, parentId: string): ScheduleJSON_EntityResource => {
      const id = `${parentId !== '' ? `${parentId}:` : ''}t${idx++}`;
      const childrenIds = entity.events.map((child) => registerEvent(child, id).id);
      const resource: ScheduleJSON_EntityResource = {
        id,
        parentId,
        childrenIds,
        startDate: findStartDate(childrenIds),
        endDate: findEndDate(childrenIds),
        eventDates: flattenEventDates(childrenIds),
        entity,
      };
      this.resources.allIds.push(id);
      this.resources.byId[id] = resource;
      return resource;
    };
    const registerSession = (entity: ScheduleJSON_SessionEntity): ScheduleJSON_EntityResource => {
      const id = `s${idx++}`;
      const childrenIds = entity.tracks.map((child) => registerTrack(child, id).id);
      const resource: ScheduleJSON_EntityResource = {
        id,
        parentId: '',
        childrenIds,
        startDate: findStartDate(childrenIds),
        endDate: findEndDate(childrenIds),
        eventDates: flattenEventDates(childrenIds),
        entity,
      };
      this.resources.allIds.push(id);
      this.resources.byId[id] = resource;
      return resource;
    };
    const children = entities.map((entity) => {
      if (this.isSession(entity)) {
        return registerSession(entity).id;
      } else if (this.isTrack(entity)) {
        return registerTrack(entity, '').id;
      } else {
        return registerEvent(entity, '').id;
      }
    });
    this.startDate = findStartDate(children);
    this.endDate = findEndDate(children);
    this.eventDates = SchedulerModel.getEventDays(this.startDate, this.endDate);
    // create all scheduler events
    const makeScheduleBySession = (dateKey: string, id: string) => {
      const key = `${dateKey}#${id}`;
      if (this.events.byId[key] == null) {
        const resource = this.resources.byId[id];
        const filteredEventIds = resource.childrenIds
          .flatMap((eventId) => this.resources.byId[eventId].childrenIds)
          .filter((childId) => this.resources.byId[childId].eventDates.includes(dateKey));
        const filteredTrackIds = resource.childrenIds.filter(
          (trackId) =>
            this.resources.byId[trackId].childrenIds.find((eventId) => filteredEventIds.includes(eventId)) != null,
        );
        if (filteredEventIds.length > 0) {
          const event_: DhtmlxSchedulerEvent = {
            id: key,
            childrenIds: filteredTrackIds.map((childId) => `${dateKey}#${childId}`),
            start_date: findStartDate(filteredEventIds),
            end_date: findEndDate(filteredEventIds),
            text: resource.entity.title,
          };
          this.events.allIds.push(key);
          this.events.byId[key] = event_;
          this.toggleState[key] = false;
          this.visibleIds.push(key);
        }
      }
    };
    const makeScheduleByTrack = (dateKey: string, id: string) => {
      const key = `${dateKey}#${id}`;
      if (this.events.byId[key] == null) {
        const resource = this.resources.byId[id];
        const filteredEventIds = resource.childrenIds.filter((childId) =>
          this.resources.byId[childId].eventDates.includes(dateKey),
        );
        if (filteredEventIds.length > 0) {
          const event_: DhtmlxSchedulerEvent = {
            id: key,
            childrenIds: filteredEventIds.map((childId) => `${dateKey}#${childId}`),
            start_date: findStartDate(filteredEventIds),
            end_date: findEndDate(filteredEventIds),
            text: resource.entity.title,
          };
          this.events.allIds.push(key);
          this.events.byId[key] = event_;
          this.toggleState[key] = false;
        }
        const sessionId = id.replace(/:?t\d+/, '');
        if (sessionId !== '') {
          makeScheduleBySession(dateKey, sessionId);
        } else if (filteredEventIds.length > 0) {
          this.visibleIds.push(key);
        }
      }
    };
    const makeScheduleByEvent = (dateKey: string, id: string) => {
      const key = `${dateKey}#${id}`;
      const resource = this.resources.byId[id];
      const event_: DhtmlxSchedulerEvent = {
        id: key,
        childrenIds: [],
        start_date: resource.startDate,
        end_date: resource.endDate,
        text: resource.entity.title,
      };
      this.events.allIds.push(key);
      this.events.byId[key] = event_;
      const trackId = id.replace(/:?e\d+/, '');
      if (trackId !== '') {
        makeScheduleByTrack(dateKey, trackId);
      } else {
        this.visibleIds.push(key);
      }
    };
    this.dailyEvents.allIds.forEach((dateKey) => {
      this.dailyEvents.byId[dateKey].ids.forEach((eventId) => {
        makeScheduleByEvent(dateKey, eventId);
      });
    });
    this.eventDates.forEach((date) => {
      const key = ScheduleUtility.makeDateKey(date);
      if (!this.dailyEvents.allIds.includes(key)) {
        // add empty event
        const event_: DhtmlxSchedulerEvent = {
          id: key,
          childrenIds: [],
          start_date: dayjs(date).startOf('day').toDate(),
          end_date: dayjs(date).endOf('day').toDate(),
          text: 'No Events',
        };
        this.events.allIds.push(key);
        this.events.byId[key] = event_;
        this.visibleIds.push(key);
      }
    });
  }

  getInitialDate(): Date {
    const now = new Date();
    if (this.startDate == null || ScheduleUtility.isIntermediateDate(this.startDate, this.endDate, now)) {
      return now;
    }
    return this.startDate;
  }

  getHoursByDate(date: Date): { firstHour: number; lastHour: number } | null {
    const key = ScheduleUtility.makeDateKey(date);
    const ev = this.dailyEvents.byId[key];
    return ev != null ? { firstHour: ev.firstHour, lastHour: ev.lastHour } : null;
  }

  getEvents(): DhtmlxSchedulerEvents {
    return this.visibleIds.map((id) => this.events.byId[id]);
  }

  getResourceById(id: string): ScheduleJSON_EntityResource {
    return this.resources.byId[id];
  }

  getEventById(id: string): DhtmlxSchedulerEvent {
    return this.events.byId[id];
  }

  canCollapse(id: string): boolean {
    const ev = this.events.byId[id];
    const parentId = id.replace(/:(t|e)\d+$/, '');
    return parentId !== id && ev != null && this.events.byId[parentId] != null;
  }

  canExpand(id: string): boolean {
    const ev = this.events.byId[id];
    return ev != null && ev.childrenIds.length > 0;
  }

  collapseEvent(id: string): { append: string[]; remove: string[] } {
    if (!this.canCollapse(id)) {
      return { append: [], remove: [] };
    }
    const pId = id.replace(/:(t|e)\d+$/, '');
    const pEvent = this.events.byId[pId];
    const removedIds: string[] = [];
    const removeChildren = (cIds: string[]) => {
      cIds.forEach((cId) => {
        const pos = this.visibleIds.findIndex((vId) => vId === cId);
        if (pos >= 0) {
          this.visibleIds.splice(pos, 1);
          removedIds.push(cId);
        }
        const cEvent = this.events.byId[cId];
        if (cEvent.childrenIds.length > 0) {
          removeChildren(cEvent.childrenIds);
        }
      });
    };
    removeChildren(pEvent.childrenIds);
    this.visibleIds.push(pId);
    return { append: [pId], remove: removedIds };
  }

  expandEvent(id: string): { append: string[]; remove: string[] } {
    if (!this.canExpand(id)) {
      return { append: [], remove: [] };
    }
    const ev = this.events.byId[id];
    const pos = this.visibleIds.findIndex((visibleId) => visibleId === id);
    if (pos >= 0) {
      this.visibleIds.splice(pos, 1);
    }
    ev.childrenIds.forEach((cId) => {
      this.visibleIds.push(cId);
    });
    return { append: ev.childrenIds, remove: [id] };
  }

  isSession(entity: ScheduleJSON_Entity): entity is ScheduleJSON_SessionEntity {
    return 'tracks' in entity;
  }

  isTrack(entity: ScheduleJSON_Entity): entity is ScheduleJSON_TrackEntity {
    return 'events' in entity;
  }

  isEvent(entity: ScheduleJSON_Entity): entity is ScheduleJSON_EventEntity {
    return !this.isSession(entity) && !this.isTrack(entity);
  }

  private static parseStartDate(entity: ScheduleJSON_EventEntity): Date {
    // format year-month-day
    const ymd = entity.date.split('-');
    // format hour:minute
    const time = entity.start != null && entity.start.length > 0 ? entity.start.split(':') : ['0', '0'];
    return new Date(parseInt(ymd[0]), parseInt(ymd[1]) - 1, parseInt(ymd[2]), parseInt(time[0]), parseInt(time[1]));
  }

  private static parseEndDate(entity: ScheduleJSON_EventEntity): Date {
    // format year-month-day
    const ymd = entity.date.split('-');
    // format hour:minute
    const time = entity.end != null && entity.end.length > 0 ? entity.end.split(':') : ['23', '59'];
    return new Date(parseInt(ymd[0]), parseInt(ymd[1]) - 1, parseInt(ymd[2]), parseInt(time[0]), parseInt(time[1]));
  }

  private static getEventDays(startDate: Date, endDate: Date): Date[] {
    const ret: Date[] = [];
    for (
      let day = dayjs(ScheduleUtility.getDate(startDate));
      ScheduleUtility.isIntermediateDate(startDate, endDate, day.toDate());
      day = day.add(1, 'day')
    ) {
      ret.push(day.toDate());
    }
    return ret;
  }
}

export class ScheduleUtility {
  static getDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  static makeDateKey(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD');
  }

  static isSameDate(date1: Date | null, date2: Date | null): boolean {
    return date1 != null && date2 != null ? this.getDate(date1).getTime() === this.getDate(date2).getTime() : false;
  }

  static isIntermediateDate(startDate: Date | null, endDate: Date | null, date: Date | null): boolean {
    if (startDate != null && endDate != null && date != null) {
      const startTime = dayjs(startDate).startOf('day').toDate().getTime();
      const endTime = dayjs(endDate).endOf('day').toDate().getTime();
      const time = date.getTime();
      return startTime <= time && endTime >= time;
    }
    return false;
  }
}
