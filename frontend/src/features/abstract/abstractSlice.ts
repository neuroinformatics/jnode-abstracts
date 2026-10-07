import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  type AbstractEditParams,
  ApiAbstractCreate,
  ApiAbstractDelete,
  ApiAbstractFigureUpload,
  ApiAbstractOwnersUpdate,
  ApiAbstractOwnList,
  ApiAbstractPublicationUpdate,
  ApiAbstractRetrieve,
  ApiAbstractStateUpdate,
  ApiAbstractUpdate,
  ApiFavoriteAdd,
  ApiFavoriteList,
  ApiFavoriteRemove,
  ApiFigureDelete,
  ApiFigureUpdate,
} from '../../api/abstractApi';
import { ApiConferenceAllAbstractList } from '../../api/conferenceApi ';
import { getApiErrorMessage } from '../../api/utilities';
import type { RootState } from '../../app/store';
import type { NormalizedState } from '../../common/normalizedState';
import type { AbstractEntity, AbstractSimpleEntity, StateLogState } from '../../entities/abstract';
import { type ApiActionState, ApiAsyncStatus, type ApiSuccessResponse } from '../../entities/api';

export type AbstractStateAbstracts = NormalizedState<AbstractEntity, string>;
export type AbstractStateFavorites = NormalizedState<AbstractSimpleEntity, string>;

interface AbstractState {
  abstractInfo: AbstractEntity | null;
  managedAbstractsInfo: AbstractStateAbstracts;
  ownAbstractsInfo: AbstractStateAbstracts;
  favoriteAbstractsInfo: AbstractStateFavorites;
  getDetailState: ApiActionState;
  getManagedAbstractsState: ApiActionState;
  getOwnAbstractsState: ApiActionState;
  getFavoritesState: ApiActionState;
  pageActionState: ApiActionState;
}

const initialState: Readonly<AbstractState> = {
  abstractInfo: null,
  managedAbstractsInfo: { byId: {}, allIds: [] },
  ownAbstractsInfo: { byId: {}, allIds: [] },
  favoriteAbstractsInfo: { byId: {}, allIds: [] },
  getDetailState: { type: null, error: null, status: ApiAsyncStatus.initializing },
  getManagedAbstractsState: { type: null, error: null, status: ApiAsyncStatus.initializing },
  getOwnAbstractsState: { type: null, error: null, status: ApiAsyncStatus.initializing },
  getFavoritesState: { type: null, error: null, status: ApiAsyncStatus.initializing },
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

export const getOwnAbstracts = createAsyncThunk<AbstractEntity[], void, { rejectValue: string }>(
  'abstract/own/list',
  async (_, thunkApi) => {
    try {
      const abstracts = await ApiAbstractOwnList(thunkApi.signal);
      return abstracts;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const createAbstract = createAsyncThunk<
  AbstractEntity,
  { conferenceUuid: string; content: AbstractEditParams },
  { rejectValue: string }
>('abstract/create', async (params, thunkApi) => {
  const { conferenceUuid, content } = params;
  try {
    const abstract = await ApiAbstractCreate(conferenceUuid, content, thunkApi.signal);
    return abstract;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const updateAbstract = createAsyncThunk<
  AbstractEntity,
  { uuid: string; content: AbstractEditParams },
  { rejectValue: string }
>('abstract/update', async (params, thunkApi) => {
  const { uuid, content } = params;
  try {
    const abstract = await ApiAbstractUpdate(uuid, content, thunkApi.signal);
    return abstract;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const deleteAbstract = createAsyncThunk<ApiSuccessResponse, string, { rejectValue: string }>(
  'abstract/delete',
  async (params, thunkApi) => {
    const uuid = params;
    try {
      const result = await ApiAbstractDelete(uuid, thunkApi.signal);
      return result;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const updateAbstractOwners = createAsyncThunk<
  AbstractEntity,
  { uuid: string; owners: string[] },
  { rejectValue: string }
>('abstract/owners/update', async (params, thunkApi) => {
  const { uuid, owners } = params;
  try {
    const abstract = await ApiAbstractOwnersUpdate(uuid, owners, thunkApi.signal);
    return abstract;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const uploadFigure = createAsyncThunk<
  AbstractEntity,
  { uuid: string; file: File; caption: string },
  { rejectValue: string }
>('abstract/figure/upload', async (params, thunkApi) => {
  const { uuid, file, caption } = params;
  try {
    const abstract = await ApiAbstractFigureUpload(uuid, file, caption, thunkApi.signal);
    return abstract;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const updateFigure = createAsyncThunk<
  AbstractEntity,
  { uuid: string; caption: string },
  { rejectValue: string }
>('abstract/figure/update', async (params, thunkApi) => {
  const { uuid, caption } = params;
  try {
    const abstract = await ApiFigureUpdate(uuid, caption, thunkApi.signal);
    return abstract;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const deleteFigure = createAsyncThunk<AbstractEntity, string, { rejectValue: string }>(
  'abstract/figure/delete',
  async (params, thunkApi) => {
    const uuid = params;
    try {
      const abstract = await ApiFigureDelete(uuid, thunkApi.signal);
      return abstract;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const getFavorites = createAsyncThunk<AbstractSimpleEntity[], void, { rejectValue: string }>(
  'abstract/favorite/list',
  async (_, thunkApi) => {
    try {
      const abstracts = await ApiFavoriteList(thunkApi.signal);
      return abstracts;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const addFavorite = createAsyncThunk<ApiSuccessResponse, AbstractSimpleEntity, { rejectValue: string }>(
  'abstract/favorite/add',
  async (params, thunkApi) => {
    const abstract = params;
    try {
      const result = await ApiFavoriteAdd(abstract.uuid, thunkApi.signal);
      return result;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const removeFavorite = createAsyncThunk<ApiSuccessResponse, string, { rejectValue: string }>(
  'abstract/favorite/remove',
  async (params, thunkApi) => {
    const uuid = params;
    try {
      const result = await ApiFavoriteRemove(uuid, thunkApi.signal);
      return result;
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
  if (abstract.uuid in state.ownAbstractsInfo.byId) {
    state.ownAbstractsInfo.byId[abstract.uuid] = abstract;
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
    unsetFavorites: (state) => {
      state.favoriteAbstractsInfo = { byId: {}, allIds: [] };
      state.getFavoritesState.error = null;
      state.getFavoritesState.status = ApiAsyncStatus.initializing;
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
      .addCase(getFavorites.pending, (state) => {
        state.getFavoritesState.status = ApiAsyncStatus.loading;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        const abstracts = action.payload;
        state.getFavoritesState.error = null;
        state.getFavoritesState.status = ApiAsyncStatus.idle;
        state.favoriteAbstractsInfo = { allIds: [], byId: {} };
        abstracts.forEach((abstract) => {
          state.favoriteAbstractsInfo.allIds.push(abstract.uuid);
          state.favoriteAbstractsInfo.byId[abstract.uuid] = abstract;
        });
      })
      .addCase(getFavorites.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getFavoritesState.error = error;
        state.getFavoritesState.status = ApiAsyncStatus.failed;
      })
      // favorites change without the page action state, so that toggling them does not block the page
      .addCase(addFavorite.fulfilled, (state, action) => {
        const abstract = action.meta.arg;
        if (!state.favoriteAbstractsInfo.allIds.includes(abstract.uuid)) {
          state.favoriteAbstractsInfo.allIds.push(abstract.uuid);
          state.favoriteAbstractsInfo.byId[abstract.uuid] = abstract;
        }
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        const uuid = action.meta.arg;
        state.favoriteAbstractsInfo.allIds = state.favoriteAbstractsInfo.allIds.filter((id) => id !== uuid);
        delete state.favoriteAbstractsInfo.byId[uuid];
      })
      .addCase(getOwnAbstracts.pending, (state) => {
        state.getOwnAbstractsState.status = ApiAsyncStatus.loading;
      })
      .addCase(getOwnAbstracts.fulfilled, (state, action) => {
        const abstracts = action.payload;
        state.getOwnAbstractsState.error = null;
        state.getOwnAbstractsState.status = ApiAsyncStatus.idle;
        state.ownAbstractsInfo = { allIds: [], byId: {} };
        abstracts.forEach((abstract) => {
          state.ownAbstractsInfo.allIds.push(abstract.uuid);
          state.ownAbstractsInfo.byId[abstract.uuid] = abstract;
        });
      })
      .addCase(getOwnAbstracts.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getOwnAbstractsState.error = error;
        state.getOwnAbstractsState.status = ApiAsyncStatus.failed;
      })
      .addCase(createAbstract.pending, (state) => {
        StateFuncPageActionPending(state, 'create');
      })
      .addCase(createAbstract.fulfilled, (state, action) => {
        StateFuncPageActionFulfilled(state);
        StateFuncAbstractUpdated(state, action.payload);
      })
      .addCase(createAbstract.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateAbstract.pending, (state) => {
        StateFuncPageActionPending(state, 'update');
      })
      .addCase(updateAbstract.fulfilled, (state, action) => {
        StateFuncPageActionFulfilled(state);
        StateFuncAbstractUpdated(state, action.payload);
      })
      .addCase(updateAbstract.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(deleteAbstract.pending, (state) => {
        StateFuncPageActionPending(state, 'delete');
      })
      .addCase(deleteAbstract.fulfilled, (state, action) => {
        StateFuncPageActionFulfilled(state);
        const uuid = action.meta.arg;
        state.ownAbstractsInfo.allIds = state.ownAbstractsInfo.allIds.filter((id) => id !== uuid);
        delete state.ownAbstractsInfo.byId[uuid];
      })
      .addCase(deleteAbstract.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateAbstractOwners.pending, (state) => {
        StateFuncPageActionPending(state, 'owners');
      })
      .addCase(updateAbstractOwners.fulfilled, (state, action) => {
        StateFuncPageActionFulfilled(state);
        StateFuncAbstractUpdated(state, action.payload);
      })
      .addCase(updateAbstractOwners.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(uploadFigure.pending, (state) => {
        StateFuncPageActionPending(state, 'figure');
      })
      .addCase(uploadFigure.fulfilled, (state, action) => {
        StateFuncPageActionFulfilled(state);
        StateFuncAbstractUpdated(state, action.payload);
      })
      .addCase(uploadFigure.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateFigure.pending, (state) => {
        StateFuncPageActionPending(state, 'figure');
      })
      .addCase(updateFigure.fulfilled, (state, action) => {
        StateFuncPageActionFulfilled(state);
        StateFuncAbstractUpdated(state, action.payload);
      })
      .addCase(updateFigure.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(deleteFigure.pending, (state) => {
        StateFuncPageActionPending(state, 'figure');
      })
      .addCase(deleteFigure.fulfilled, (state, action) => {
        StateFuncPageActionFulfilled(state);
        StateFuncAbstractUpdated(state, action.payload);
      })
      .addCase(deleteFigure.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
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

export const { unsetAbstractDetail, unsetManagedAbstracts, unsetPageActionState, unsetFavorites } =
  abstractSlice.actions;

export const selectAbstractInfo = (state: RootState) => state.abstract.abstractInfo;
export const selectManagedAbstractsInfo = (state: RootState) => state.abstract.managedAbstractsInfo;
export const selectGetDetailState = (state: RootState) => state.abstract.getDetailState;
export const selectGetManagedAbstractsState = (state: RootState) => state.abstract.getManagedAbstractsState;
export const selectOwnAbstractsInfo = (state: RootState) => state.abstract.ownAbstractsInfo;
export const selectFavoriteAbstractsInfo = (state: RootState) => state.abstract.favoriteAbstractsInfo;
export const selectGetFavoritesState = (state: RootState) => state.abstract.getFavoritesState;
export const selectGetOwnAbstractsState = (state: RootState) => state.abstract.getOwnAbstractsState;
export const selectPageActionState = (state: RootState) => state.abstract.pageActionState;

export default abstractSlice.reducer;
