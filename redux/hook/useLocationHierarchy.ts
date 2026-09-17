import api from "@/services/apiClient";
import { useActionState, useCallback } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { setCountries, setError, setLoading } from "../slice/locationHierarchySlice";
import { useApplication } from "./useApplicationDetails";
import type { RootState, AppDispatch } from "../store";
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


export const useLocationHierarchy = () => {
  const dispatch = useDispatch();

  const { countries, loading, error } = useAppSelector((state) => state.locations);
  const fetchLocationData = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await api.get(
        "/public/GetDivisionAndDistrictHierarchy"
      );

      dispatch(setCountries(response.data));

      return response.data;
    } catch (err: any) {
      dispatch(
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch location data."
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    countries, 
    loading, 
    error,
    fetchLocationData,
  };
};
