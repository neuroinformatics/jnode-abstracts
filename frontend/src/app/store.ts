import { type Action, configureStore, createListenerMiddleware, isAnyOf, type ThunkAction } from '@reduxjs/toolkit';
import abstractReducer from '../features/abstract/abstractSlice';
import accountReducer from '../features/account/accountSlice';
import commonReducer from '../features/common/commonSlice';
import conferenceReducer, { getConferenceList } from '../features/conference/conferenceSlice';
import userReducer, { login, logout, restore } from '../features/user/userSlice';

const listenerMiddleware = createListenerMiddleware();

// reload conference list when login state changes
listenerMiddleware.startListening({
  matcher: isAnyOf(restore.fulfilled, login.fulfilled, logout.fulfilled),
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(getConferenceList());
  },
});

export const store = configureStore({
  reducer: {
    abstract: abstractReducer,
    account: accountReducer,
    common: commonReducer,
    conference: conferenceReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
