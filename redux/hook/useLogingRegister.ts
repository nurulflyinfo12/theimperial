import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { useCallback } from "react";

import api from "@/services/apiClient";
import {
  setLoginStart,
  setLoginSuccess,
  setLoginFailure,
  setRegisterStart,
  setRegisterSuccess,
  setRegisterFailure,
} from "../slice/loginResigterSlice";
import { setCredentials } from "../slice/authSlice"; // ← added

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

interface LoginPayload {
  Username: string;
  Password: string;
}

interface RegisterPayload {
  CompanyID: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Password: string;
}

export const useLoginRegister = () => {
  const dispatch = useAppDispatch();

  const {
    loginData,
    loginLoading,
    loginError,
    registerData,
    registerLoading,
    registerError,
  } = useAppSelector((state) => state.loginRegister);

  // ===== Login =====
  const createLogin = useCallback(
    async (payload: LoginPayload) => {
      try {
        dispatch(setLoginStart());

        const response = await api.post("/public/Login", payload);

        dispatch(setLoginSuccess(response.data));

        // ===== Set Authenticated User =====
        dispatch(
          setCredentials({
            user: response.data.user || response.data, // adjust according to your API
            token: response.data.token,
          })
        );

        return response.data;
      } catch (err: any) {
        const message =
          err.response?.data?.message || err.message || "Login failed";

        dispatch(setLoginFailure(message));
        console.error("Login error:", err);
        throw err;
      }
    },
    [dispatch]
  );

  // ===== Register =====
  const createRegister = useCallback(
    async (payload: RegisterPayload) => {
      try {
        dispatch(setRegisterStart());

        const response = await api.post("/public/register-customer", payload);

        dispatch(setRegisterSuccess(response.data));

        // ===== Optionally auto login after register =====
        // Uncomment if you want auto login after successful registration
        /*
        dispatch(
          setCredentials({
            user: response.data.user || response.data,
            token: response.data.token,
          })
        );
        */

        return response.data;
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Registration failed";

        dispatch(setRegisterFailure(message));
        console.error("Register error:", err);
        throw err;
      }
    },
    [dispatch]
  );

  return {
    // Login
    loginData,
    loginLoading,
    loginError,
    createLogin,

    // Register
    registerData,
    registerLoading,
    registerError,
    createRegister,
  };
};