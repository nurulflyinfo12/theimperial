import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Application {
  AppConfigID: number;
  ApplicationName: string;
  Logo: string | null;
  LogoURL: string;
  Description: string;
  ContactEmail: string;
  SupportPhone: string;
  Version: string;
  IsActive: boolean;
  CompanyID: string;
  VatPercentage: number;
  TaxPercentage: number;
  SDPercentage: number;
  VatFoodPercentage: number;
  TaxFoodPercentage: number;
  SDFoodPercentage: number;
}

interface ApplicationState {
  application: Application | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  application: null,
  loading: false,
  error: null,
};

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setApplicationStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    setApplicationSuccess: (
      state,
      action: PayloadAction<Application>
    ) => {
      state.loading = false;
      state.application = action.payload;
    },

    setApplicationFailure: (
      state,
      action: PayloadAction<string>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearApplication: (state) => {
      state.application = null;
      state.error = null;
    },
  },
});

export const {
  setApplicationStart,
  setApplicationSuccess,
  setApplicationFailure,
  clearApplication,
} = applicationSlice.actions;

export default applicationSlice.reducer;