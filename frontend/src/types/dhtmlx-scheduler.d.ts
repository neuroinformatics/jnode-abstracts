// Supplements the type definitions bundled with dhtmlx-scheduler.
export {};

declare module 'dhtmlx-scheduler' {
  interface SchedulerStatic {
    /**
     * Deletes an event.
     * The bundled definition lacks `silent`, which the implementation accepts.
     * @param id - the event id
     * @param silent - if true, deletes without calling onBeforeEventDelete and onConfirmedBeforeEventDelete
     */
    deleteEvent(id: string | number, silent?: boolean): void;
  }
}
