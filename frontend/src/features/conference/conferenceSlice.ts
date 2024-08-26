import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiConferenceList, ApiConferenceRetrieve } from '../../api/conferenceApi ';
import { getApiErrorMessage } from '../../api/utilities';
import { RootState } from '../../app/store';
import { ActionState, AsyncApiStatus } from '../../entities/api';
import { ConferenceEntity, ConferenceSimpleEntity } from '../../entities/conference';

interface ConferenceState {
  conferenceInfo: ConferenceEntity | null;
  conferencesInfo: ConferenceSimpleEntity[] | null;
  getListState: ActionState;
  getDetailState: ActionState;
}

const initialState: Readonly<ConferenceState> = {
  conferenceInfo: null,
  conferencesInfo: null,
  getListState: { error: null, status: AsyncApiStatus.initial },
  getDetailState: { error: null, status: AsyncApiStatus.initial },
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

export const getConferenceDetail = createAsyncThunk<ConferenceEntity, { shortName: string }, { rejectValue: string }>(
  'conference/get',
  async (params, thunkApi) => {
    const { shortName } = params;
    try {
      const conferences = await ApiConferenceList(shortName, thunkApi.signal);
      if (conferences == null || conferences.length != 1) {
        throw new Error('No such conference found.');
      }
      const conference = await ApiConferenceRetrieve(conferences[0].uuid, thunkApi.signal);
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
      state.getDetailState.status = AsyncApiStatus.initial;
      state.getDetailState.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConferenceList.pending, (state) => {
        state.getListState.status = AsyncApiStatus.loading;
      })
      .addCase(getConferenceList.fulfilled, (state, action) => {
        const conferences = action.payload;
        state.getListState.status = AsyncApiStatus.idle;
        state.getListState.error = null;
        state.conferencesInfo = conferences;
      })
      .addCase(getConferenceList.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getListState.status = AsyncApiStatus.failed;
        state.getListState.error = error;
      })
      .addCase(getConferenceDetail.pending, (state) => {
        state.getDetailState.status = AsyncApiStatus.loading;
      })
      .addCase(getConferenceDetail.fulfilled, (state, action) => {
        const conference = action.payload;
        state.getDetailState.status = AsyncApiStatus.idle;
        state.getDetailState.error = null;
        state.conferenceInfo = conference;
      })
      .addCase(getConferenceDetail.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getDetailState.status = AsyncApiStatus.failed;
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
