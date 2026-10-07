import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiUsersCreate, ApiUsersList, ApiUsersUpdate } from '../../api/userApi';
import { getApiErrorMessage } from '../../api/utilities';
import type { RootState } from '../../app/store';
import type { NormalizedState } from '../../common/normalizedState';
import { type ApiActionState, ApiAsyncStatus } from '../../entities/api';
import type { UserEntity } from '../../entities/user';

export type AccountStateAccounts = NormalizedState<UserEntity, string>;

interface AccountState {
  accountsInfo: AccountStateAccounts;
  getListState: ApiActionState;
  pageActionState: ApiActionState;
}

const initialState: Readonly<AccountState> = {
  accountsInfo: { byId: {}, allIds: [] },
  getListState: { type: null, error: null, status: ApiAsyncStatus.initializing },
  pageActionState: { type: null, error: null, status: ApiAsyncStatus.initializing },
};

export const getAccountList = createAsyncThunk<UserEntity[], void, { rejectValue: string }>(
  'account/list',
  async (_, thunkApi) => {
    try {
      const accounts = await ApiUsersList(thunkApi.signal);
      return accounts;
    } catch (e: unknown) {
      const message = await getApiErrorMessage(e);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const createAccount = createAsyncThunk<
  UserEntity,
  { email: string; firstName: string; lastName: string },
  { rejectValue: string }
>('account/create', async (params, thunkApi) => {
  const { email, firstName, lastName } = params;
  try {
    const account = await ApiUsersCreate(email, firstName, lastName, thunkApi.signal);
    return account;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

export const updateAccount = createAsyncThunk<
  UserEntity,
  { uuid: string; firstName: string; lastName: string; isActive: boolean },
  { rejectValue: string }
>('account/update', async (params, thunkApi) => {
  const { uuid, firstName, lastName, isActive } = params;
  try {
    const account = await ApiUsersUpdate(uuid, firstName, lastName, isActive, thunkApi.signal);
    return account;
  } catch (e: unknown) {
    const message = await getApiErrorMessage(e);
    return thunkApi.rejectWithValue(message);
  }
});

const StateFuncPageActionInitialize = (state: Readonly<AccountState>) => {
  state.pageActionState.type = null;
  state.pageActionState.error = null;
  state.pageActionState.status = ApiAsyncStatus.initializing;
};
const StateFuncPageActionPending = (state: Readonly<AccountState>, type: string) => {
  state.pageActionState.type = type;
  state.pageActionState.error = null;
  state.pageActionState.status = ApiAsyncStatus.loading;
};
const StateFuncPageActionFulfilled = (state: Readonly<AccountState>) => {
  state.pageActionState.error = null;
  state.pageActionState.status = ApiAsyncStatus.idle;
};
const StateFuncPageActionRejected = (state: Readonly<AccountState>, payload: string | undefined) => {
  const error = payload || '';
  state.pageActionState.error = error;
  state.pageActionState.status = ApiAsyncStatus.failed;
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    unsetPageActionState: (state) => {
      StateFuncPageActionInitialize(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAccountList.pending, (state) => {
        state.getListState.status = ApiAsyncStatus.loading;
      })
      .addCase(getAccountList.fulfilled, (state, action) => {
        const accounts = action.payload;
        state.getListState.error = null;
        state.getListState.status = ApiAsyncStatus.idle;
        state.accountsInfo = { allIds: [], byId: {} };
        accounts.forEach((account) => {
          state.accountsInfo.allIds.push(account.uuid);
          state.accountsInfo.byId[account.uuid] = account;
        });
      })
      .addCase(getAccountList.rejected, (state, action) => {
        const error = action.payload ?? '';
        state.getListState.error = error;
        state.getListState.status = ApiAsyncStatus.failed;
      })
      .addCase(createAccount.pending, (state) => {
        StateFuncPageActionPending(state, 'create');
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        const account = action.payload;
        StateFuncPageActionFulfilled(state);
        state.accountsInfo.allIds.unshift(account.uuid);
        state.accountsInfo.byId[account.uuid] = account;
      })
      .addCase(createAccount.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      })
      .addCase(updateAccount.pending, (state) => {
        StateFuncPageActionPending(state, 'update');
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const account = action.payload;
        StateFuncPageActionFulfilled(state);
        state.accountsInfo.byId[account.uuid] = account;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        StateFuncPageActionRejected(state, action.payload);
      });
  },
});

export const { unsetPageActionState } = accountSlice.actions;

export const selectAccountsInfo = (state: RootState) => state.account.accountsInfo;
export const selectGetListState = (state: RootState) => state.account.getListState;
export const selectPageActionState = (state: RootState) => state.account.pageActionState;

export default accountSlice.reducer;
