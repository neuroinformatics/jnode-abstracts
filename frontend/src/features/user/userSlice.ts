import { createSlice } from '@reduxjs/toolkit';
import { AsyncApiStatus, AsyncApiStatuses } from '../../common/entities/api';

interface UserState {
  apiStatus: {
    login: AsyncApiStatuses;
  };
}

const initialState: Readonly<UserState> = {
  apiStatus: {
    login: AsyncApiStatus.initial,
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.apiStatus.login = AsyncApiStatus.initial;
    },
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
