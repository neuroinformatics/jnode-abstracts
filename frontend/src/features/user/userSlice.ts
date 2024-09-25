import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ApiUsersChangeEmail,
  ApiUsersChangePassword,
  ApiUsersCurrent,
  ApiUsersExists,
  ApiUsersLogin,
  ApiUsersLogout,
  ApiUsersRequestPasswordReset,
  ApiUsersResetPassword,
} from '../../api/userApi';
import { getApiErrorMessage, getApiErrorStatusCode } from '../../api/utilities';
import { RootState } from '../../app/store';
import { ApiActionState, ApiAsyncStatus, ApiSuccessResponse, isApiPreparing } from '../../entities/api';
import { UserEntity } from '../../entities/user';

interface UserState {
  userInfo: UserEntity | null;
  restoreState: ApiActionState;
  pageActionState: ApiActionState;
}

const initialState: Readonly<UserState> = {
  userInfo: null,
  restoreState: { error: null, status: ApiAsyncStatus.initializing },
  pageActionState: { error: null, status: ApiAsyncStatus.initializing },
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

export const logout = createAsyncThunk<ApiSuccessResponse, void, { rejectValue: string }>(
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

export const exists = createAsyncThunk<ApiSuccessResponse, { email: string }, { rejectValue: string }>(
  'user/exists',
  async (params, thunkApi) => {
    const { email } = params;
    console.log(email);
    try {
      return await ApiUsersExists(email, thunkApi.signal);
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const requestPasswordReset = createAsyncThunk<ApiSuccessResponse, { email: string }, { rejectValue: string }>(
  'user/requestPasswordReset',
  async (params, thunkApi) => {
    const { email } = params;
    try {
      return await ApiUsersRequestPasswordReset(email, thunkApi.signal);
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const resetPassword = createAsyncThunk<ApiSuccessResponse, { token: string }, { rejectValue: string }>(
  'user/resetPassword',
  async (params, thunkApi) => {
    const { token } = params;
    try {
      return await ApiUsersResetPassword(token, thunkApi.signal);
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const changePassword = createAsyncThunk<
  ApiSuccessResponse,
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
  ApiSuccessResponse,
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

const StateFuncPageActionInitialize = (state: Readonly<UserState>) => {
  state.pageActionState.status = ApiAsyncStatus.initializing;
  state.pageActionState.error = null;
};
const StateFuncPageActionPending = (state: Readonly<UserState>) => {
  state.pageActionState.status = ApiAsyncStatus.loading;
  state.pageActionState.error = null;
};
const StateFuncPageActionFulfilled = (state: Readonly<UserState>) => {
  state.pageActionState.status = ApiAsyncStatus.idle;
  state.pageActionState.error = null;
};
const StateFuncPageActionRejected = (state: Readonly<UserState>, payload: string | undefined) => {
  const error = payload || '';
  state.pageActionState.status = ApiAsyncStatus.failed;
  state.pageActionState.error = error;
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    unsetPageActionState: (state) => {
      StateFuncPageActionInitialize(state);
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
        StateFuncPageActionPending(state);
      })
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload;
        StateFuncPageActionFulfilled(state);
        state.userInfo = user;
      })
      .addCase(login.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(logout.pending, (state) => {
        StateFuncPageActionPending(state);
      })
      .addCase(logout.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
        state.userInfo = null;
      })
      .addCase(logout.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(exists.pending, (state) => {
        StateFuncPageActionPending(state);
      })
      .addCase(exists.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(exists.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(requestPasswordReset.pending, (state) => {
        StateFuncPageActionPending(state);
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(resetPassword.pending, (state) => {
        StateFuncPageActionPending(state);
      })
      .addCase(resetPassword.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(changePassword.pending, (state) => {
        StateFuncPageActionPending(state);
      })
      .addCase(changePassword.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(changePassword.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(resetPassword.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(changeEmail.pending, (state) => {
        StateFuncPageActionPending(state);
      })
      .addCase(changeEmail.fulfilled, (state) => {
        StateFuncPageActionFulfilled(state);
      })
      .addCase(changeEmail.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      });
  },
});

export const { unsetPageActionState } = userSlice.actions;

export const selectIsPreparingUserInfo = (state: RootState) => isApiPreparing(state.user.restoreState);

export const selectUserInfo = (state: RootState) => state.user.userInfo;
export const selectRestoreState = (state: RootState) => state.user.restoreState;
export const selectPageActionState = (state: RootState) => state.user.pageActionState;

export default userSlice.reducer;
