import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiAbstractPublicationUpdate, ApiAbstractRetrieve, ApiAbstractStateUpdate } from '../../api/abstractApi';
import { ApiConferenceAllAbstractList } from '../../api/conferenceApi ';
import { getApiErrorMessage } from '../../api/utilities';
import type { RootState } from '../../app/store';
import type { NormalizedState } from '../../common/normalizedState';
import type { AbstractEntity, StateLogState } from '../../entities/abstract';
import { type ApiActionState, ApiAsyncStatus } from '../../entities/api';

export type AbstractStateAbstracts = NormalizedState<AbstractEntity, string>;

interface AbstractState {
  abstractInfo: AbstractEntity | null;
  managedAbstractsInfo: AbstractStateAbstracts;
  getDetailState: ApiActionState;
  getManagedAbstractsState: ApiActionState;
  pageActionState: ApiActionState;
}

const initialState: Readonly<AbstractState> = {
  abstractInfo: null,
  managedAbstractsInfo: { byId: {}, allIds: [] },
  getDetailState: { type: null, error: null, status: ApiAsyncStatus.initializing },
  getManagedAbstractsState: { type: null, error: null, status: ApiAsyncStatus.initializing },
  pageActionState: { type: null, error: null, status: ApiAsyncStatus.initializing },
};

export const getAbstractDetail = createAsyncThunk<AbstractEntity, string, { rejectValue: string }>(
  'abstract/retrieve',
  async (params, thunkApi) => {
    const uuid = params;
    try {
      const abstract = await ApiAbstractRetrieve(uuid, thunkApi.signal);
      return abstract;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const getManagedAbstracts = createAsyncThunk<AbstractEntity[], string, { rejectValue: string }>(
  'abstract/managed/list',
  async (params, thunkApi) => {
    const conferenceUuid = params;
    try {
      const abstracts = await ApiConferenceAllAbstractList(conferenceUuid, thunkApi.signal);
      return abstracts;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const updateAbstractState = createAsyncThunk<
  AbstractEntity,
  { uuid: string; state: StateLogState; note: string },
  { rejectValue: string }
>('abstract/state/update', async (params, thunkApi) => {
  const { uuid, state, note } = params;
  try {
    const abstract = await ApiAbstractStateUpdate(uuid, state, note, thunkApi.signal);
    return abstract;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const updateAbstractPublication = createAsyncThunk<
  AbstractEntity,
  { uuid: string; abstractGroupUuid: string | null; num: number; doi: string },
  { rejectValue: string }
>('abstract/publication/update', async (params, thunkApi) => {
  const { uuid, abstractGroupUuid, num, doi } = params;
  try {
    const abstract = await ApiAbstractPublicationUpdate(uuid, abstractGroupUuid, num, doi, thunkApi.signal);
    return abstract;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

const StateFuncPageActionInitialize = (state: Readonly<AbstractState>) => {
  state.pageActionState.type = null;
  state.pageActionState.error = null;
  state.pageActionState.status = ApiAsyncStatus.initializing;
};
const StateFuncPageActionPending = (state: Readonly<AbstractState>, type: string) => {
  state.pageActionState.type = type;
  state.pageActionState.error = null;
  state.pageActionState.status = ApiAsyncStatus.loading;
};
const StateFuncPageActionFulfilled = (state: Readonly<AbstractState>) => {
  state.pageActionState.error = null;
  state.pageActionState.status = ApiAsyncStatus.idle;
};
const StateFuncPageActionRejected = (state: Readonly<AbstractState>, payload: string | undefined) => {
  const error = payload || '';
  state.pageActionState.error = error;
  state.pageActionState.status = ApiAsyncStatus.failed;
};
// replaces the updated abstract wherever it is shown
const StateFuncAbstractUpdated = (state: AbstractState, abstract: AbstractEntity) => {
  if (state.abstractInfo?.uuid === abstract.uuid) {
    state.abstractInfo = abstract;
  }
  if (abstract.uuid in state.managedAbstractsInfo.byId) {
    state.managedAbstractsInfo.byId[abstract.uuid] = abstract;
  }
};

export const abstractSlice = createSlice({
  name: 'abstract',
  initialState,
  reducers: {
    unsetAbstractDetail: (state) => {
      state.abstractInfo = null;
      state.getDetailState.error = null;
      state.getDetailState.status = ApiAsyncStatus.initializing;
    },
    unsetManagedAbstracts: (state) => {
      state.managedAbstractsInfo = { byId: {}, allIds: [] };
      state.getManagedAbstractsState.error = null;
      state.getManagedAbstractsState.status = ApiAsyncStatus.initializing;
    },
    unsetPageActionState: (state) => {
      StateFuncPageActionInitialize(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAbstractDetail.pending, (state) => {
        state.getDetailState.status = ApiAsyncStatus.loading;
      })
      .addCase(getAbstractDetail.fulfilled, (state, action) => {
        state.getDetailState.error = null;
        state.getDetailState.status = ApiAsyncStatus.idle;
        state.abstractInfo = action.payload;
      })
      .addCase(getAbstractDetail.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getDetailState.error = error;
        state.getDetailState.status = ApiAsyncStatus.failed;
      })
      .addCase(getManagedAbstracts.pending, (state) => {
        state.getManagedAbstractsState.status = ApiAsyncStatus.loading;
      })
      .addCase(getManagedAbstracts.fulfilled, (state, action) => {
        const abstracts = action.payload;
        state.getManagedAbstractsState.error = null;
        state.getManagedAbstractsState.status = ApiAsyncStatus.idle;
        state.managedAbstractsInfo = { allIds: [], byId: {} };
        abstracts.forEach((abstract) => {
          state.managedAbstractsInfo.allIds.push(abstract.uuid);
          state.managedAbstractsInfo.byId[abstract.uuid] = abstract;
        });
      })
      .addCase(getManagedAbstracts.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getManagedAbstractsState.error = error;
        state.getManagedAbstractsState.status = ApiAsyncStatus.failed;
      })
      .addCase(updateAbstractState.pending, (state) => {
        StateFuncPageActionPending(state, 'state');
      })
      .addCase(updateAbstractState.fulfilled, (state, action) => {
        StateFuncPageActionFulfilled(state);
        StateFuncAbstractUpdated(state, action.payload);
      })
      .addCase(updateAbstractState.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateAbstractPublication.pending, (state) => {
        StateFuncPageActionPending(state, 'publication');
      })
      .addCase(updateAbstractPublication.fulfilled, (state, action) => {
        StateFuncPageActionFulfilled(state);
        StateFuncAbstractUpdated(state, action.payload);
      })
      .addCase(updateAbstractPublication.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      });
  },
});

export const { unsetAbstractDetail, unsetManagedAbstracts, unsetPageActionState } = abstractSlice.actions;

export const selectAbstractInfo = (state: RootState) => state.abstract.abstractInfo;
export const selectManagedAbstractsInfo = (state: RootState) => state.abstract.managedAbstractsInfo;
export const selectGetDetailState = (state: RootState) => state.abstract.getDetailState;
export const selectGetManagedAbstractsState = (state: RootState) => state.abstract.getManagedAbstractsState;
export const selectPageActionState = (state: RootState) => state.abstract.pageActionState;

export default abstractSlice.reducer;
