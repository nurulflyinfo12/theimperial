import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LoginResponse {
  // Adjust according to your API response
  token?: string;
  user?: any;
  [key: string]: any;
}

export interface RegisterResponse {
  // Adjust according to your API response
  message?: string;
  [key: string]: any;
}

interface LoginRegisterState {
  // Login
  loginData: LoginResponse | null;
  loginLoading: boolean;
  loginError: string | null;

  // Register (separate)
  registerData: RegisterResponse | null;
  registerLoading: boolean;
  registerError: string | null;
}

const initialState: LoginRegisterState = {
  loginData: null,
  loginLoading: false,
  loginError: null,

  registerData: null,
  registerLoading: false,
  registerError: null,
};

const loginRegisterSlice = createSlice({
  name: "loginRegister",
  initialState,
  reducers: {
    //  Login 
    setLoginStart: (state) => {
      state.loginLoading = true;
      state.loginError = null;
    },
    setLoginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.loginLoading = false;
      state.loginData = action.payload;
    },
    setLoginFailure: (state, action: PayloadAction<string>) => {
      state.loginLoading = false;
      state.loginError = action.payload;
    },
    clearLogin: (state) => {
      state.loginData = null;
      state.loginError = null;
    },

    // Register
    setRegisterStart: (state) => {
      state.registerLoading = true;
      state.registerError = null;
    },
    setRegisterSuccess: (state, action: PayloadAction<RegisterResponse>) => {
      state.registerLoading = false;
      state.registerData = action.payload;
    },
    setRegisterFailure: (state, action: PayloadAction<string>) => {
      state.registerLoading = false;
      state.registerError = action.payload;
    },
    clearRegister: (state) => {
      state.registerData = null;
      state.registerError = null;
    },
  },
});

export const {
  setLoginStart,
  setLoginSuccess,
  setLoginFailure,
  clearLogin,
  setRegisterStart,
  setRegisterSuccess,
  setRegisterFailure,
  clearRegister,
} = loginRegisterSlice.actions;

export default loginRegisterSlice.reducer;