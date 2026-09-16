import api from "@/services/apiClient";
import { useState, useCallback } from "react";

interface SearchParams {
  checkIn: string;
  checkOut: string;
  adultCount: number;
  childCount: number;
  childAges: number[];
}

export const useSearchRooms = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRooms = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/public/rooms-search", {
        params: {
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          adultCount: params.adultCount,
          childCount: params.childCount,
          childAge: params.childAges, 
        },
      });

      setResults(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong during search."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    searchRooms,
  };
};