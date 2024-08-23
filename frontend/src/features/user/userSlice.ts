import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiUsersCurrent, ApiUsersLogin, ApiUsersLogout } from '../../api/userApi';
import { getApiErrorStatusCode } from '../../api/utilities';
import { RootState } from '../../app/store';
import { AsyncApiStatus, AsyncApiStatuses } from '../../entities/api';
import { UserEntity } from '../../entities/users';

interface UserState {
  userInfo: UserEntity | null;
  error: string | null;
  apiStatus: {
    login: AsyncApiStatuses;
  };
}

const initialState: Readonly<UserState> = {
  userInfo: null,
  error: null,
  apiStatus: {
    login: AsyncApiStatus.initial,
  },
};

export const restore = createAsyncThunk<{ user: UserEntity }>('user/initialize', async (_, thunkApi) => {
  const user = await ApiUsersCurrent(thunkApi.signal);
  return { user };
});

export const login = createAsyncThunk<
  { user: UserEntity },
  { username: string; password: string },
  { rejectValue: string }
>('user/login', async (params, thunkApi) => {
  const { username, password } = params;
  try {
    await ApiUsersLogin(username, password, thunkApi.signal);
    const user = await ApiUsersCurrent(thunkApi.signal);
    return { user };
  } catch (e: unknown) {
    if (getApiErrorStatusCode(e) === 401) {
      return thunkApi.rejectWithValue('Invalid credential');
    }
    return thunkApi.rejectWithValue('Unexpected error');
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>('user/logout', async (_, thunkApi) => {
  try {
    await ApiUsersLogout(thunkApi.signal);
  } catch (e: unknown) {
    if (getApiErrorStatusCode(e) === 401) {
      return thunkApi.rejectWithValue('Invalid credential');
    }
    return thunkApi.rejectWithValue('Unexpected error');
  }
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(restore.pending, (state) => {
        state.apiStatus.login = AsyncApiStatus.loading;
      })
      .addCase(restore.fulfilled, (state, action) => {
        const { user } = action.payload;
        state.apiStatus.login = AsyncApiStatus.idle;
        state.userInfo = user;
        state.error = null;
      })
      .addCase(restore.rejected, (state) => {
        state.apiStatus.login = AsyncApiStatus.failed;
      })
      .addCase(login.pending, (state) => {
        state.apiStatus.login = AsyncApiStatus.loading;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { user } = action.payload;
        state.apiStatus.login = AsyncApiStatus.idle;
        state.userInfo = user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.apiStatus.login = AsyncApiStatus.failed;
        state.error = action.payload ?? '';
      })
      .addCase(logout.pending, (state) => {
        state.apiStatus.login = AsyncApiStatus.loading;
      })
      .addCase(logout.fulfilled, (state) => {
        state.apiStatus.login = AsyncApiStatus.idle;
        state.userInfo = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.apiStatus.login = AsyncApiStatus.failed;
        state.error = action.payload ?? '';
      });
  },
});

export const selectUserInfo = (state: RootState) => state.user.userInfo;

export default userSlice.reducer;
