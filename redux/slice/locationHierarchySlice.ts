import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Country {
  CompanyID: string;
  CountryCode: string;
  ISOCountryCode: string;
  CountryName: string;
  Nationality: string;
  CountryTeleIndex: string;
}

interface LocationState {
  countries: Country[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  countries: [],
  loading: false,
  error: null,
};

const locationHierarchySlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    setCountries: (state, action: PayloadAction<Country[]>) => {
      state.countries = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCountries,
  setLoading,
  setError,
} = locationHierarchySlice.actions;

export default locationHierarchySlice.reducer;
