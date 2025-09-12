import { type Action, configureStore, type ThunkAction } from '@reduxjs/toolkit';
import commonReducer from '../features/common/commonSlice';
import conferenceReducer from '../features/conference/conferenceSlice';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    common: commonReducer,
    conference: conferenceReducer,
    user: userReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
