import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ApiUsersChangeEmail,
  ApiUsersChangePassword,
  ApiUsersCurrent,
  ApiUsersLogin,
  ApiUsersLogout,
} from '../../api/userApi';
import { getApiErrorMessage, getApiErrorStatusCode } from '../../api/utilities';
import { RootState } from '../../app/store';
import { ApiActionState, ApiAsyncStatus, ApiAuthResponse, isApiPreparing } from '../../entities/api';
import { UserEntity } from '../../entities/user';

interface UserState {
  userInfo: UserEntity | null;
  restoreState: ApiActionState;
  loginState: ApiActionState;
  logoutState: ApiActionState;
  changePasswordState: ApiActionState;
  changeEmailState: ApiActionState;
}

const initialState: Readonly<UserState> = {
  userInfo: null,
  restoreState: { error: null, status: ApiAsyncStatus.initializing },
  loginState: { error: null, status: ApiAsyncStatus.initializing },
  logoutState: { error: null, status: ApiAsyncStatus.initializing },
  changePasswordState: { error: null, status: ApiAsyncStatus.initializing },
  changeEmailState: { error: null, status: ApiAsyncStatus.initializing },
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

export const changePassword = createAsyncThunk<
  ApiAuthResponse,
  { uuid: string; oldPassword: string; newPassword: string },
  { rejectValue: string }
>('user/changePassword', async (params, thunkApi) => {
  const { uuid, oldPassword, newPassword } = params;
  try {
    return await ApiUsersChangePassword(uuid, oldPassword, newPassword, thunkApi.signal);
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const changeEmail = createAsyncThunk<
  ApiAuthResponse,
  { uuid: string; email: string; password: string },
  { rejectValue: string }
>('user/changeEmail', async (params, thunkApi) => {
  const { uuid, email, password } = params;
  try {
    return await ApiUsersChangeEmail(uuid, email, password, thunkApi.signal);
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    unsetChangePassword: (state) => {
      state.changePasswordState.status = ApiAsyncStatus.initializing;
      state.changePasswordState.error = null;
    },
    unsetChangeEmail: (state) => {
      state.changeEmailState.status = ApiAsyncStatus.initializing;
      state.changeEmailState.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restore.pending, (state) => {
        state.restoreState.status = ApiAsyncStatus.loading;
      })
      .addCase(restore.fulfilled, (state, action) => {
        const user = action.payload;
        state.restoreState.status = ApiAsyncStatus.idle;
        state.restoreState.error = null;
        state.userInfo = user;
      })
      .addCase(restore.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.restoreState.status = ApiAsyncStatus.failed;
        state.restoreState.error = error;
      })
      .addCase(login.pending, (state) => {
        state.loginState.status = ApiAsyncStatus.loading;
      })
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload;
        state.loginState.status = ApiAsyncStatus.idle;
        state.loginState.error = null;
        state.userInfo = user;
      })
      .addCase(login.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.loginState.status = ApiAsyncStatus.failed;
        state.loginState.error = error;
      })
      .addCase(logout.pending, (state) => {
        state.logoutState.status = ApiAsyncStatus.loading;
        state.logoutState.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.logoutState.status = ApiAsyncStatus.idle;
        state.logoutState.error = null;
        state.userInfo = null;
      })
      .addCase(logout.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.logoutState.status = ApiAsyncStatus.failed;
        state.logoutState.error = error;
      })
      .addCase(changePassword.pending, (state) => {
        state.changePasswordState.status = ApiAsyncStatus.loading;
        state.changePasswordState.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordState.status = ApiAsyncStatus.idle;
        state.changePasswordState.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.changePasswordState.status = ApiAsyncStatus.failed;
        state.changePasswordState.error = error;
      })
      .addCase(changeEmail.pending, (state) => {
        state.changeEmailState.status = ApiAsyncStatus.loading;
        state.changeEmailState.error = null;
      })
      .addCase(changeEmail.fulfilled, (state) => {
        state.changeEmailState.status = ApiAsyncStatus.idle;
        state.changeEmailState.error = null;
      })
      .addCase(changeEmail.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.changeEmailState.status = ApiAsyncStatus.failed;
        state.changeEmailState.error = error;
      });
  },
});

export const { unsetChangePassword, unsetChangeEmail } = userSlice.actions;

export const selectIsPreparingUserInfo = (state: RootState) => isApiPreparing(state.user.restoreState);

export const selectUserInfo = (state: RootState) => state.user.userInfo;
export const selectRestoreState = (state: RootState) => state.user.restoreState;
export const selectLoginState = (state: RootState) => state.user.loginState;
export const selectLogoutState = (state: RootState) => state.user.logoutState;
export const selectChangePasswordState = (state: RootState) => state.user.changePasswordState;
export const selectChangeEmailState = (state: RootState) => state.user.changeEmailState;

export default userSlice.reducer;
