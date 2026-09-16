"use client";

import React, { useState, useRef } from "react";
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
import LoginModal from "@/auth/LoginModal";
import RegisterModal from "@/auth/RegisterModal";

const BookingStepper = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const stepContentRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
    type?: "success" | "error" | "info";
  }>({ message: "", visible: false, type: "info" });

  const { results, loading, error, searchRooms } = useSearchRooms();
  const { createConfirmRoom } = useRooms();
  const { application } = useApplication();

  // Auth
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [searchData, setSearchData] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    adults: "1",
    children: "0",
    rooms: 1,
    childrenAges: [] as number[],
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    // ===== If not logged in → open Login Modal =====
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    console.log("submited room", selectedItems);
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
      Address: "",
      CountryId: "",
      CountryName: "",
      DivisionId: "",
      DistrictId: "",
      UpazilaId: "",
      IsPrimary: true,
      Nationality: "",
      PassportOrID: "",
      UserId: "",
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
      UserId: "",
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
        UserId: "",
        RejectedAt: new Date(0).toISOString(),
        ApprovedAt: new Date(0).toISOString(),
        RequestGuest: guestData,
        BookingRequestRooms: roomData,
      },
      BookingRequestGuest: guestData,
      BookingRequestRooms: roomData,
    };

    console.log("Final Booking Payload:", finalPayload);

    try {
      await createConfirmRoom(finalPayload);
      console.log("Successfully booking:", finalPayload);
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

  return (
    <>
      <PageHero
        title="Book Now"
        backgroundImage="/images/viproom/viproom.webp"
      />

      <BookingSearch
        searchData={searchData}
        handleSearchChange={handleSearchChange}
        onSearchClick={handleSearchSubmit}
        onGuestChange={handleGuestChange}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 relative z-20 font-biryani">
        <div className="bg-card text-foreground rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-border overflow-hidden">
          {/* Progress Bar Header */}
          <div className="bg-background text-foreground pt-10 pb-8 px-8 lg:px-12 border-b border-border">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-primary">
                Complete Your Booking
              </h2>
              <p className="text-sm text-text-muted mt-1">
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
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all duration-300 shadow-md ${currentStep === step
                          ? "bg-primary text-background border-primary scale-110 ring-4 ring-primary/20"
                          : currentStep > step
                            ? "bg-secondary border-secondary text-foreground group-hover:opacity-80"
                            : "bg-card border-border text-text-muted backdrop-blur-sm group-hover:border-primary/40"
                        }`}
                    >
                      {currentStep > step ? (
                        <FiCheck className="text-lg stroke-[3]" />
                      ) : (
                        step
                      )}
                    </div>
                    <p
                      className={`text-xs mt-3 font-semibold tracking-wide uppercase transition-colors duration-200 ${currentStep === step
                          ? "text-primary"
                          : "text-text-muted group-hover:text-foreground"
                        }`}
                    >
                      {step === 1 && "Select Rooms"}
                      {step === 2 && "Guest Details"}
                      {step === 3 && "Confirm & Pay"}
                    </p>
                  </button>
                ))}

                <div className="absolute top-6 left-6 right-6 h-[2px] bg-border -z-10 flex">
                  <div
                    className="bg-secondary h-full transition-all duration-500 ease-out"
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

          {/* Step Content */}
          <div
            ref={stepContentRef}
            className="p-6 md:p-14 min-h-[520px] bg-background/40"
          >
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
                  onFormChange={handleFormChange}
                />
              )}

              {currentStep === 3 && (
                <Step3BookingSummary
                  selectedItems={selectedItems}
                  searchData={searchData}
                  formData={formData}
                  totalPriceSum={totalPriceSum}
                  numberOfNights={numberOfNights}
                />
              )}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-border p-6 md:p-8 flex justify-between bg-card items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-2 md:py-3.5 rounded-xl border border-border font-bold text-sm text-foreground bg-background transition-all duration-200 hover:bg-background/80 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <FiArrowLeft className="text-base" /> Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-primary text-background px-6 py-2 md:px-8 md:py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] shadow-sm cursor-pointer"
              >
                Next Step <FiArrowRight className="text-base" />
              </button>
            ) : currentStep === 3 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-secondary text-foreground px-6 py-2 md:px-10 md:py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-70 flex items-center gap-2 hover:bg-secondary/90 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    Processing <FiLoader className="animate-spin text-base" />
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {isBookingSuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
          <div className="bg-card rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-border text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
              <FiCheck className="text-4xl" />
            </div>

            <h2 className="text-2xl font-bold text-primary mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-text-muted mb-6">
              Your booking has been successfully submitted.
            </p>

            <div className="bg-background/70 rounded-2xl p-5 text-left space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Booking Reference:</span>
                <span className="font-mono font-bold text-primary">
                  {bookingReference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Guest Name:</span>
                <span className="font-medium">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Check-In Date:</span>
                <span>{searchData.checkIn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Check-Out Date:</span>
                <span>{searchData.checkOut}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Duration & Rooms:</span>
                <span className="font-medium">
                  {numberOfNights} Night{numberOfNights > 1 ? "s" : ""} •{" "}
                  {searchData.rooms} Room{searchData.rooms > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total Amount:</span>
                <span className="font-bold text-primary">
                  BDT {totalPriceSum.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-sm text-text-muted mb-6">
              A confirmation email with all booking details has been sent to{" "}
              <br />
              <span className="font-medium text-foreground">
                {formData.email}
              </span>
            </div>

            <button
              onClick={() => {
                setIsBookingSuccess(false);
                setCurrentStep(1);
                setSelectedItems([]);
              }}
              className="w-full py-3.5 bg-primary text-background font-bold rounded-2xl hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3.5 z-[100] min-w-[340px] text-foreground border transition-all duration-300 backdrop-blur-md ${toast.type === "success"
              ? "bg-secondary/95 border-secondary"
              : toast.type === "error"
                ? "bg-red-900/95 border-red-700"
                : "bg-card/95 border-border"
            }`}
        >
          {toast.type === "error" && (
            <FiAlertCircle className="text-xl shrink-0 text-accent" />
          )}
          {toast.type === "success" && (
            <FiCheck className="text-xl shrink-0 bg-foreground/20 p-0.5 rounded-full" />
          )}
          <p className="font-semibold text-sm pr-6 leading-relaxed">
            {toast.message}
          </p>
          <button
            onClick={() => setToast({ message: "", visible: false })}
            className="ml-auto text-text-muted hover:text-foreground bg-foreground/10 hover:bg-foreground/20 transition-colors rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Auth Modals */}
      {/* Auth Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        onSuccess={() => {
          // Login successful → stay on Confirm Booking step
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