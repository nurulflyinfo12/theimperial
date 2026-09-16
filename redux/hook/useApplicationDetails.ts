import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { useCallback } from "react";

import {
  setApplicationStart,
  setApplicationSuccess,
  setApplicationFailure,
} from "../slice/applicationSlice";
import api from "@/services/apiClient";


export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useApplication = () => {
  const dispatch = useAppDispatch();

  const { application, loading, error } = useAppSelector(
    (state) => state.application
  );    

  const fetchApplication = useCallback(async () => {
    try {
      dispatch(setApplicationStart());

      const response = await api.get("/api/Common/GetApplicationDetails");

      dispatch(setApplicationSuccess(response.data));
    } catch (err: any) {
      dispatch(
        setApplicationFailure(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch application details"
        )
      );

      console.error("Application fetch error:", err);
    }
  }, [dispatch]);

  return {
    application,
    loading,
    error,
    fetchApplication,
    refetch: fetchApplication,
  };
};