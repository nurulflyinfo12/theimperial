"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import PageHero from "../common/pagehero";
import BookingSearch from "./BookingSearch";
import { useSearchRooms } from "@/redux/hook/useSearchRooms";
import { BookingRequestPayload, useRooms } from "@/redux/hook/useRooms";
import Step1RoomSelection from "./Step1RoomSelection";
import Step2GuestDetails from "./Step2GuestDetails";
import Step3BookingSummary from "./Step3BookingSummary";
import { useApplication } from "@/redux/hook/useApplicationDetails";
import { useAppSelector } from "@/redux/hook/useApplicationDetails";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { useLocationHierarchy } from "@/redux/hook/useLocationHierarchy";
import { IoCloseOutline, IoCloseSharp } from "react-icons/io5";
import { RiArrowDropRightLine } from "react-icons/ri";

const BookingStepper = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const stepContentRef = useRef<HTMLDivElement>(null);

  // ---- Animated sidebar / mobile-bar state ----
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SIDEBAR_OPEN_MS = 620;
  const SIDEBAR_CLOSE_MS = 480;
  const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
  const EASE_IN_OUT_SOFT = "cubic-bezier(0.65, 0, 0.35, 1)";

  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
    type?: "success" | "error" | "info";
  }>({ message: "", visible: false, type: "info" });

  const { results, loading, error, searchRooms } = useSearchRooms();
  const { countries, fetchLocationData } = useLocationHierarchy();
  const { createConfirmRoom } = useRooms();
  const { application } = useApplication();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [searchData, setSearchData] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      location: "",
      checkIn: today.toISOString().split("T")[0],
      checkOut: tomorrow.toISOString().split("T")[0],
      guests: "1",
      adults: "1",
      children: "0",
      rooms: 1,
      childrenAges: [] as number[],
    };
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    countryId: "",
    address: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>("");

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message, visible: true, type });
    setTimeout(() => setToast({ message: "", visible: false }), 2000);
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  // ---- Drive sidebar / mobile-bar show & hide animation ----
  useEffect(() => {
    const shouldShow = currentStep === 1 && selectedItems.length > 0;

    if (sidebarTimeoutRef.current) {
      clearTimeout(sidebarTimeoutRef.current);
      sidebarTimeoutRef.current = null;
    }

    if (shouldShow) {
      // Mount collapsed first, then flip to expanded next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSidebarVisible(true));
      });
    } else {
      // Animate out (the element stays mounted because the parent condition
      // only unmounts when selectedItems.length === 0 — so we simply flip
      // visibility and it collapses out before unmount).
      setSidebarVisible(false);
      sidebarTimeoutRef.current = setTimeout(() => {
        sidebarTimeoutRef.current = null;
      }, SIDEBAR_CLOSE_MS);
    }

    return () => {
      if (sidebarTimeoutRef.current) {
        clearTimeout(sidebarTimeoutRef.current);
        sidebarTimeoutRef.current = null;
      }
    };
  }, [currentStep, selectedItems.length]);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuestChange = (guestsData: {
    rooms: number;
    adults: number;
    children: number;
    childrenAges: number[];
  }) => {
    setSearchData((prev) => ({
      ...prev,
      rooms: guestsData.rooms,
      adults: guestsData.adults.toString(),
      children: guestsData.children.toString(),
      childrenAges: guestsData.childrenAges,
      guests: (guestsData.adults + guestsData.children).toString(),
    }));
  };

  const calculateNights = () => {
    if (!searchData.checkIn || !searchData.checkOut) return 1;
    const checkIn = new Date(searchData.checkIn);
    const checkOut = new Date(searchData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const numberOfNights = calculateNights();

  const totalPriceSum = selectedItems.reduce((acc, item) => {
    const nightlyPrice = item.PricePerNight || 3500;
    return acc + nightlyPrice * numberOfNights;
  }, 0);

  const handleSearchSubmit = () => {
    searchRooms({
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      adultCount: Number(searchData.adults),
      childCount: Number(searchData.children),
      childAges: searchData.childrenAges,
    });
    setSelectedItems([]);
    setCurrentStep(1);

    setTimeout(() => {
      stepContentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const handleItemToggle = (room: any) => {
    const exists = selectedItems.find((item) => item.RoomId === room.RoomId);

    if (exists) {
      setSelectedItems((prev) =>
        prev.filter((item) => item.RoomId !== room.RoomId)
      );
    } else {
      if (selectedItems.length >= searchData.rooms) {
        showToast(`You can only select ${searchData.rooms} room(s).`, "info");
        return;
      }
      setSelectedItems((prev) => [...prev, room]);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    const phone = formData.phone.trim();
    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(phone)) {
      errors.phone = "Phone number must contain only digits (0-9)";
    } else if (phone.length !== 11) {
      errors.phone = "Phone number must be exactly 11 digits";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.address.trim()) errors.address = "Address is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && selectedItems.length !== searchData.rooms) return;
    if (currentStep === 2 && !validateForm()) return;
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    if (currentStep === 1 || targetStep > 2) {
      if (selectedItems.length !== searchData.rooms) {
        showToast(
          `Please select exactly ${searchData.rooms} room(s) to continue.`,
          "info"
        );
        return;
      }
    }
    if (targetStep === 3) {
      if (!validateForm()) return;
    }

    setCurrentStep(targetStep);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    if (!selectedItems.length) {
      showToast("Please select at least one room.", "error");
      return;
    }

    if (!validateForm()) {
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    const companyId = application?.CompanyID || "";
    const userId = user?.UserId || "";

    const guestFullName = `${formData.firstName} ${formData.lastName}`.trim();

    const guestData = {
      BookingGuestID: 0,
      BookingRequestId: 0,
      GuestId: "",
      CompanyId: companyId,
      FullName: guestFullName,
      Email: formData.email,
      Phone: formData.phone,
      Age: 0,
      Address: formData.address,
      CountryId: formData.countryId,
      CountryName:
        countries.find(
          (c: any) => String(c.CountryCode) === String(formData.countryId)
        )?.CountryName ?? "",
      DivisionId: "",
      DistrictId: "",
      UpazilaId: "",
      IsPrimary: true,
      Nationality: "",
      PassportOrID: "",
      UserId: userId,
    };

    const roomData = selectedItems.map((room) => ({
      RoomRequestID: 0,
      BookingRequestId: 0,
      RoomId: room.RoomId || 0,
      CompanyId: companyId,
      RoomType: room.RoomType?.TypeName || "",
      RoomTypeID: room.RoomTypeID || room.RoomTypeId || 0,
      RoomName: room.RoomName || "",
      RoomNumber: room.RoomNumber || "",
      NumberOfGuests: room.NumberOfGuests,
      ExtraBedNeeded: false,
      SmokingPreference: false,
      UserId: userId,
    }));

    const finalPayload: BookingRequestPayload = {
      BookingRequest: {
        BookingRequestId: 0,
        CompanyId: companyId,
        CheckInDate: new Date(searchData.checkIn).toISOString(),
        CheckOutDate: new Date(searchData.checkOut).toISOString(),
        NumberOfRooms: searchData.rooms,
        NumberOfAdults: Number(searchData.adults),
        NumberOfChildren: Number(searchData.children),
        TotalAmount: totalPriceSum,
        SpecialRequests: formData.message || "",
        RejectedReason: "",
        RejectionRemarks: "",
        ApprovedRemarks: "",
        RejectedBy: "",
        ApprovedBy: "",
        Status: "Pending",
        UserId: userId,
        RejectedAt: new Date(0).toISOString(),
        ApprovedAt: new Date(0).toISOString(),
        RequestGuest: guestData,
        BookingRequestRooms: roomData,
      },
      BookingRequestGuest: guestData,
      BookingRequestRooms: roomData,
    };

    try {
      await createConfirmRoom(finalPayload);
      setIsBookingSuccess(true);
      showToast("Booking request submitted successfully!", "success");
    } catch (err) {
      console.error("Booking error:", err);
      showToast("Booking failed. Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRoomSelectionComplete =
    currentStep === 1 && selectedItems.length === searchData.rooms;

  // Shared transition strings
  const sidebarTransition = [
    `opacity ${sidebarVisible ? SIDEBAR_OPEN_MS : SIDEBAR_CLOSE_MS}ms ${
      sidebarVisible ? EASE_OUT_EXPO : EASE_IN_OUT_SOFT
    }`,
    `transform ${sidebarVisible ? SIDEBAR_OPEN_MS : SIDEBAR_CLOSE_MS}ms ${
      sidebarVisible ? EASE_OUT_EXPO : EASE_IN_OUT_SOFT
    }`,
  ].join(", ");

  return (
    <>
      <PageHero title="Book Now" backgroundImage="/images/viproom.webp" />

      <BookingSearch
        searchData={searchData}
        handleSearchChange={handleSearchChange}
        onSearchClick={handleSearchSubmit}
        onGuestChange={handleGuestChange}
      />

      {/*booking main section*/}
      <div className="w-full py-8 md:py-28">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-card rounded-3xl p-6 sm:p-8 shadow-xl z-10">
            {/* ================= PROGRESS HEADER ================= */}
            <div className="pb-10 border-b border-neutral-100">
              <div className="max-w-3xl mx-auto text-center mb-10">
                <div className="flex items-center gap-3 mb-4 justify-center">
                  <span className="h-[1px] w-10 sm:w-14 bg-[#556B2F]" />
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-primary tracking-wide">
                    Complete Your Booking
                  </h2>
                  <span className="h-[1px] w-10 sm:w-14 bg-[#556B2F]" />
                </div>
                <p className="text-neutral-400 text-sm mt-3">
                  Please follow the steps below to reserve your luxury stay
                </p>
              </div>

              <div className="max-w-4xl mx-auto relative px-4">
                <div className="flex justify-between items-center relative">
                  {[1, 2, 3].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleStepClick(step)}
                      className="flex flex-col items-center z-10 group relative focus:outline-none cursor-pointer"
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all duration-500 shadow-sm ${
                          currentStep === step
                            ? "bg-[#556B2F] text-white border-[#556B2F] scale-110"
                            : currentStep > step
                            ? "bg-[#D4AF37] text-white border-[#D4AF37]"
                            : "bg-white border-neutral-200 text-neutral-400 group-hover:border-[#D4AF37]/50"
                        }`}
                      >
                        {currentStep > step ? (
                          <FiCheck className="text-xl stroke-[3]" />
                        ) : (
                          step
                        )}
                      </div>
                      <p
                        className={`text-xs mt-3.5 font-bold tracking-widest uppercase transition-colors duration-300 ${
                          currentStep === step
                            ? "text-[#556B2F]"
                            : "text-neutral-400 group-hover:text-neutral-600"
                        }`}
                      >
                        {step === 1 && "Select Rooms"}
                        {step === 2 && "Guest Details"}
                        {step === 3 && "Confirm & Pay"}
                      </p>
                    </button>
                  ))}

                  {/* Progress line */}
                  <div className="absolute top-7 left-8 right-8 h-[2px] bg-neutral-200 -z-10 flex">
                    <div
                      className="bg-gradient-to-r from-[#D4AF37] to-[#556B2F] h-full transition-all duration-700 ease-out rounded-full"
                      style={{
                        width:
                          currentStep === 1
                            ? "0%"
                            : currentStep === 2
                            ? "50%"
                            : "100%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP CONTENT */}
            <div ref={stepContentRef} className="py-10 md:py-14 min-h-[520px]">
              <div className="max-w-6xl mx-auto">
                {currentStep === 1 && (
                  <Step1RoomSelection
                    results={results}
                    loading={loading}
                    error={error}
                    selectedItems={selectedItems}
                    requiredRooms={searchData.rooms}
                    onItemToggle={handleItemToggle}
                    showToast={showToast}
                    onProceed={nextStep}
                    isSelectionComplete={isRoomSelectionComplete}
                  />
                )}

                {currentStep === 2 && (
                  <Step2GuestDetails
                    selectedItems={selectedItems}
                    searchDate={searchData}
                    formData={formData}
                    formErrors={formErrors}
                    totalPriceSum={totalPriceSum}
                    numberOfNights={numberOfNights}
                    countries={countries}
                    onFormChange={handleFormChange}
                    onRemoveRoom={(roomId) => {
                      setSelectedItems((prev) =>
                        prev.filter((item) => item.RoomId !== roomId)
                      );
                      setCurrentStep(1);
                      showToast("Room removed successfully.", "info");
                    }}
                    onEditRoom={() => {
                      setCurrentStep(1);
                      showToast("Edit your room selection.", "info");
                    }}
                  />
                )}

                {currentStep === 3 && (
                  <Step3BookingSummary
                    selectedItems={selectedItems}
                    searchData={searchData}
                    formData={formData}
                    countries={countries}
                    totalPriceSum={totalPriceSum}
                    numberOfNights={numberOfNights}
                  />
                )}
              </div>
            </div>

            {/* NAVIGATION FOOTER */}
            <div className="pt-6 md:pt-8 border-t border-neutral-100 flex justify-between items-center">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-2 md:py-3.5 rounded-xl border border-neutral-200 font-bold text-sm text-neutral-700 bg-white transition-all duration-200 hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <FiArrowLeft className="text-base" /> Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center text-sm font-bold text-[#D4AF37] hover:text-[#B3922E] transition-colors duration-300 group tracking-widest uppercase"
                >
                  Next Step
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center text-sm font-bold text-[#D4AF37] hover:text-[#B3922E] transition-colors duration-300 group tracking-widest uppercase disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      Processing{" "}
                      <FiLoader className="animate-spin text-base ml-2" />
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {isBookingSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-neutral-100 text-center">
            <div className="mx-auto w-16 h-16 bg-[#556B2F] text-white rounded-full flex items-center justify-center mb-6">
              <FiCheck className="text-4xl" />
            </div>

            <h2 className="text-2xl font-bold text-[#556B2F] mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-neutral-500 mb-6">
              Your booking has been successfully submitted.
            </p>

            <div className="bg-neutral-50 rounded-2xl p-5 text-left space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Booking Reference:</span>
                <span className="font-mono font-bold text-[#D4AF37]">
                  {bookingReference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Guest Name:</span>
                <span className="font-medium text-neutral-800">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Check-In Date:</span>
                <span className="text-neutral-800">{searchData.checkIn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Check-Out Date:</span>
                <span className="text-neutral-800">{searchData.checkOut}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Duration & Rooms:</span>
                <span className="font-medium text-neutral-800">
                  {numberOfNights} Night{numberOfNights > 1 ? "s" : ""} •{" "}
                  {searchData.rooms} Room{searchData.rooms > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Total Amount:</span>
                <span className="font-bold text-[#556B2F]">
                  BDT {totalPriceSum.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-sm text-neutral-500 mb-6">
              A confirmation email with all booking details has been sent to{" "}
              <br />
              <span className="font-medium text-neutral-800">
                {formData.email}
              </span>
            </div>

            <button
              onClick={() => {
                setIsBookingSuccess(false);
                setCurrentStep(1);
                setSelectedItems([]);
              }}
              className="w-full py-3.5 bg-[#556B2F] text-white font-bold rounded-2xl hover:bg-[#4a5e28] transition-all active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}
      {toast.visible && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3.5 z-[100] min-w-[340px] border transition-all duration-300 ${
            toast.type === "success"
              ? "bg-[#556B2F] border-[#556B2F] text-white"
              : toast.type === "error"
              ? "bg-red-900/95 border-red-700 text-white"
              : "bg-white border-neutral-200 text-neutral-800"
          }`}
        >
          {toast.type === "error" && (
            <FiAlertCircle className="text-xl shrink-0 text-white" />
          )}
          {toast.type === "success" && (
            <FiCheck className="text-xl shrink-0 bg-white/20 p-0.5 rounded-full" />
          )}
          <p className="font-semibold text-sm pr-6 leading-relaxed">
            {toast.message}
          </p>
          <button
            onClick={() => setToast({ message: "", visible: false })}
            className="ml-auto rounded-full w-6 h-6 flex items-center justify-center text-xs bg-white/10 hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= FIXED SELECTED ROOMS BAR (RIGHT SIDEBAR) ================= */}
      {currentStep === 1 && selectedItems.length > 0 && (
        <div
          className="fixed right-4 top-1/2 z-[90] hidden xl:flex flex-col w-[280px] max-h-[80vh] bg-white rounded-3xl border border-neutral-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden"
          style={{
            transformOrigin: "right center",
            opacity: sidebarVisible ? 1 : 0,
            transform: `translateY(-50%) translateX(${
              sidebarVisible ? "0px" : "40px"
            }) scale(${sidebarVisible ? 1 : 0.94})`,
            transition: sidebarTransition,
            willChange: "opacity, transform",
          }}
        >
          {/* ============ HEADER ============ */}
          <div className="px-5 py-4 border-b border-neutral-100 bg-[#f5f5f0]">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-[1px] w-6 bg-[#556B2F]" />
              <h3 className="text-sm font-bold text-[#556B2F] uppercase tracking-widest">
                Your Selection
              </h3>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              {selectedItems.length} of {searchData.rooms} room
              {searchData.rooms > 1 ? "s" : ""} selected
            </p>
          </div>

          {/* ============ SCROLLABLE LIST ============ */}
          <style jsx>{`
            .premium-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .premium-scrollbar::-webkit-scrollbar-track {
              background: #f5f5f0;
              border-radius: 99px;
              margin: 12px 0;
            }
            .premium-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #d4af37, #556b2f);
              border-radius: 99px;
              border: 1px solid #f5f5f0;
            }
            .premium-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #b3922e, #4a5e28);
            }
            .premium-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #d4af37 #f5f5f0;
            }
          `}</style>
          <div className="flex-1 max-h-[202px] overflow-y-auto px-4 py-4 space-y-3 premium-scrollbar">
            {selectedItems.map((room, idx) => (
              <div
                key={room.RoomId || idx}
                className="group relative bg-[#f5f5f0] border border-neutral-100 hover:border-[#D4AF37]/50 rounded-2xl p-3 transition-all duration-200"
              >
                {/* Remove Button (Top Right) */}
                <button
                  type="button"
                  onClick={() => handleItemToggle(room)}
                  title="Remove room"
                  aria-label={`Remove ${room.RoomName || "room"}`}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white text-neutral-400 hover:bg-red-500 hover:text-white border border-neutral-200 hover:border-red-500 transition-all duration-200 active:scale-90 cursor-pointer z-10"
                >
                  <span className="text-[10px] font-bold leading-none">✕</span>
                </button>

                {/* Room Content */}
                <div className="flex gap-3 pr-7">
                  {/* Thumb */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100 shrink-0">
                    <img
                      src={room.RoomImage || "/images/imperiallogo.png"}
                      alt={room.RoomName || "Room"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                    <p className="font-bold text-xs text-neutral-800 truncate tracking-wide">
                      {room.RoomName ||
                        room.roomName ||
                        `Room ${room.RoomNumber}`}
                    </p>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-semibold mt-0.5">
                      Slot #{idx + 1}
                    </p>
                    <p className="text-[11px] text-[#556B2F] font-bold mt-1">
                      BDT {(room.PricePerNight || 3500).toLocaleString()}
                      <span className="text-[9px] text-neutral-500 font-normal lowercase">
                        {" "}
                        / night
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer: Price + Button */}
          <div className="px-5 py-4 border-t border-neutral-100 bg-white space-y-3">
            {/* Price */}
            <div className="flex items-end justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Total
              </span>
              <div className="text-right">
                <p className="text-xl font-black text-[#556B2F] tracking-tight">
                  BDT {totalPriceSum.toLocaleString()}
                </p>
                <p className="text-[10px] text-neutral-500">
                  {numberOfNights} night{numberOfNights > 1 ? "s" : ""} ×{" "}
                  {selectedItems.length} room
                  {selectedItems.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={nextStep}
              disabled={selectedItems.length !== searchData.rooms}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedItems.length === searchData.rooms
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#B3922E] text-white shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              GO TO CHECKOUT
              <span className="text-base">›</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE FALLBACK (BOTTOM BAR for small screens) */}
      {currentStep === 1 && selectedItems.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[90] xl:hidden bg-white border-t border-neutral-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
          style={{
            transformOrigin: "bottom center",
            opacity: sidebarVisible ? 1 : 0,
            transform: `translateY(${sidebarVisible ? "0%" : "100%"})`,
            transition: sidebarTransition,
            willChange: "opacity, transform",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="flex flex-col sm:flex-row items-center gap-4 py-4"
              style={{
                opacity: sidebarVisible ? 1 : 0,
                transform: sidebarVisible
                  ? "translateY(0)"
                  : "translateY(10px)",
                transition: `opacity 420ms ${EASE_OUT_EXPO} ${
                  sidebarVisible ? "180ms" : "0ms"
                }, transform 420ms ${EASE_OUT_EXPO} ${
                  sidebarVisible ? "180ms" : "0ms"
                }`,
              }}
            >
              {/* LEFT: Selected Rooms Chips */}
              <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto overflow-x-auto">
                <div className="flex items-center -space-x-3 shrink-0">
                  {selectedItems.slice(0, 3).map((room, idx) => (
                    <div
                      key={room.RoomId || idx}
                      className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-neutral-100"
                      style={{ zIndex: 10 - idx }}
                    >
                      <img
                        src={room.RoomImage || "/images/imperiallogo.png"}
                        alt={room.RoomName || "Room"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {selectedItems.length > 3 && (
                    <div
                      className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#556B2F] flex items-center justify-center text-white text-xs font-bold"
                      style={{ zIndex: 0 }}
                    >
                      +{selectedItems.length - 3}
                    </div>
                  )}
                </div>

                <div className="h-10 w-[1px] bg-neutral-200 shrink-0 hidden sm:block" />

                <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 py-1">
                  {selectedItems.map((room, idx) => (
                    <div
                      key={room.RoomId || idx}
                      className="group flex items-center gap-2 bg-[#f5f5f0] border border-neutral-100 hover:border-[#D4AF37]/50 rounded-full pl-1 pr-2 py-1 shrink-0 transition-all duration-200"
                    >
                      <div className="relative w-7 h-7 rounded-full overflow-hidden bg-neutral-100 border border-neutral-100 shrink-0">
                        <img
                          src={room.RoomImage || "/images/imperiallogo.png"}
                          alt={room.RoomName || "Room"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-neutral-800 whitespace-nowrap max-w-[110px] truncate">
                        {room.RoomName ||
                          room.roomName ||
                          `Room ${room.RoomNumber}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleItemToggle(room)}
                        title="Remove room"
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-neutral-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 active:scale-90 cursor-pointer"
                      >
                        <IoCloseSharp />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price + Checkout */}
              <div className="flex items-center gap-5 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                <div className="text-right">
                  <p className="text-lg sm:text-xl font-bold text-[#556B2F]">
                    BDT {totalPriceSum.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {numberOfNights} night{numberOfNights > 1 ? "s" : ""}{" "}
                    <IoCloseOutline /> {selectedItems.length} room
                    {selectedItems.length > 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={selectedItems.length !== searchData.rooms}
                  className={`shrink-0 px-6 sm:px-8 py-3.5 rounded-md font-bold text-sm uppercase tracking-wide transition-all duration-200 flex items-center gap-2 ${
                    selectedItems.length === searchData.rooms
                      ? "bg-[#D4AF37] hover:bg-[#B3922E] text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                      : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  GO TO CHECKOUT
                  <span className="text-lg">
                    <RiArrowDropRightLine />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODALS */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        onSuccess={() => {
          setShowLogin(false);
          setCurrentStep(3);
        }}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </>
  );
};

export default BookingStepper;

// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import {
//   FiCheck,
//   FiArrowLeft,
//   FiArrowRight,
//   FiLoader,
//   FiAlertCircle,
// } from "react-icons/fi";
// import PageHero from "../common/pagehero";
// import BookingSearch from "./BookingSearch";
// import { useSearchRooms } from "@/redux/hook/useSearchRooms";
// import { BookingRequestPayload, useRooms } from "@/redux/hook/useRooms";
// import Step1RoomSelection from "./Step1RoomSelection";
// import Step2GuestDetails from "./Step2GuestDetails";
// import Step3BookingSummary from "./Step3BookingSummary";
// import { useApplication } from "@/redux/hook/useApplicationDetails";
// import { useAppSelector } from "@/redux/hook/useApplicationDetails";
// import LoginModal from "@/components/auth/LoginModal";
// import RegisterModal from "@/components/auth/RegisterModal";
// import { useLocationHierarchy } from "@/redux/hook/useLocationHierarchy";
// import { IoCloseOutline, IoCloseSharp } from "react-icons/io5";
// import { RiArrowDropRightLine } from "react-icons/ri";

// const BookingStepper = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedItems, setSelectedItems] = useState<any[]>([]);
//   const [showLogin, setShowLogin] = useState(false);
//   const [showRegister, setShowRegister] = useState(false);

//   const stepContentRef = useRef<HTMLDivElement>(null);

//   const [toast, setToast] = useState<{
//     message: string;
//     visible: boolean;
//     type?: "success" | "error" | "info";
//   }>({ message: "", visible: false, type: "info" });

//   const { results, loading, error, searchRooms } = useSearchRooms();
//   const { countries, fetchLocationData } = useLocationHierarchy();
//   const { createConfirmRoom } = useRooms();
//   const { application } = useApplication();

//   const { isAuthenticated, user } = useAppSelector((state) => state.auth);

//   // const [searchData, setSearchData] = useState({
//   //   location: "",
//   //   checkIn: "",
//   //   checkOut: "",
//   //   guests: "1",
//   //   adults: "1",
//   //   children: "0",
//   //   rooms: 1,
//   //   childrenAges: [] as number[],
//   // });

//   const [searchData, setSearchData] = useState(() => {
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     return {
//       location: "",
//       checkIn: today.toISOString().split("T")[0],
//       checkOut: tomorrow.toISOString().split("T")[0],
//       guests: "1",
//       adults: "1",
//       children: "0",
//       rooms: 1,
//       childrenAges: [] as number[],
//     };
//   });

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     phone: "",
//     email: "",
//     message: "",
//     countryId: "",
//     address: "",
//   });

//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isBookingSuccess, setIsBookingSuccess] = useState(false);
//   const [bookingReference, setBookingReference] = useState<string>("");

//   const showToast = (
//     message: string,
//     type: "success" | "error" | "info" = "info"
//   ) => {
//     setToast({ message, visible: true, type });
//     setTimeout(() => setToast({ message: "", visible: false }), 2000);
//   };

//   useEffect(() => {
//     fetchLocationData();
//   }, []);

//   const handleSearchChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setSearchData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleGuestChange = (guestsData: {
//     rooms: number;
//     adults: number;
//     children: number;
//     childrenAges: number[];
//   }) => {
//     setSearchData((prev) => ({
//       ...prev,
//       rooms: guestsData.rooms,
//       adults: guestsData.adults.toString(),
//       children: guestsData.children.toString(),
//       childrenAges: guestsData.childrenAges,
//       guests: (guestsData.adults + guestsData.children).toString(),
//     }));
//   };

//   const calculateNights = () => {
//     if (!searchData.checkIn || !searchData.checkOut) return 1;
//     const checkIn = new Date(searchData.checkIn);
//     const checkOut = new Date(searchData.checkOut);
//     const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return Math.max(1, diffDays);
//   };

//   const numberOfNights = calculateNights();

//   const totalPriceSum = selectedItems.reduce((acc, item) => {
//     const nightlyPrice = item.PricePerNight || 3500;
//     return acc + nightlyPrice * numberOfNights;
//   }, 0);

//   const handleSearchSubmit = () => {
//     searchRooms({
//       checkIn: searchData.checkIn,
//       checkOut: searchData.checkOut,
//       adultCount: Number(searchData.adults),
//       childCount: Number(searchData.children),
//       childAges: searchData.childrenAges,
//     });
//     setSelectedItems([]);
//     setCurrentStep(1);

//     setTimeout(() => {
//       stepContentRef.current?.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       });
//     }, 0);
//   };

//   const handleItemToggle = (room: any) => {
//     const exists = selectedItems.find((item) => item.RoomId === room.RoomId);

//     if (exists) {
//       setSelectedItems((prev) =>
//         prev.filter((item) => item.RoomId !== room.RoomId)
//       );
//     } else {
//       if (selectedItems.length >= searchData.rooms) {
//         showToast(`You can only select ${searchData.rooms} room(s).`, "info");
//         return;
//       }
//       setSelectedItems((prev) => [...prev, room]);
//     }
//   };

//   const handleFormChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const validateForm = () => {
//     const errors: Record<string, string> = {};

//     if (!formData.firstName.trim()) errors.firstName = "First name is required";
//     if (!formData.lastName.trim()) errors.lastName = "Last name is required";

//     const phone = formData.phone.trim();
//     if (!phone) {
//       errors.phone = "Phone number is required";
//     } else if (!/^\d+$/.test(phone)) {
//       errors.phone = "Phone number must contain only digits (0-9)";
//     } else if (phone.length !== 11) {
//       errors.phone = "Phone number must be exactly 11 digits";
//     }

//     if (!formData.email.trim()) {
//       errors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       errors.email = "Invalid email format";
//     }

//     // if (!formData.countryId) errors.countryId = "Country is required";
//     if (!formData.address.trim()) errors.address = "Address is required";

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const nextStep = () => {
//     if (currentStep === 1 && selectedItems.length !== searchData.rooms) return;
//     if (currentStep === 2 && !validateForm()) return;
//     setCurrentStep((prev) => prev + 1);
//   };

//   const prevStep = () => setCurrentStep((prev) => prev - 1);

//   const handleStepClick = (targetStep: number) => {
//     if (targetStep === currentStep) return;

//     if (targetStep < currentStep) {
//       setCurrentStep(targetStep);
//       return;
//     }

//     if (currentStep === 1 || targetStep > 2) {
//       if (selectedItems.length !== searchData.rooms) {
//         showToast(
//           `Please select exactly ${searchData.rooms} room(s) to continue.`,
//           "info"
//         );
//         return;
//       }
//     }
//     if (targetStep === 3) {
//       if (!validateForm()) return;
//     }

//     setCurrentStep(targetStep);
//   };

//   const handleSubmit = async () => {
//     if (isSubmitting) return;

//     if (!isAuthenticated) {
//       setShowLogin(true);
//       return;
//     }

//     if (!selectedItems.length) {
//       showToast("Please select at least one room.", "error");
//       return;
//     }

//     if (!validateForm()) {
//       setCurrentStep(2);
//       return;
//     }

//     setIsSubmitting(true);

//     const companyId = application?.CompanyID || "";
//     const userId = user?.UserId || "";

//     const guestFullName = `${formData.firstName} ${formData.lastName}`.trim();

//     const guestData = {
//       BookingGuestID: 0,
//       BookingRequestId: 0,
//       GuestId: "",
//       CompanyId: companyId,
//       FullName: guestFullName,
//       Email: formData.email,
//       Phone: formData.phone,
//       Age: 0,
//       Address: formData.address,
//       CountryId: formData.countryId,
//       CountryName:
//         countries.find(
//           (c: any) => String(c.CountryCode) === String(formData.countryId)
//         )?.CountryName ?? "",
//       DivisionId: "",
//       DistrictId: "",
//       UpazilaId: "",
//       IsPrimary: true,
//       Nationality: "",
//       PassportOrID: "",
//       UserId: userId,
//     };

//     const roomData = selectedItems.map((room) => ({
//       RoomRequestID: 0,
//       BookingRequestId: 0,
//       RoomId: room.RoomId || 0,
//       CompanyId: companyId,
//       RoomType: room.RoomType?.TypeName || "",
//       RoomTypeID: room.RoomTypeID || room.RoomTypeId || 0,
//       RoomName: room.RoomName || "",
//       RoomNumber: room.RoomNumber || "",
//       NumberOfGuests: room.NumberOfGuests,
//       ExtraBedNeeded: false,
//       SmokingPreference: false,
//       UserId: userId,
//     }));

//     const finalPayload: BookingRequestPayload = {
//       BookingRequest: {
//         BookingRequestId: 0,
//         CompanyId: companyId,
//         CheckInDate: new Date(searchData.checkIn).toISOString(),
//         CheckOutDate: new Date(searchData.checkOut).toISOString(),
//         NumberOfRooms: searchData.rooms,
//         NumberOfAdults: Number(searchData.adults),
//         NumberOfChildren: Number(searchData.children),
//         TotalAmount: totalPriceSum,
//         SpecialRequests: formData.message || "",
//         RejectedReason: "",
//         RejectionRemarks: "",
//         ApprovedRemarks: "",
//         RejectedBy: "",
//         ApprovedBy: "",
//         Status: "Pending",
//         UserId: userId,
//         RejectedAt: new Date(0).toISOString(),
//         ApprovedAt: new Date(0).toISOString(),
//         RequestGuest: guestData,
//         BookingRequestRooms: roomData,
//       },
//       BookingRequestGuest: guestData,
//       BookingRequestRooms: roomData,
//     };

//     try {
//       await createConfirmRoom(finalPayload);
//       setIsBookingSuccess(true);
//       showToast("Booking request submitted successfully!", "success");
//     } catch (err) {
//       console.error("Booking error:", err);
//       showToast("Booking failed. Please try again later.", "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const isRoomSelectionComplete =
//     currentStep === 1 && selectedItems.length === searchData.rooms;

//   return (
//     <>
//       <PageHero title="Book Now" backgroundImage="/images/viproom.webp" />

//       <BookingSearch
//         searchData={searchData}
//         handleSearchChange={handleSearchChange}
//         onSearchClick={handleSearchSubmit}
//         onGuestChange={handleGuestChange}
//       />

//       {/*booking main section*/}
//       <div className="w-full py-8 md:py-28">
//         <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="relative bg-card rounded-3xl p-6 sm:p-8 shadow-xl z-10">
//             {/* ================= PROGRESS HEADER ================= */}
//             <div className="pb-10 border-b border-neutral-100">
//               <div className="max-w-3xl mx-auto text-center mb-10">
//                 <div className="flex items-center gap-3 mb-4 justify-center">
//                   <span className="h-[1px] w-10 sm:w-14 bg-[#556B2F]" />
//                   <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-primary tracking-wide">
//                     Complete Your Booking
//                   </h2>
//                   <span className="h-[1px] w-10 sm:w-14 bg-[#556B2F]" />
//                 </div>
//                 <p className="text-neutral-400 text-sm mt-3">
//                   Please follow the steps below to reserve your luxury stay
//                 </p>
//               </div>

//               <div className="max-w-4xl mx-auto relative px-4">
//                 <div className="flex justify-between items-center relative">
//                   {[1, 2, 3].map((step) => (
//                     <button
//                       key={step}
//                       type="button"
//                       onClick={() => handleStepClick(step)}
//                       className="flex flex-col items-center z-10 group relative focus:outline-none cursor-pointer"
//                     >
//                       <div
//                         className={`w-14 h-14 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all duration-500 shadow-sm ${currentStep === step
//                             ? "bg-[#556B2F] text-white border-[#556B2F] scale-110"
//                             : currentStep > step
//                               ? "bg-[#D4AF37] text-white border-[#D4AF37]"
//                               : "bg-white border-neutral-200 text-neutral-400 group-hover:border-[#D4AF37]/50"
//                           }`}
//                       >
//                         {currentStep > step ? (
//                           <FiCheck className="text-xl stroke-[3]" />
//                         ) : (
//                           step
//                         )}
//                       </div>
//                       <p
//                         className={`text-xs mt-3.5 font-bold tracking-widest uppercase transition-colors duration-300 ${currentStep === step
//                             ? "text-[#556B2F]"
//                             : "text-neutral-400 group-hover:text-neutral-600"
//                           }`}
//                       >
//                         {step === 1 && "Select Rooms"}
//                         {step === 2 && "Guest Details"}
//                         {step === 3 && "Confirm & Pay"}
//                       </p>
//                     </button>
//                   ))}

//                   {/* Progress line */}
//                   <div className="absolute top-7 left-8 right-8 h-[2px] bg-neutral-200 -z-10 flex">
//                     <div
//                       className="bg-gradient-to-r from-[#D4AF37] to-[#556B2F] h-full transition-all duration-700 ease-out rounded-full"
//                       style={{
//                         width:
//                           currentStep === 1
//                             ? "0%"
//                             : currentStep === 2
//                               ? "50%"
//                               : "100%",
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* STEP CONTENT */}
//             <div
//               ref={stepContentRef}
//               className="py-10 md:py-14 min-h-[520px]"
//             >
//               <div className="max-w-6xl mx-auto">
//                 {currentStep === 1 && (
//                   <Step1RoomSelection
//                     results={results}
//                     loading={loading}
//                     error={error}
//                     selectedItems={selectedItems}
//                     requiredRooms={searchData.rooms}
//                     onItemToggle={handleItemToggle}
//                     showToast={showToast}
//                     onProceed={nextStep}
//                     isSelectionComplete={isRoomSelectionComplete}
//                   />
//                 )}

//                 {currentStep === 2 && (
//                   <Step2GuestDetails
//                     selectedItems={selectedItems}
//                     searchDate={searchData}
//                     formData={formData}
//                     formErrors={formErrors}
//                     totalPriceSum={totalPriceSum}
//                     numberOfNights={numberOfNights}
//                     countries={countries}
//                     onFormChange={handleFormChange}
//                     onRemoveRoom={(roomId) => {
//                       setSelectedItems((prev) =>
//                         prev.filter((item) => item.RoomId !== roomId)
//                       );
//                       setCurrentStep(1);
//                       showToast("Room removed successfully.", "info");
//                     }}
//                     onEditRoom={() => {
//                       setCurrentStep(1);
//                       showToast("Edit your room selection.", "info");
//                     }}
//                   />
//                 )}

//                 {currentStep === 3 && (
//                   <Step3BookingSummary
//                     selectedItems={selectedItems}
//                     searchData={searchData}
//                     formData={formData}
//                     countries={countries}
//                     totalPriceSum={totalPriceSum}
//                     numberOfNights={numberOfNights}
//                   />
//                 )}
//               </div>
//             </div>

//             {/* NAVIGATION FOOTER */}
//             <div className="pt-6 md:pt-8 border-t border-neutral-100 flex justify-between items-center">
//               <button
//                 type="button"
//                 onClick={prevStep}
//                 disabled={currentStep === 1}
//                 className="flex items-center gap-2 px-6 py-2 md:py-3.5 rounded-xl border border-neutral-200 font-bold text-sm text-neutral-700 bg-white transition-all duration-200 hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
//               >
//                 <FiArrowLeft className="text-base" /> Previous
//               </button>

//               {currentStep < 3 ? (
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   className="inline-flex items-center text-sm font-bold text-[#D4AF37] hover:text-[#B3922E] transition-colors duration-300 group tracking-widest uppercase"
//                 >
//                   Next Step
//                   <span className="ml-2 group-hover:translate-x-1 transition-transform">
//                     →
//                   </span>
//                 </button>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={isSubmitting}
//                   className="inline-flex items-center text-sm font-bold text-[#D4AF37] hover:text-[#B3922E] transition-colors duration-300 group tracking-widest uppercase disabled:opacity-70 cursor-pointer"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       Processing{" "}
//                       <FiLoader className="animate-spin text-base ml-2" />
//                     </>
//                   ) : (
//                     <>
//                       Confirm Booking
//                       <span className="ml-2 group-hover:translate-x-1 transition-transform">
//                         →
//                       </span>
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* SUCCESS MODAL */}
//       {isBookingSuccess && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
//           <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-neutral-100 text-center">
//             <div className="mx-auto w-16 h-16 bg-[#556B2F] text-white rounded-full flex items-center justify-center mb-6">
//               <FiCheck className="text-4xl" />
//             </div>

//             <h2 className="text-2xl font-bold text-[#556B2F] mb-2">
//               Booking Confirmed!
//             </h2>
//             <p className="text-neutral-500 mb-6">
//               Your booking has been successfully submitted.
//             </p>

//             <div className="bg-neutral-50 rounded-2xl p-5 text-left space-y-4 mb-8">
//               <div className="flex justify-between text-sm">
//                 <span className="text-neutral-500">Booking Reference:</span>
//                 <span className="font-mono font-bold text-[#D4AF37]">
//                   {bookingReference}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-neutral-500">Guest Name:</span>
//                 <span className="font-medium text-neutral-800">
//                   {formData.firstName} {formData.lastName}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-neutral-500">Check-In Date:</span>
//                 <span className="text-neutral-800">{searchData.checkIn}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-neutral-500">Check-Out Date:</span>
//                 <span className="text-neutral-800">{searchData.checkOut}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-neutral-500">Duration & Rooms:</span>
//                 <span className="font-medium text-neutral-800">
//                   {numberOfNights} Night{numberOfNights > 1 ? "s" : ""} •{" "}
//                   {searchData.rooms} Room{searchData.rooms > 1 ? "s" : ""}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-neutral-500">Total Amount:</span>
//                 <span className="font-bold text-[#556B2F]">
//                   BDT {totalPriceSum.toLocaleString()}
//                 </span>
//               </div>
//             </div>

//             <div className="text-sm text-neutral-500 mb-6">
//               A confirmation email with all booking details has been sent to{" "}
//               <br />
//               <span className="font-medium text-neutral-800">
//                 {formData.email}
//               </span>
//             </div>

//             <button
//               onClick={() => {
//                 setIsBookingSuccess(false);
//                 setCurrentStep(1);
//                 setSelectedItems([]);
//               }}
//               className="w-full py-3.5 bg-[#556B2F] text-white font-bold rounded-2xl hover:bg-[#4a5e28] transition-all active:scale-[0.98]"
//             >
//               Done
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ================= TOAST ================= */}
//       {toast.visible && (
//         <div
//           className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3.5 z-[100] min-w-[340px] border transition-all duration-300 ${toast.type === "success"
//             ? "bg-[#556B2F] border-[#556B2F] text-white"
//             : toast.type === "error"
//               ? "bg-red-900/95 border-red-700 text-white"
//               : "bg-white border-neutral-200 text-neutral-800"
//             }`}
//         >
//           {toast.type === "error" && (
//             <FiAlertCircle className="text-xl shrink-0 text-white" />
//           )}
//           {toast.type === "success" && (
//             <FiCheck className="text-xl shrink-0 bg-white/20 p-0.5 rounded-full" />
//           )}
//           <p className="font-semibold text-sm pr-6 leading-relaxed">
//             {toast.message}
//           </p>
//           <button
//             onClick={() => setToast({ message: "", visible: false })}
//             className="ml-auto rounded-full w-6 h-6 flex items-center justify-center text-xs bg-white/10 hover:bg-white/20 transition-colors"
//           >
//             ✕
//           </button>
//         </div>
//       )}
//       {/* FIXED SELECTED ROOMS BAR */}

//       {/* ================= FIXED SELECTED ROOMS BAR (RIGHT SIDEBAR) ================= */}
//       {currentStep === 1 && selectedItems.length > 0 && (
//         <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[90] hidden xl:flex flex-col w-[280px] max-h-[80vh] bg-white rounded-3xl border border-neutral-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden">

//           {/* ============ HEADER ============ */}
//           <div className="px-5 py-4 border-b border-neutral-100 bg-[#f5f5f0]">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="h-[1px] w-6 bg-[#556B2F]" />
//               <h3 className="text-sm font-bold text-[#556B2F] uppercase tracking-widest">
//                 Your Selection
//               </h3>
//               <span className="h-[1px] w-6 bg-[#556B2F]" />
//             </div>
//             <p className="text-[11px] text-neutral-500 font-medium">
//               {selectedItems.length} of {searchData.rooms} room
//               {searchData.rooms > 1 ? "s" : ""} selected
//             </p>
//           </div>

//           {/* ============ SCROLLABLE LIST ============ */}
//           <style jsx>{`
//           .premium-scrollbar::-webkit-scrollbar {
//             width: 6px;
//           }
//           .premium-scrollbar::-webkit-scrollbar-track {
//             background: #f5f5f0;
//             border-radius: 99px;
//             margin: 12px 0;
//           }
//           .premium-scrollbar::-webkit-scrollbar-thumb {
//             background: linear-gradient(180deg, #d4af37, #556b2f);
//             border-radius: 99px;
//             border: 1px solid #f5f5f0;
//           }
//           .premium-scrollbar::-webkit-scrollbar-thumb:hover {
//             background: linear-gradient(180deg, #b3922e, #4a5e28);
//           }
//           .premium-scrollbar {
//             scrollbar-width: thin;
//             scrollbar-color: #d4af37 #f5f5f0;
//           }
//         `}</style>
//           <div className="flex-1 max-h-[202px] overflow-y-auto px-4 py-4 space-y-3 premium-scrollbar">
//             {selectedItems.map((room, idx) => (
//               <div
//                 key={room.RoomId || idx}
//                 className="group relative bg-[#f5f5f0] border border-neutral-100 hover:border-[#D4AF37]/50 rounded-2xl p-3 transition-all duration-200"
//               >
//                 {/* Remove Button (Top Right) */}
//                 <button
//                   type="button"
//                   onClick={() => handleItemToggle(room)}
//                   title="Remove room"
//                   aria-label={`Remove ${room.RoomName || "room"}`}
//                   className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white text-neutral-400 hover:bg-red-500 hover:text-white border border-neutral-200 hover:border-red-500 transition-all duration-200 active:scale-90 cursor-pointer z-10"
//                 >
//                   <span className="text-[10px] font-bold leading-none">✕</span>
//                 </button>

//                 {/* Room Content */}
//                 <div className="flex gap-3 pr-7">
//                   {/* Thumb */}
//                   <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100 shrink-0">
//                     <img
//                       src={room.RoomImage || "/images/imperiallogo.png"}
//                       alt={room.RoomName || "Room"}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>

//                   {/* Info */}
//                   <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
//                     <p className="font-bold text-xs text-neutral-800 truncate tracking-wide">
//                       {room.RoomName || room.roomName || `Room ${room.RoomNumber}`}
//                     </p>
//                     <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-semibold mt-0.5">
//                       Slot #{idx + 1}
//                     </p>
//                     <p className="text-[11px] text-[#556B2F] font-bold mt-1">
//                       BDT {(room.PricePerNight || 3500).toLocaleString()}
//                       <span className="text-[9px] text-neutral-500 font-normal lowercase">
//                         {" "}
//                         / night
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Footer: Price + Button */}
//           <div className="px-5 py-4 border-t border-neutral-100 bg-white space-y-3">
//             {/* Price */}
//             <div className="flex items-end justify-between">
//               <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
//                 Total
//               </span>
//               <div className="text-right">
//                 <p className="text-xl font-black text-[#556B2F] tracking-tight">
//                   BDT {totalPriceSum.toLocaleString()}
//                 </p>
//                 <p className="text-[10px] text-neutral-500">
//                   {numberOfNights} night{numberOfNights > 1 ? "s" : ""} ×{" "}
//                   {selectedItems.length} room
//                   {selectedItems.length > 1 ? "s" : ""}
//                 </p>
//               </div>
//             </div>

//             {/* Checkout Button */}
//             <button
//               type="button"
//               onClick={nextStep}
//               disabled={selectedItems.length !== searchData.rooms}
//               className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${selectedItems.length === searchData.rooms
//                 ? "bg-gradient-to-r from-[#D4AF37] to-[#B3922E] text-white shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
//                 : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
//                 }`}
//             >
//               GO TO CHECKOUT
//               <span className="text-base">›</span>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* MOBILE FALLBACK (BOTTOM BAR for small screens) */}
//       {currentStep === 1 && selectedItems.length > 0 && (
//         <div className="fixed bottom-0 left-0 right-0 z-[90] xl:hidden bg-white border-t border-neutral-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
//               {/* LEFT: Selected Rooms Chips */}
//               <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto overflow-x-auto">
//                 <div className="flex items-center -space-x-3 shrink-0">
//                   {selectedItems.slice(0, 3).map((room, idx) => (
//                     <div
//                       key={room.RoomId || idx}
//                       className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-neutral-100"
//                       style={{ zIndex: 10 - idx }}
//                     >
//                       <img
//                         src={room.RoomImage || "/images/imperiallogo.png"}
//                         alt={room.RoomName || "Room"}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   ))}
//                   {selectedItems.length > 3 && (
//                     <div
//                       className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#556B2F] flex items-center justify-center text-white text-xs font-bold"
//                       style={{ zIndex: 0 }}
//                     >
//                       +{selectedItems.length - 3}
//                     </div>
//                   )}
//                 </div>

//                 <div className="h-10 w-[1px] bg-neutral-200 shrink-0 hidden sm:block" />

//                 <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 py-1">
//                   {selectedItems.map((room, idx) => (
//                     <div
//                       key={room.RoomId || idx}
//                       className="group flex items-center gap-2 bg-[#f5f5f0] border border-neutral-100 hover:border-[#D4AF37]/50 rounded-full pl-1 pr-2 py-1 shrink-0 transition-all duration-200"
//                     >
//                       <div className="relative w-7 h-7 rounded-full overflow-hidden bg-neutral-100 border border-neutral-100 shrink-0">
//                         <img
//                           src={room.RoomImage || "/images/imperiallogo.png"}
//                           alt={room.RoomName || "Room"}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                       <span className="text-[11px] font-bold text-neutral-800 whitespace-nowrap max-w-[110px] truncate">
//                         {room.RoomName || room.roomName || `Room ${room.RoomNumber}`}
//                       </span>
//                       <button
//                         type="button"
//                         onClick={() => handleItemToggle(room)}
//                         title="Remove room"
//                         className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-neutral-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 active:scale-90 cursor-pointer"
//                       >
//                         <IoCloseSharp />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Price + Checkout */}
//               <div className="flex items-center gap-5 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end shrink-0">
//                 <div className="text-right">
//                   <p className="text-lg sm:text-xl font-bold text-[#556B2F]">
//                     BDT {totalPriceSum.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-neutral-500">
//                     {numberOfNights} night{numberOfNights > 1 ? "s" : ""} <IoCloseOutline /> {" "}
//                     {selectedItems.length} room
//                     {selectedItems.length > 1 ? "s" : ""}
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   disabled={selectedItems.length !== searchData.rooms}
//                   className={`shrink-0 px-6 sm:px-8 py-3.5 rounded-md font-bold text-sm uppercase tracking-wide transition-all duration-200 flex items-center gap-2 ${selectedItems.length === searchData.rooms
//                     ? "bg-[#D4AF37] hover:bg-[#B3922E] text-white shadow-md hover:shadow-lg active:scale-[0.98]"
//                     : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
//                     }`}
//                 >
//                   GO TO CHECKOUT
//                   <span className="text-lg"><RiArrowDropRightLine /></span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* AUTH MODALS */}
//       <LoginModal
//         isOpen={showLogin}
//         onClose={() => setShowLogin(false)}
//         onSwitchToRegister={() => {
//           setShowLogin(false);
//           setShowRegister(true);
//         }}
//         onSuccess={() => {
//           setShowLogin(false);
//           setCurrentStep(3);
//         }}
//       />

//       <RegisterModal
//         isOpen={showRegister}
//         onClose={() => setShowRegister(false)}
//         onSwitchToLogin={() => {
//           setShowRegister(false);
//           setShowLogin(true);
//         }}
//       />
//     </>
//   );
// };

// export default BookingStepper;



{/* ================= FIXED SELECTED ROOMS BAR ================= */ }
// {currentStep === 1 && selectedItems.length > 0 && (
//   <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-neutral-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="flex flex-col sm:flex-row items-center gap-4 py-4">

//         {/* ============ LEFT: SELECTED ROOMS LIST ============ */}
//         <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto overflow-x-auto">

//           {/* Thumbnail Stack */}
//           <div className="flex items-center -space-x-3 shrink-0">
//             {selectedItems.slice(0, 3).map((room, idx) => (
//               <div
//                 key={room.RoomId || idx}
//                 className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-neutral-100"
//                 style={{ zIndex: 10 - idx }}
//               >
//                 <img
//                   src={room.RoomImage || "/images/imperiallogo.png"}
//                   alt={room.RoomName || "Room"}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             ))}
//             {selectedItems.length > 3 && (
//               <div
//                 className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#556B2F] flex items-center justify-center text-white text-xs font-bold"
//                 style={{ zIndex: 0 }}
//               >
//                 +{selectedItems.length - 3}
//               </div>
//             )}
//           </div>

//           {/* Divider */}
//           <div className="h-10 w-[1px] bg-neutral-200 shrink-0 hidden sm:block" />

//           {/* Selected Rooms Chips */}
//           <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 py-1">
//             {selectedItems.map((room, idx) => (
//               <div
//                 key={room.RoomId || idx}
//                 className="group flex items-center gap-2 bg-[#f5f5f0] border border-neutral-100 hover:border-[#D4AF37]/50 rounded-full pl-1 pr-2 py-1 shrink-0 transition-all duration-200"
//               >
//                 {/* Mini Thumb */}
//                 <div className="relative w-7 h-7 rounded-full overflow-hidden bg-neutral-100 border border-neutral-100 shrink-0">
//                   <img
//                     src={room.RoomImage || "/images/imperiallogo.png"}
//                     alt={room.RoomName || "Room"}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>

//                 {/* Room Name */}
//                 <span className="text-[11px] font-bold text-neutral-800 whitespace-nowrap max-w-[110px] truncate">
//                   {room.RoomName || room.roomName || `Room ${room.RoomNumber}`}
//                 </span>

//                 {/* Remove Button */}
//                 <button
//                   type="button"
//                   onClick={() => handleItemToggle(room)}
//                   title="Remove room"
//                   aria-label={`Remove ${room.RoomName || "room"}`}
//                   className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-neutral-400 hover:bg-red-500 hover:text-white border border-neutral-200 hover:border-red-500 transition-all duration-200 active:scale-90 cursor-pointer shrink-0"
//                 >
//                   <span className="text-[10px] font-bold leading-none">✕</span>
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ============ RIGHT: PRICE + CHECKOUT ============ */}
//         <div className="flex items-center gap-5 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end shrink-0">
//           {/* Price */}
//           <div className="text-right">
//             <p className="text-lg sm:text-xl font-bold text-[#556B2F]">
//               BDT {totalPriceSum.toLocaleString()}
//             </p>
//             <p className="text-xs text-neutral-500">
//               {numberOfNights} night{numberOfNights > 1 ? "s" : ""} ×{" "}
//               {selectedItems.length} room
//               {selectedItems.length > 1 ? "s" : ""}
//             </p>
//             <p className="text-[11px] text-neutral-400 mt-0.5">
//               Taxes & fees may apply
//             </p>
//           </div>

//           {/* Checkout Button */}
//           <button
//             type="button"
//             onClick={nextStep}
//             disabled={selectedItems.length !== searchData.rooms}
//             className={`shrink-0 px-6 sm:px-8 py-3.5 rounded-md font-bold text-sm uppercase tracking-wide transition-all duration-200 flex items-center gap-2 ${selectedItems.length === searchData.rooms
//                 ? "bg-[#D4AF37] hover:bg-[#B3922E] text-white shadow-md hover:shadow-lg active:scale-[0.98]"
//                 : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
//               }`}
//           >
//             GO TO CHECKOUT
//             <span className="text-lg">›</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}


// {currentStep === 1 && selectedItems.length > 0 && (
//         <div
//           className="
//       fixed z-[90]
//       /* Mobile: bottom full-width bar */
//       bottom-0 left-0 right-0
//       /* sm+: floating card bottom-right */
//       sm:bottom-6 sm:left-auto sm:right-6 sm:w-[300px] sm:max-w-[calc(100vw-2rem)]
//       /* lg+: top-right like before */
//       lg:top-36 lg:bottom-auto
//     "
//         >
//           <div
//             className="
//         bg-card border border-border
//         shadow-[0_20px_50px_rgba(0,0,0,0.4)]
//         overflow-hidden backdrop-blur-md
//         /* Mobile: rounded top only */
//         rounded-t-2xl
//         sm:rounded-2xl
//         /* Safe area for iPhone home indicator */
//         pb-[env(safe-area-inset-bottom)]
//       "
//           >
//             {/* Header */}
//             <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border flex items-center justify-between bg-background/80">
//               <div className="flex items-center gap-2 min-w-0">
//                 <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary truncate">
//                   Selected Rooms
//                 </span>
//                 <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold shrink-0">
//                   {selectedItems.length}/{searchData.rooms}
//                 </span>
//               </div>
//               {selectedItems.length === searchData.rooms && (
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   className="text-[10px] font-bold uppercase tracking-wider bg-primary text-background px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0 ml-2"
//                 >
//                   Next →
//                 </button>
//               )}
//             </div>

//             {/* Room list — horizontal scroll on mobile, vertical on larger */}
//             <div
//               className="
//           p-2.5 sm:p-3
//           flex sm:flex-col gap-2.5
//           overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto
//           max-h-none sm:max-h-[340px]
//           snap-x sm:snap-none
//         "
//             >
//               {selectedItems.map((room, idx) => (
//                 <div
//                   key={room.RoomId}
//                   className="
//               relative flex gap-2.5 sm:gap-3
//               rounded-xl overflow-hidden border border-border bg-background/60
//               /* Mobile: fixed card width for horizontal scroll */
//               min-w-[220px] sm:min-w-0 w-[220px] sm:w-auto
//               shrink-0 sm:shrink
//               snap-start
//             "
//                 >
//                   {/* Thumbnail */}
//                   <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
//                     <img
//                       src={room.RoomImage || "/images/imperiallogo.png"}
//                       alt={room.RoomName || "Room"}
//                       className="w-full h-full object-cover"
//                     />
//                     <span className="absolute top-1 left-1 bg-primary text-background text-[9px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
//                       {idx + 1}
//                     </span>
//                   </div>

//                   {/* Info */}
//                   <div className="flex-1 min-w-0 py-1.5 sm:py-2 pr-7 sm:pr-8 flex flex-col justify-center">
//                     <p className="text-[11px] sm:text-xs font-bold text-foreground truncate leading-tight">
//                       {room.RoomName || `Room ${room.RoomNumber}`}
//                     </p>
//                     <p className="text-[10px] text-primary font-semibold mt-0.5">
//                       BDT {(room.PricePerNight || 3500).toLocaleString()} / night
//                     </p>
//                   </div>

//                   {/* Remove button */}
//                   <button
//                     type="button"
//                     onClick={() => handleItemToggle(room)}
//                     className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-sm"
//                     title="Remove room"
//                     aria-label="Remove room"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="w-3.5 h-3.5"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={2.5}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M6 18L18 6M6 6l12 12"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}