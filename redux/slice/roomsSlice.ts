import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Room {
  RoomId: number;
  RoomNumber: string;
  RoomName: string;
  FloorNo: number;
  RoomTypeId: number;
  RoomType?: any;
  RoomKey?: string;
  KeyId?: number;
}

interface RoomsState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomsState = {
  rooms: [],
  loading: false,
  error: null,
};

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRoomsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setRoomsSuccess: (state, action: PayloadAction<Room[]>) => {
      state.loading = false;
      state.rooms = action.payload;
    },
    setRoomsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearRooms: (state) => {
      state.rooms = [];
      state.error = null;
    },
  },
});

export const { 
  setRoomsStart, 
  setRoomsSuccess, 
  setRoomsFailure, 
  clearRooms 
} = roomsSlice.actions;

export default roomsSlice.reducer;