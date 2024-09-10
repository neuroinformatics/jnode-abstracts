import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { AlertPanelVariant } from '../../common/AlertPanel';

interface CommonMessageState {
  variant: AlertPanelVariant | null;
  message: string;
}

interface CommonState {
  messageState: CommonMessageState;
}

const initialState: Readonly<CommonState> = {
  messageState: { variant: null, message: '' },
};

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
});

export const { showMessage, hideMessage } = commonSlice.actions;

export const selectMessageState = (state: RootState) => state.common.messageState;

export default commonSlice.reducer;
