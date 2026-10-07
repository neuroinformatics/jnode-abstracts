import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ApiConferenceAbstractGroupsUpdate,
  type ApiConferenceAbstractGroupsUpdateParams,
  ApiConferenceAbstractList,
  ApiConferenceCreate,
  ApiConferenceDelete,
  ApiConferenceGeoUpdate,
  ApiConferenceInfoUpdate,
  ApiConferenceList,
  ApiConferenceOwnersUpdate,
  ApiConferenceRetrieve,
  ApiConferenceScheduleUpdate,
  ApiConferenceUpdate,
} from '../../api/conferenceApi ';
import { getApiErrorMessage } from '../../api/utilities';
import type { RootState } from '../../app/store';
import type { NormalizedState } from '../../common/normalizedState';
import type { AbstractSimpleEntity } from '../../entities/abstract';
import { type ApiActionState, ApiAsyncStatus, type ApiSuccessResponse } from '../../entities/api';
import type { ConferenceEntity, ConferenceSimpleEntity, TopicEntity } from '../../entities/conference';

export type ConferenceStateConferences = NormalizedState<ConferenceSimpleEntity, string>;
export type ConferenceStateAbstracts = NormalizedState<AbstractSimpleEntity, string>;

interface ConferenceState {
  conferenceInfo: ConferenceEntity | null;
  conferencesInfo: ConferenceStateConferences;
  abstractsInfo: ConferenceStateAbstracts;
  getListState: ApiActionState;
  getDetailState: ApiActionState;
  getAbstractsState: ApiActionState;
  pageActionState: ApiActionState;
}

const initialState: Readonly<ConferenceState> = {
  conferenceInfo: null,
  conferencesInfo: { byId: {}, allIds: [] },
  abstractsInfo: { byId: {}, allIds: [] },
  getListState: { type: null, error: null, status: ApiAsyncStatus.initializing },
  getDetailState: { type: null, error: null, status: ApiAsyncStatus.initializing },
  getAbstractsState: { type: null, error: null, status: ApiAsyncStatus.initializing },
  pageActionState: { type: null, error: null, status: ApiAsyncStatus.initializing },
};

export const getConferenceList = createAsyncThunk<ConferenceSimpleEntity[], void, { rejectValue: string }>(
  'conference/list',
  async (_, thunkApi) => {
    try {
      const conferences = await ApiConferenceList(null, thunkApi.signal);
      return conferences;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const getConferenceDetail = createAsyncThunk<ConferenceEntity, string, { rejectValue: string }>(
  'conference/retrieve',
  async (params, thunkApi) => {
    const uuid = params;
    try {
      const conference = await ApiConferenceRetrieve(uuid, thunkApi.signal);
      return conference;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const getConferenceAbstracts = createAsyncThunk<AbstractSimpleEntity[], string, { rejectValue: string }>(
  'conference/abstracts',
  async (params, thunkApi) => {
    const uuid = params;
    try {
      const abstracts = await ApiConferenceAbstractList(uuid, thunkApi.signal);
      return abstracts;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const createConference = createAsyncThunk<
  ConferenceSimpleEntity,
  { name: string; shortName: string; startDate: string; endDate: string; deadline: string },
  { rejectValue: string }
>('conference/create', async (params, thunkApi) => {
  const { name, shortName, startDate, endDate, deadline } = params;
  try {
    const result = await ApiConferenceCreate(name, shortName, startDate, endDate, deadline, thunkApi.signal);
    return result;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const deleteConference = createAsyncThunk<ApiSuccessResponse, string, { rejectValue: string }>(
  'conference/delete',
  async (params, thunkApi) => {
    const uuid = params;
    try {
      const result = await ApiConferenceDelete(uuid, thunkApi.signal);
      return result;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const updateConference = createAsyncThunk<
  ApiSuccessResponse,
  {
    uuid: string;
    isOpen: boolean;
    isPublished: boolean;
    isActive: boolean;
    name: string;
    shortName: string;
    conferenceGroup: string;
    cite: string;
    startDate: string;
    endDate: string;
    deadline: string;
    logoUuid: string | null;
    logoFile: File | null;
    logoLink: string;
    thumbnailUuid: string | null;
    thumbnailFile: File | null;
    thumbnailLink: string;
    iosApp: string;
    link: string;
    description: string;
    notice: string;
    hasPresentationPrefs: boolean;
    topics: TopicEntity[];
    abstractMaxLength: number;
    abstractMaxFigures: number;
  },
  { rejectValue: string }
>('conference/update', async (params, thunkApi) => {
  const {
    uuid,
    isOpen,
    isPublished,
    isActive,
    name,
    shortName,
    conferenceGroup,
    cite,
    startDate,
    endDate,
    deadline,
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
  } = params;
  try {
    const result = await ApiConferenceUpdate(
      uuid,
      isOpen,
      isPublished,
      isActive,
      name,
      shortName,
      conferenceGroup,
      cite,
      startDate,
      endDate,
      deadline,
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
      thunkApi.signal,
    );
    return result;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const updateConferenceAbstractGroups = createAsyncThunk<
  ApiSuccessResponse,
  ApiConferenceAbstractGroupsUpdateParams,
  { rejectValue: string }
>('conference/abstractGroups/update', async (params, thunkApi) => {
  try {
    const result = await ApiConferenceAbstractGroupsUpdate(params, thunkApi.signal);
    return result;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const updateConferenceGeo = createAsyncThunk<
  ApiSuccessResponse,
  { uuid: string; geo: string },
  { rejectValue: string }
>('conference/geo/update', async (params, thunkApi) => {
  const { uuid, geo } = params;
  try {
    const result = await ApiConferenceGeoUpdate(uuid, geo, thunkApi.signal);
    return result;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const updateConferenceSchedule = createAsyncThunk<
  ApiSuccessResponse,
  { uuid: string; schedule: string },
  { rejectValue: string }
>('conference/schedule/update', async (params, thunkApi) => {
  const { uuid, schedule } = params;
  try {
    const result = await ApiConferenceScheduleUpdate(uuid, schedule, thunkApi.signal);
    return result;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const updateConferenceInfo = createAsyncThunk<
  ApiSuccessResponse,
  { uuid: string; info: string },
  { rejectValue: string }
>('conference/info/update', async (params, thunkApi) => {
  const { uuid, info } = params;
  try {
    const result = await ApiConferenceInfoUpdate(uuid, info, thunkApi.signal);
    return result;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const updateConferenceOwners = createAsyncThunk<
  ApiSuccessResponse,
  { uuid: string; owners: string[] },
  { rejectValue: string }
>('conference/owners/update', async (params, thunkApi) => {
  const { uuid, owners } = params;
  try {
    const result = await ApiConferenceOwnersUpdate(uuid, owners, thunkApi.signal);
    return result;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

const StateFuncPageActionInitialize = (state: Readonly<ConferenceState>) => {
  state.pageActionState.type = null;
  state.pageActionState.error = null;
  state.pageActionState.status = ApiAsyncStatus.initializing;
};
const StateFuncPageActionPending = (state: Readonly<ConferenceState>, type: string) => {
  state.pageActionState.type = type;
  state.pageActionState.error = null;
  state.pageActionState.status = ApiAsyncStatus.loading;
};
const StateFuncPageActionFulfilled = (state: Readonly<ConferenceState>) => {
  state.pageActionState.error = null;
  state.pageActionState.status = ApiAsyncStatus.idle;
};
const StateFuncPageActionRejected = (state: Readonly<ConferenceState>, payload: string | undefined) => {
  const error = payload || '';
  state.pageActionState.error = error;
  state.pageActionState.status = ApiAsyncStatus.failed;
};

export const conferenceSlice = createSlice({
  name: 'conference',
  initialState,
  reducers: {
    unsetConferenceDetail: (state) => {
      state.conferenceInfo = null;
      state.getDetailState.error = null;
      state.getDetailState.status = ApiAsyncStatus.initializing;
    },
    unsetPageActionState: (state) => {
      StateFuncPageActionInitialize(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConferenceList.pending, (state) => {
        state.getListState.status = ApiAsyncStatus.loading;
      })
      .addCase(getConferenceList.fulfilled, (state, action) => {
        const conferences = action.payload;
        state.getListState.error = null;
        state.getListState.status = ApiAsyncStatus.idle;
        state.conferencesInfo = { allIds: [], byId: {} };
        conferences.forEach((conference) => {
          state.conferencesInfo.allIds.push(conference.uuid);
          state.conferencesInfo.byId[conference.uuid] = conference;
        });
      })
      .addCase(getConferenceList.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getListState.error = error;
        state.getListState.status = ApiAsyncStatus.failed;
      })
      .addCase(getConferenceDetail.pending, (state) => {
        state.getDetailState.status = ApiAsyncStatus.loading;
      })
      .addCase(getConferenceDetail.fulfilled, (state, action) => {
        const conference = action.payload;
        state.getDetailState.error = null;
        state.getDetailState.status = ApiAsyncStatus.idle;
        state.conferenceInfo = conference;
      })
      .addCase(getConferenceDetail.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getDetailState.error = error;
        state.getDetailState.status = ApiAsyncStatus.failed;
      })
      .addCase(getConferenceAbstracts.pending, (state) => {
        state.getAbstractsState.status = ApiAsyncStatus.loading;
      })
      .addCase(getConferenceAbstracts.fulfilled, (state, action) => {
        const abstracts = action.payload;
        state.getAbstractsState.error = null;
        state.getAbstractsState.status = ApiAsyncStatus.idle;
        state.abstractsInfo = { allIds: [], byId: {} };
        abstracts.forEach((abstract) => {
          state.abstractsInfo.allIds.push(abstract.uuid);
          state.abstractsInfo.byId[abstract.uuid] = abstract;
        });
      })
      .addCase(getConferenceAbstracts.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getAbstractsState.error = error;
        state.getAbstractsState.status = ApiAsyncStatus.failed;
      })
      .addCase(createConference.pending, (state) => {
        StateFuncPageActionPending(state, 'create');
      })
      .addCase(createConference.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(createConference.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(deleteConference.pending, (state) => {
        StateFuncPageActionPending(state, 'delete');
      })
      .addCase(deleteConference.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(deleteConference.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateConference.pending, (state) => {
        StateFuncPageActionPending(state, 'general');
      })
      .addCase(updateConference.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(updateConference.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateConferenceAbstractGroups.pending, (state) => {
        StateFuncPageActionPending(state, 'abstractGroups');
      })
      .addCase(updateConferenceAbstractGroups.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(updateConferenceAbstractGroups.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateConferenceGeo.pending, (state) => {
        StateFuncPageActionPending(state, 'geo');
      })
      .addCase(updateConferenceGeo.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(updateConferenceGeo.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateConferenceSchedule.pending, (state) => {
        StateFuncPageActionPending(state, 'schedule');
      })
      .addCase(updateConferenceSchedule.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(updateConferenceSchedule.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateConferenceInfo.pending, (state) => {
        StateFuncPageActionPending(state, 'info');
      })
      .addCase(updateConferenceInfo.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(updateConferenceInfo.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateConferenceOwners.pending, (state) => {
        StateFuncPageActionPending(state, 'owners');
      })
      .addCase(updateConferenceOwners.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(updateConferenceOwners.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      });
  },
});

export const { unsetConferenceDetail, unsetPageActionState } = conferenceSlice.actions;

export const selectConferenceInfo = (state: RootState) => state.conference.conferenceInfo;
export const selectConferencesInfo = (state: RootState) => state.conference.conferencesInfo;
export const selectAbstractsInfo = (state: RootState) => state.conference.abstractsInfo;
export const selectGetListState = (state: RootState) => state.conference.getListState;
export const selectGetDetailState = (state: RootState) => state.conference.getDetailState;
export const selectGetAbstractsState = (state: RootState) => state.conference.getAbstractsState;
export const selectPageActionState = (state: RootState) => state.conference.pageActionState;

export default conferenceSlice.reducer;
