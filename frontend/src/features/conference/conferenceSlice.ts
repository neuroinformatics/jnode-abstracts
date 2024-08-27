import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiConferenceList, ApiConferenceRetrieve } from '../../api/conferenceApi ';
import { getApiErrorMessage } from '../../api/utilities';
import { RootState } from '../../app/store';
import { NormalizedState } from '../../common/normalizedState';
import { ApiActionState, ApiAsyncStatus } from '../../entities/api';
import { ConferenceEntity, ConferenceSimpleEntity } from '../../entities/conference';

type ConferenceStateConferences = NormalizedState<ConferenceSimpleEntity, string>;

interface ConferenceState {
  conferenceInfo: ConferenceEntity | null;
  conferencesInfo: ConferenceStateConferences;
  getListState: ApiActionState;
  getDetailState: ApiActionState;
}

const initialState: Readonly<ConferenceState> = {
  conferenceInfo: null,
  conferencesInfo: { byId: {}, allIds: [] },
  getListState: { error: null, status: ApiAsyncStatus.idle },
  getDetailState: { error: null, status: ApiAsyncStatus.idle },
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
  'conference/get',
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

export const conferenceSlice = createSlice({
  name: 'conference',
  initialState,
  reducers: {
    unsetConferenceDetail: (state) => {
      state.conferenceInfo = null;
      state.getDetailState.status = ApiAsyncStatus.idle;
      state.getDetailState.error = null;
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
      });
  },
});

export const { unsetConferenceDetail } = conferenceSlice.actions;

export const selectConferenceInfo = (state: RootState) => state.conference.conferenceInfo;
export const selectConferencesInfo = (state: RootState) => state.conference.conferencesInfo;
export const selectGetListState = (state: RootState) => state.conference.getListState;
export const selectGetDetailState = (state: RootState) => state.conference.getDetailState;

export default conferenceSlice.reducer;
