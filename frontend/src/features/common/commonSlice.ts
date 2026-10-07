import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ApiConfigRetrieve } from '../../api/configApi';
import { getApiErrorMessage } from '../../api/utilities';
import type { RootState } from '../../app/store';
import type { AlertPanelVariant } from '../../common/AlertPanel';
import type { ConfigEntity } from '../../entities/config';

interface CommonMessageState {
  variant: AlertPanelVariant | null;
  message: string;
}

interface CommonState {
  messageState: CommonMessageState;
  configInfo: ConfigEntity;
}

const initialState: Readonly<CommonState> = {
  messageState: { variant: null, message: '' },
  configInfo: { readOnly: false },
};

export const getConfig = createAsyncThunk<ConfigEntity, void, { rejectValue: string }>(
  'common/config',
  async (_, thunkApi) => {
    try {
      const config = await ApiConfigRetrieve(thunkApi.signal);
      return config;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    showMessage: (state, action: PayloadAction<CommonMessageState>) => {
      const { variant, message } = action.payload;
      state.messageState.variant = variant;
      state.messageState.message = message;
    },
    hideMessage: (state) => {
      state.messageState.variant = null;
      state.messageState.message = '';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getConfig.fulfilled, (state, action) => {
      state.configInfo = action.payload;
    });
  },
});

export const { showMessage, hideMessage } = commonSlice.actions;

export const selectMessageState = (state: RootState) => state.common.messageState;
export const selectConfigInfo = (state: RootState) => state.common.configInfo;

export default commonSlice.reducer;
