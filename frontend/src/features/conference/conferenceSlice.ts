import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ApiConferenceAbstractList,
  ApiConferenceList,
  ApiConferenceOwnersUpdate,
  ApiConferenceRetrieve,
} from '../../api/conferenceApi ';
import { getApiErrorMessage } from '../../api/utilities';
import { RootState } from '../../app/store';
import { NormalizedState } from '../../common/normalizedState';
import { AbstractSimpleEntity } from '../../entities/abstract';
import { ApiActionState, ApiAsyncStatus, ApiSuccessResponse } from '../../entities/api';
import { ConferenceEntity, ConferenceSimpleEntity } from '../../entities/conference';

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
  getListState: { error: null, status: ApiAsyncStatus.initializing },
  getDetailState: { error: null, status: ApiAsyncStatus.initializing },
  getAbstractsState: { error: null, status: ApiAsyncStatus.initializing },
  pageActionState: { error: null, status: ApiAsyncStatus.initializing },
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

export const updateConferenceOwners = createAsyncThunk<
  ApiSuccessResponse,
  { uuid: string; owners: string[] },
  { rejectValue: string }
>('conference/owners/update', async (params, thunkApi) => {
  const { uuid, owners } = params;
  try {
    const abstracts = await ApiConferenceOwnersUpdate(uuid, owners, thunkApi.signal);
    return abstracts;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

const StateFuncPageActionInitialize = (state: Readonly<ConferenceState>) => {
  state.pageActionState.status = ApiAsyncStatus.initializing;
  state.pageActionState.error = null;
};
const StateFuncPageActionPending = (state: Readonly<ConferenceState>) => {
  state.pageActionState.status = ApiAsyncStatus.loading;
  state.pageActionState.error = null;
};
const StateFuncPageActionFulfilled = (state: Readonly<ConferenceState>) => {
  state.pageActionState.status = ApiAsyncStatus.idle;
  state.pageActionState.error = null;
};
const StateFuncPageActionRejected = (state: Readonly<ConferenceState>, payload: string | undefined) => {
  const error = payload || '';
  state.pageActionState.status = ApiAsyncStatus.failed;
  state.pageActionState.error = error;
};

export const conferenceSlice = createSlice({
  name: 'conference',
  initialState,
  reducers: {
    unsetConferenceDetail: (state) => {
      state.conferenceInfo = null;
      state.getDetailState.status = ApiAsyncStatus.initializing;
      state.getDetailState.error = null;
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
        state.getListState.status = ApiAsyncStatus.idle;
        state.getListState.error = null;
        state.conferencesInfo = { allIds: [], byId: {} };
        conferences.forEach((conference) => {
          state.conferencesInfo.allIds.push(conference.uuid);
          state.conferencesInfo.byId[conference.uuid] = conference;
        });
      })
      .addCase(getConferenceList.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getListState.status = ApiAsyncStatus.failed;
        state.getListState.error = error;
      })
      .addCase(getConferenceDetail.pending, (state) => {
        state.getDetailState.status = ApiAsyncStatus.loading;
      })
      .addCase(getConferenceDetail.fulfilled, (state, action) => {
        const conference = action.payload;
        state.getDetailState.status = ApiAsyncStatus.idle;
        state.getDetailState.error = null;
        state.conferenceInfo = conference;
      })
      .addCase(getConferenceDetail.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getDetailState.status = ApiAsyncStatus.failed;
        state.getDetailState.error = error;
      })
      .addCase(getConferenceAbstracts.pending, (state) => {
        state.getAbstractsState.status = ApiAsyncStatus.loading;
      })
      .addCase(getConferenceAbstracts.fulfilled, (state, action) => {
        const abstracts = action.payload;
        state.getAbstractsState.status = ApiAsyncStatus.idle;
        state.getAbstractsState.error = null;
        state.abstractsInfo = { allIds: [], byId: {} };
        abstracts.forEach((abstract) => {
          state.abstractsInfo.allIds.push(abstract.uuid);
          state.abstractsInfo.byId[abstract.uuid] = abstract;
        });
      })
      .addCase(getConferenceAbstracts.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getAbstractsState.status = ApiAsyncStatus.failed;
        state.getAbstractsState.error = error;
      })
      .addCase(updateConferenceOwners.pending, (state) => {
        StateFuncPageActionPending(state);
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
