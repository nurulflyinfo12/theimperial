import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useCallback } from 'react';
import {
  setRoomsStart,
  setRoomsSuccess,
  setRoomsFailure,
} from '../slice/roomsSlice';
import api from '@/services/apiClient';

// Type for the booking payload
export interface BookingRequestGuest {
  BookingGuestID: number;
  BookingRequestId: number;
  GuestId: string;
  CompanyId: string;
  FullName: string;
  Email: string;
  Phone: string;
  Age: number;
  Address: string;
  CountryId: string;
  CountryName: string;
  DivisionId: string;
  DistrictId: string;
  UpazilaId: string;
  IsPrimary: boolean;
  Nationality: string;
  PassportOrID: string;
  UserId: string;
}

export interface BookingRequestRoom {
  RoomRequestID: number;
  BookingRequestId: number;
  RoomId: number;
  CompanyId: string;
  RoomType: string;
  RoomTypeID: number;
  RoomName: string;
  RoomNumber: string;
  NumberOfGuests: number;
  ExtraBedNeeded: boolean;
  SmokingPreference: boolean;
  UserId: string;
}

export interface BookingRequestPayload {
  BookingRequest: {
    BookingRequestId: number;
    CompanyId: string;

    CheckInDate: string;
    CheckOutDate: string;

    NumberOfRooms: number;
    NumberOfAdults: number;
    NumberOfChildren: number;

    TotalAmount: number;

    SpecialRequests: string;

    RejectedReason: string;
    RejectionRemarks: string;
    ApprovedRemarks: string;

    RejectedBy: string;
    ApprovedBy: string;

    Status: string;
    UserId: string;

    RejectedAt: string;
    ApprovedAt: string;

    RequestGuest: BookingRequestGuest;
    BookingRequestRooms: BookingRequestRoom[];
  };

  BookingRequestGuest: BookingRequestGuest;
  BookingRequestRooms: BookingRequestRoom[];
}


export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useRooms = () => {
  const dispatch = useAppDispatch();
  const { rooms, loading, error } = useAppSelector((state) => state.rooms);

  // Booking confirmation 
  const createConfirmRoom = async (
    finalPayload: BookingRequestPayload
  ) => {
    try {
      const response = await api.post(
        "/public/create-booking-request",
        finalPayload
      );

      // console.log(response.data);

      return response.data;
    } catch (err: any) {
      console.error(err);

      throw new Error(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong"
      );
    }
  };

  const fetchRooms = useCallback(async () => {
    try {
      dispatch(setRoomsStart());

      const response = await api.get("/public/get-all-rooms");

      dispatch(setRoomsSuccess(response.data));
    } catch (err: any) {
      dispatch(
        setRoomsFailure(
          err.response?.data?.message || err.message || "Something went wrong"
        )
      );
    }
  }, [dispatch]);

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createConfirmRoom,
    refetch: fetchRooms,
  };
};