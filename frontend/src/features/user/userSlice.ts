import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiUsersCurrent, ApiUsersLogin, ApiUsersLogout } from '../../api/userApi';
import { getApiErrorMessage, getApiErrorStatusCode } from '../../api/utilities';
import { RootState } from '../../app/store';
import { ActionState, ApiAuthResponse, AsyncApiStatus } from '../../entities/api';
import { UserEntity } from '../../entities/user';

interface UserState {
  userInfo: UserEntity | null;
  restoreState: ActionState;
  loginState: ActionState;
  logoutState: ActionState;
}

const initialState: Readonly<UserState> = {
  userInfo: null,
  restoreState: { error: null, status: AsyncApiStatus.initial },
  loginState: { error: null, status: AsyncApiStatus.initial },
  logoutState: { error: null, status: AsyncApiStatus.initial },
};

export const restore = createAsyncThunk<UserEntity, void, { rejectValue: string }>(
  'user/current',
  async (_, thunkApi) => {
    try {
      const user = await ApiUsersCurrent(thunkApi.signal);
      return user;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const login = createAsyncThunk<UserEntity, { username: string; password: string }, { rejectValue: string }>(
  'user/login',
  async (params, thunkApi) => {
    const { username, password } = params;
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await ApiUsersLogin(username, password, thunkApi.signal);
      const user = await ApiUsersCurrent(thunkApi.signal);
      return user;
    } catch (e: unknown) {
      if (getApiErrorStatusCode(e) === 401) {
        return thunkApi.rejectWithValue('Invalid credential');
      }
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk<ApiAuthResponse, void, { rejectValue: string }>(
  'user/logout',
  async (_, thunkApi) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return await ApiUsersLogout(thunkApi.signal);
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(restore.pending, (state) => {
        state.restoreState.status = AsyncApiStatus.loading;
      })
      .addCase(restore.fulfilled, (state, action) => {
        const user = action.payload;
        state.restoreState.status = AsyncApiStatus.idle;
        state.restoreState.error = null;
        state.userInfo = user;
      })
      .addCase(restore.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.restoreState.status = AsyncApiStatus.failed;
        state.restoreState.error = error;
      })
      .addCase(login.pending, (state) => {
        state.loginState.status = AsyncApiStatus.loading;
      })
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload;
        state.loginState.status = AsyncApiStatus.idle;
        state.loginState.error = null;
        state.userInfo = user;
      })
      .addCase(login.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.loginState.status = AsyncApiStatus.failed;
        state.loginState.error = error;
      })
      .addCase(logout.pending, (state) => {
        state.logoutState.status = AsyncApiStatus.loading;
        state.logoutState.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.logoutState.status = AsyncApiStatus.idle;
        state.logoutState.error = null;
        state.userInfo = null;
      })
      .addCase(logout.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.logoutState.status = AsyncApiStatus.failed;
        state.logoutState.error = error;
      });
  },
});

export const selectUserInfo = (state: RootState) => state.user.userInfo;
export const selectRestoreState = (state: RootState) => state.user.restoreState;
export const selectLoginState = (state: RootState) => state.user.loginState;
export const selectLogoutState = (state: RootState) => state.user.logoutState;

export default userSlice.reducer;
