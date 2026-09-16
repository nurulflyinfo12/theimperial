import { configureStore } from '@reduxjs/toolkit';
import roomsReducer from "./slice/roomsSlice";
import applicationReducer from "./slice/applicationSlice"
import loginRegisterReducer from "./slice/loginResigterSlice"
import authReducer from "./slice/authSlice"

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
    application: applicationReducer,
    loginRegister: loginRegisterReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;