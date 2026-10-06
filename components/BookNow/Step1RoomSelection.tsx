"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { FiLoader, FiInfo, FiLayers, FiX, FiAward, FiEye, FiArrowRight } from "react-icons/fi";
import { MdOutlineAirlineSeatIndividualSuite, MdAcUnit } from "react-icons/md";
import { useApplication } from "@/redux/hook/useApplicationDetails";

interface Step1Props {
  results: any[];
  loading: boolean;
  error: string | null;
  selectedItems: any[];
  requiredRooms: number;
  onItemToggle: (room: any) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  onProceed?: () => void;
  isSelectionComplete?: boolean;
}

interface OriginRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const Step1RoomSelection: React.FC<Step1Props> = ({
  results,
  loading,
  error,
  selectedItems,
  requiredRooms,
  onItemToggle,
  showToast,
  onProceed,
  isSelectionComplete = false,
}) => {
  const [activeModalRoom, setActiveModalRoom] = useState<any | null>(null);
  const [originRect, setOriginRect] = useState<OriginRect | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { application } = useApplication();

  // Targets for the expanded modal
  const [targetRect, setTargetRect] = useState<OriginRect>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const modalCardRef = useRef<HTMLDivElement | null>(null);

  // Compute the target centered rectangle for the modal
  const computeTargetRect = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = Math.min(672, vw - 32); // max-w-2xl ~ 672px
    const maxH = Math.min(vh * 0.9, 720);
    return {
      top: (vh - maxH) / 2,
      left: (vw - maxW) / 2,
      width: maxW,
      height: maxH,
    };
  }, []);

  // Open modal with origin = the View button's rect
  const openModal = (room: any, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOriginRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setTargetRect(computeTargetRect());
    setActiveModalRoom(room);
    setIsExpanded(false);
    setIsClosing(false);

    // Next frame -> expand
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsExpanded(true));
    });
  };

  // Close modal with reverse animation
  const closeModal = () => {
    setIsClosing(true);
    setIsExpanded(false);

    // Wait for the transition to finish, then unmount
    setTimeout(() => {
      setActiveModalRoom(null);
      setIsClosing(false);
      setOriginRect(null);
    }, 420); // match transition duration
  };

  // Recompute target on resize while open
  useEffect(() => {
    if (!activeModalRoom) return;
    const onResize = () => setTargetRect(computeTargetRect());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeModalRoom, computeTargetRect]);

  // Lock body scroll
  // useEffect(() => {
  //   if (activeModalRoom) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "";
  //   }
  //   return () => {
  //     document.body.style.overflow = "";
  //   };
  // }, [activeModalRoom]);
  

  // Escape key close
  useEffect(() => {
    if (!activeModalRoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeModalRoom]);

  // Animated style for the modal card (from button rect -> centered rect)
  const animatedCardStyle: React.CSSProperties =
    originRect && isExpanded
      ? {
          position: "fixed",
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
          borderRadius: 24,
          transition:
            "top 420ms cubic-bezier(0.22, 1, 0.36, 1), left 420ms cubic-bezier(0.22, 1, 0.36, 1), width 420ms cubic-bezier(0.22, 1, 0.36, 1), height 420ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 420ms ease, opacity 260ms ease",
          opacity: 1,
          overflow: "hidden",
          zIndex: 201,
        }
      : originRect
      ? {
          position: "fixed",
          top: originRect.top,
          left: originRect.left,
          width: originRect.width,
          height: originRect.height,
          borderRadius: 12,
          transition:
            "top 420ms cubic-bezier(0.4, 0, 0.2, 1), left 420ms cubic-bezier(0.4, 0, 0.2, 1), width 420ms cubic-bezier(0.4, 0, 0.2, 1), height 420ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 420ms ease, opacity 260ms ease",
          opacity: isClosing ? 0 : 1,
          overflow: "hidden",
          zIndex: 201,
        }
      : {};

  return (
    <div className="font-biryani">
      <h3 className="text-2xl md:text-3xl font-extrabold text-center mb-8 md:mb-10 text-primary tracking-wide uppercase">
        Available Accommodations
      </h3>

      {/* Progress Banner */}
      <div className="bg-card px-4 sm:px-6 py-4 mb-8 border border-border flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-foreground mt-8 md:mt-12 rounded-2xl shadow-inner">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-xl border border-border">
            <FiInfo className="text-primary text-base" />
          </div>
          <span className="text-text-muted text-xs md:text-sm">
            Required Configuration: Select exactly{" "}
            <strong className="text-foreground font-bold">
              {requiredRooms} room(s)
            </strong>{" "}
            to continue.
          </span>
        </div>
        <div className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-xl text-xs font-bold shrink-0 shadow-sm">
          <FiLayers className="text-primary" />
          <span className="text-primary">{selectedItems.length}</span> /{" "}
          <span>{requiredRooms} Selected</span>
        </div>
      </div>

      {/* Loading, Error, Empty States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-text-muted gap-4 bg-card/40 rounded-3xl border border-border/55">
          <FiLoader className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium tracking-wide">
            Searching for premium available spaces...
          </p>
        </div>
      )}

      {error && (
        <p className="text-center text-accent bg-red-950/20 py-4 px-6 rounded-2xl border border-border font-medium">
          {error}
        </p>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl bg-card/20 backdrop-blur-sm">
          <p className="text-text-muted font-medium max-w-sm mx-auto text-sm leading-relaxed">
            Please enter your preferred dates above to view exclusively curated
            luxury properties.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          {results.map((room: any) => {
            const isSelected = selectedItems.some(
              (item) => item.RoomId === room.RoomId
            );
            const matchIndex = selectedItems.findIndex(
              (item) => item.RoomId === room.RoomId
            );

            return (
              <div
                key={room.RoomId || room.id}
                className={`bg-card transition-all duration-300 flex flex-col justify-between border rounded-2xl overflow-hidden group shadow-lg ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-[0_15px_40px_-10px_rgba(212,175,55,0.15)]"
                    : "border-border hover:border-accent/60"
                }`}
              >
                <div>
                  <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-background cursor-pointer">
                    <Image
                      src={room.RoomImage || "/images/imperiallogo.png"}
                      alt={room.RoomName || "Hotel Room"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-3xl text-neutral-800 font-semibold text-sm px-4 py-2 rounded-xl shadow-sm">
                      <span className="text-[#bac7a3] font-bold">
                        BDT {(room.PricePerNight).toLocaleString()}
                      </span>{" "}
                      <span className="text-[10px] text-neutral-200 font-normal lowercase">
                        / night
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-10 bg-[#D4AF37] text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg shadow-md uppercase tracking-widest">
                        Selected (Slot #{matchIndex + 1})
                      </div>
                    )}
                  </div>

                  <div className="p-5 md:p-6 lg:p-8">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h4 className="text-lg md:text-xl font-bold text-foreground tracking-wide truncate group-hover:text-primary transition-colors">
                        {room.RoomName ||
                          room.roomName ||
                          `Room ${room.RoomNumber}`}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => openModal(room, e)}
                        className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors shrink-0 bg-background border border-border px-3 py-1.5 rounded-lg whitespace-nowrap"
                      >
                        <FiEye className="text-sm" /> View
                      </button>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-6 min-h-[44px]">
                      {room.description ||
                        "Indulge in absolute luxury and spacious design constructed explicitly for deep relaxation."}
                    </p>

                    <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4 text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                      <div className="flex items-center gap-2.5">
                        <MdOutlineAirlineSeatIndividualSuite className="text-base text-primary" />
                        <span>Max {room.MaxOccupancy || 2} Guests</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MdAcUnit
                          className={`text-base ${
                            room.IsAC ? "text-accent" : "text-text-muted/40"
                          }`}
                        />
                        <span>
                          {room.IsAC ? "Air Conditioning" : "Standard Air"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6 lg:p-8 pt-0 mt-auto">
                  {isSelected ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <button
                        type="button"
                        onClick={() => onItemToggle(room)}
                        className="py-4 font-bold text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.98] rounded-xl border border-secondary bg-secondary text-foreground hover:bg-secondary/90 cursor-pointer"
                      >
                        Remove Selection
                      </button>

                      <button
                        type="button"
                        onClick={onProceed}
                        disabled={selectedItems.length !== requiredRooms}
                        className={`py-4 font-bold text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.98] rounded-xl border flex items-center justify-center gap-2 cursor-pointer ${
                          selectedItems.length === requiredRooms
                            ? "bg-primary text-background border-primary hover:bg-primary-dark"
                            : "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                        }`}
                      >
                        Next Step
                        <FiArrowRight />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onItemToggle(room)}
                      className="w-full py-4 font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-200 active:scale-[0.99] rounded-xl border bg-background text-foreground border-border hover:bg-card hover:border-primary hover:text-primary shadow-sm cursor-pointer"
                    >
                      Book This Accommodation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= Modal with Genie / Shared-Element animation ================= */}
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
      {activeModalRoom && originRect && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm transition-opacity duration-[420ms] ease-out ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => {
              if ((e.target as HTMLElement).id === "modal-backdrop") {
                closeModal();
              }
            }}
            id="modal-backdrop"
          />

          {/* The morphing card itself */}
          <div
            ref={modalCardRef}
            style={animatedCardStyle}
            className="bg-white text-neutral-800 border border-neutral-100 shadow-2xl flex flex-col mt-16"
          >
            {/* We show inner content only once expanded to avoid layout jank */}
            <div
              className={`flex flex-col h-full w-full transition-opacity duration-300 ${
                isExpanded ? "opacity-100 delay-150" : "opacity-0"
              }`}
            >
              {/* ───────── Hero ───────── */}
              <div className="relative h-52 sm:h-64 w-full bg-neutral-100 shrink-0 overflow-hidden">
                <Image
                  src={
                    activeModalRoom.RoomImage ||
                    activeModalRoom.coverImage ||
                    "/images/imperiallogo.png"
                  }
                  alt={activeModalRoom.RoomName || "Accommodation Detail"}
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-contain object-center"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/imperiallogo.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-neutral-700 hover:text-[#D4AF37] hover:rotate-90 transition-all duration-300 rounded-full w-10 h-10 flex items-center justify-center shadow-lg backdrop-blur-sm"
                >
                  <FiX className="text-lg" />
                </button>

                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#556B2F] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">
                      Suite #{activeModalRoom.RoomNumber || "N/A"}
                    </span>
                    {activeModalRoom.IsAC && (
                      <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider border border-[#D4AF37]/30">
                        Climate Control
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-lg">
                    {activeModalRoom.RoomName ||
                      `Room Spec ${activeModalRoom.RoomNumber}`}
                  </h3>
                </div>
              </div>

              {/* ───────── Body (Scrollable) ───────── */}
              <div className="flex-1 min-h-0 premium-scrollbar overflow-y-auto overscroll-contain">
                <div className="p-5 sm:p-7 space-y-6">
                  <div>
                    <h5 className="text-[11px] uppercase text-[#556B2F] font-bold tracking-[0.15em] mb-2.5">
                      Description
                    </h5>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {activeModalRoom.description ||
                        "Experience top-tier hospitality inside this meticulously prepared space. Designed for comfort and elegance, every detail has been carefully considered for your stay."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#f8f8f4] border border-neutral-100 p-4 rounded-2xl flex items-center gap-3.5 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-[#556B2F]/10 flex items-center justify-center shrink-0">
                        <MdOutlineAirlineSeatIndividualSuite className="text-xl text-[#556B2F]" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-neutral-400 font-semibold tracking-wide">
                          Occupancy
                        </p>
                        <p className="text-sm font-bold text-neutral-800 mt-0.5">
                          {activeModalRoom.MaxOccupancy || 2} Guests
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#f8f8f4] border border-neutral-100 p-4 rounded-2xl flex items-center gap-3.5 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                        <MdAcUnit
                          className={`text-xl ${
                            activeModalRoom.IsAC
                              ? "text-[#D4AF37]"
                              : "text-neutral-300"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-neutral-400 font-semibold tracking-wide">
                          Climate
                        </p>
                        <p className="text-sm font-bold text-neutral-800 mt-0.5">
                          {activeModalRoom.IsAC ? "Full AC" : "Standard"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[11px] uppercase text-[#556B2F] font-bold tracking-[0.15em] mb-3.5">
                      Premium Amenities
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        "High-speed Wireless Internet",
                        "24/7 Butler Support Access",
                        "Luxury Bathing Amenities",
                        "Flat-screen Digital Media System",
                      ].map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2.5 text-sm text-neutral-600 bg-neutral-50/80 px-3.5 py-2.5 rounded-xl border border-neutral-100 transition-colors duration-200 hover:bg-[#f8f8f4] hover:border-[#D4AF37]/30"
                        >
                          <FiAward className="text-[#D4AF37] shrink-0 text-base" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ───────── Footer ───────── */}
              <div className="p-5 border-t border-neutral-100 bg-[#fafaf7] shrink-0">
                {selectedItems.some(
                  (item) => item.RoomId === activeModalRoom.RoomId
                ) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onItemToggle(activeModalRoom);
                        closeModal();
                      }}
                      className="py-3.5 font-semibold text-xs uppercase tracking-widest transition-all rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98]"
                    >
                      Remove Selection
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onProceed) onProceed();
                        closeModal();
                      }}
                      disabled={selectedItems.length !== requiredRooms}
                      className={`py-3.5 font-semibold text-xs uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] ${
                        selectedItems.length === requiredRooms
                          ? "bg-[#D4AF37] text-white hover:bg-[#B3922E] shadow-md shadow-[#D4AF37]/25"
                          : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      }`}
                    >
                      Next Step
                      <FiArrowRight className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onItemToggle(activeModalRoom);
                      closeModal();
                    }}
                    className="w-full py-4 font-semibold text-sm uppercase tracking-widest bg-[#556B2F] text-white rounded-xl hover:bg-[#4a5e28] transition-all shadow-lg shadow-[#556B2F]/20 active:scale-[0.98]"
                  >
                    Select This Room
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Step1RoomSelection;










// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import {
//   FiLoader,
//   FiInfo,
//   FiLayers,
//   FiX,
//   FiAward,
//   FiEye,
//   FiArrowRight,
//   FiCheck,
// } from "react-icons/fi";
// import { MdOutlineAirlineSeatIndividualSuite, MdAcUnit } from "react-icons/md";
// import { useApplication } from "@/redux/hook/useApplicationDetails";

// interface Step1Props {
//   results: any[];
//   loading: boolean;
//   error: string | null;
//   selectedItems: any[];
//   requiredRooms: number;
//   onItemToggle: (room: any) => void;
//   showToast: (msg: string, type?: "success" | "error" | "info") => void;
//   onProceed?: () => void;
//   isSelectionComplete?: boolean;
// }

// const Step1RoomSelection: React.FC<Step1Props> = ({
//   results,
//   loading,
//   error,
//   selectedItems,
//   requiredRooms,
//   onItemToggle,
//   showToast,
//   onProceed,
//   isSelectionComplete = false,
// }) => {
//   const [activeModalRoom, setActiveModalRoom] = useState<any | null>(null);
//   const { application } = useApplication();

//   useEffect(() => {
//     if (activeModalRoom) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [activeModalRoom]);

//   return (
//     <div className="font-biryani">
//       {/* Section Title — ImageCardSlider Style */}
//       <div className="flex items-center gap-3 mb-8 md:mb-10 justify-center">
//         <span className="h-[1px] w-10 sm:w-14 bg-[#556B2F]" />
//         <h3 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-secondary tracking-wide text-center">
//           Available Accommodations
//         </h3>
//         <span className="h-[1px] w-10 sm:w-14 bg-[#556B2F]" />
//       </div>

//       {/* Progress Banner */}
//       <div className="bg-white px-4 sm:px-6 py-4 mb-8 border border-neutral-100 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm rounded-2xl shadow-sm">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-[#f5f5f0] rounded-xl border border-neutral-100">
//             <FiInfo className="text-[#556B2F] text-base" />
//           </div>
//           <span className="text-neutral-500 text-xs md:text-sm">
//             Required Configuration: Select exactly{" "}
//             <strong className="text-neutral-800 font-bold">
//               {requiredRooms} room(s)
//             </strong>{" "}
//             to continue.
//           </span>
//         </div>
//         <div className="flex items-center gap-2 bg-[#f5f5f0] border border-neutral-100 px-4 py-2 rounded-xl text-xs font-bold shrink-0">
//           <FiLayers className="text-[#556B2F]" />
//           <span className="text-[#556B2F]">{selectedItems.length}</span> /{" "}
//           <span className="text-neutral-600">{requiredRooms} Selected</span>
//         </div>
//       </div>

//       {/* Loading State */}
//       {loading && (
//         <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-4 bg-white rounded-3xl border border-neutral-100 shadow-sm">
//           <FiLoader className="w-10 h-10 animate-spin text-[#556B2F]" />
//           <p className="text-sm font-medium tracking-wide">
//             Searching for premium available spaces...
//           </p>
//         </div>
//       )}

//       {/* Error State */}
//       {error && (
//         <p className="text-center text-red-700 bg-red-50 py-4 px-6 rounded-2xl border border-red-100 font-medium">
//           {error}
//         </p>
//       )}

//       {/* Empty State */}
//       {!loading && results.length === 0 && !error && (
//         <div className="text-center py-20 border border-dashed border-neutral-200 rounded-3xl bg-white">
//           <p className="text-neutral-500 font-medium max-w-sm mx-auto text-sm leading-relaxed">
//             Please enter your preferred dates above to view exclusively curated
//             luxury properties.
//           </p>
//         </div>
//       )}

//       {/* Room Grid */}
//       {!loading && results.length > 0 && (
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
//           {results.map((room: any) => {
//             const isSelected = selectedItems.some(
//               (item) => item.RoomId === room.RoomId
//             );
//             const matchIndex = selectedItems.findIndex(
//               (item) => item.RoomId === room.RoomId
//             );

//             return (
//               <div
//                 key={room.RoomId || room.id}
//                 className={`bg-white transition-all duration-300 flex flex-col justify-between rounded-3xl overflow-hidden group border ${
//                   isSelected
//                     ? "border-[#D4AF37] shadow-[0_15px_40px_-10px_rgba(212,175,55,0.25)]"
//                     : "border-neutral-100 hover:border-[#D4AF37]/50 shadow-md hover:shadow-xl"
//                 }`}
//               >
//                 {/* Image + Body */}
//                 <div>
//                   <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-neutral-50 cursor-pointer">
//   <Image
//     src={room.RoomImage || "/images/imperiallogo.png"}
//     alt={room.RoomName || "Hotel Room"}
//     fill
//     className="object-cover transition-transform duration-700 group-hover:scale-105"
//   />
//   <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

//   {/* Price Badge - Top Left */}
//   <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md text-neutral-800 font-semibold text-sm px-4 py-2 rounded-xl border border-neutral-100 shadow-sm">
//     <span className="text-[#556B2F] font-bold">
//       BDT {(room.PricePerNight || 3500).toLocaleString()}
//     </span>{" "}
//     <span className="text-[10px] text-neutral-400 font-normal lowercase">
//       / night
//     </span>
//   </div>

//   {/* Selected Badge - Top Right */}
//   {isSelected && (
//     <div className="absolute top-4 right-4 z-10 bg-[#D4AF37] text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg shadow-md uppercase tracking-widest">
//       Selected (Slot #{matchIndex + 1})
//     </div>
//   )}
// </div>

//                   <div className="p-5 md:p-6 lg:p-8">
//                     <div className="flex justify-between items-start gap-4 mb-3">
//                       <h4 className="text-lg md:text-xl font-bold text-neutral-800 tracking-wide truncate group-hover:text-[#556B2F] transition-colors">
//                         {room.RoomName ||
//                           room.roomName ||
//                           `Room ${room.RoomNumber}`}
//                       </h4>
//                       <button
//                         type="button"
//                         onClick={() => setActiveModalRoom(room)}
//                         className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:text-[#B3922E] transition-colors shrink-0 bg-white border border-neutral-100 px-3 py-1.5 rounded-lg whitespace-nowrap"
//                       >
//                         <FiEye className="text-sm" /> View
//                       </button>
//                     </div>

//                     <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-6 min-h-[44px]">
//                       {room.description ||
//                         "Indulge in absolute luxury and spacious design constructed explicitly for deep relaxation."}
//                     </p>

//                     <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
//                       <div className="flex items-center gap-2.5">
//                         <MdOutlineAirlineSeatIndividualSuite className="text-base text-[#556B2F]" />
//                         <span>Max {room.MaxOccupancy || 2} Guests</span>
//                       </div>
//                       <div className="flex items-center gap-2.5">
//                         <MdAcUnit
//                           className={`text-base ${
//                             room.IsAC ? "text-[#D4AF37]" : "text-neutral-300"
//                           }`}
//                         />
//                         <span>
//                           {room.IsAC ? "Air Conditioning" : "Standard Air"}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Footer Buttons */}
//                 <div className="p-5 md:p-6 lg:p-8 pt-0 mt-auto">
//                   {isSelected ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
//                       <button
//                         type="button"
//                         onClick={() => onItemToggle(room)}
//                         className="py-4 font-bold text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.98] rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 cursor-pointer"
//                       >
//                         Remove Selection
//                       </button>

//                       <button
//                         type="button"
//                         onClick={onProceed}
//                         disabled={selectedItems.length !== requiredRooms}
//                         className={`py-4 font-bold text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
//                           selectedItems.length === requiredRooms
//                             ? "bg-[#D4AF37] text-white hover:bg-[#B3922E] shadow-md"
//                             : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
//                         }`}
//                       >
//                         Next Step
//                         <FiArrowRight />
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => onItemToggle(room)}
//                       className="w-full py-4 font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-200 active:scale-[0.99] rounded-xl border bg-white text-neutral-700 border-neutral-200 hover:border-[#D4AF37] hover:text-[#D4AF37] shadow-sm cursor-pointer"
//                     >
//                       Book This Accommodation
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

  //     {/* Luxury Pop-up Details Modal */}
  //       {activeModalRoom && (
  // <div
  //   id="modal-backdrop"
  //   onClick={(e) => {
  //     if ((e.target as HTMLElement).id === "modal-backdrop") {
  //       setActiveModalRoom(null);
  //     }
  //   }}
  //   className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  // >
  //   <div className="bg-white text-neutral-800 rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden mt-24">
      
  //     {/* ───────── Hero (Fixed) ───────── */}
  //     <div className="relative h-52 sm:h-64 w-full bg-neutral-100 shrink-0 overflow-hidden">
  //       <Image
  //         src={
  //           activeModalRoom.RoomImage ||
  //           activeModalRoom.coverImage ||
  //           "/images/imperiallogo.png"
  //         }
  //         alt={activeModalRoom.RoomName || "Accommodation Detail"}
  //         fill
  //         sizes="(max-width: 768px) 100vw, 672px"
  //         className="object-contain object-center"
  //         priority
  //         onError={(e) => {
  //           const target = e.target as HTMLImageElement;
  //           target.src = "/images/imperiallogo.png";
  //         }}
  //       />

  //       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

  //       <button
  //         type="button"
  //         onClick={() => setActiveModalRoom(null)}
  //         className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-neutral-700 hover:text-[#D4AF37] transition-all rounded-full w-10 h-10 flex items-center justify-center shadow-lg backdrop-blur-sm"
  //       >
  //         <FiX className="text-lg" />
  //       </button>

  //       <div className="absolute top-4 left-4 z-10">
  //         <div className="flex items-center gap-2 mb-2">
  //           <span className="bg-[#556B2F] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">
  //             Suite #{activeModalRoom.RoomNumber || "N/A"}
  //           </span>
  //           {activeModalRoom.IsAC && (
  //             <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider border border-[#D4AF37]/30">
  //               Climate Control
  //             </span>
  //           )}
  //         </div>
  //         <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-lg">
  //           {activeModalRoom.RoomName ||
  //             `Room Spec ${activeModalRoom.RoomNumber}`}
  //         </h3>
  //       </div>
  //     </div>

  //     {/* ───────── Body (Scrollable) ───────── */}
  //     <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
  //       <div className="p-5 sm:p-7 space-y-6">
          
  //         {/* Description */}
  //         <div>
  //           <h5 className="text-[11px] uppercase text-[#556B2F] font-bold tracking-[0.15em] mb-2.5">
  //             Description
  //           </h5>
  //           <p className="text-sm text-neutral-600 leading-relaxed">
  //             {activeModalRoom.description ||
  //               "Experience top-tier hospitality inside this meticulously prepared space. Designed for comfort and elegance, every detail has been carefully considered for your stay."}
  //           </p>
  //         </div>

  //         {/* Key Specs */}
  //         <div className="grid grid-cols-2 gap-3">
  //           <div className="bg-[#f8f8f4] border border-neutral-100 p-4 rounded-2xl flex items-center gap-3.5">
  //             <div className="w-10 h-10 rounded-xl bg-[#556B2F]/10 flex items-center justify-center shrink-0">
  //               <MdOutlineAirlineSeatIndividualSuite className="text-xl text-[#556B2F]" />
  //             </div>
  //             <div>
  //               <p className="text-[10px] uppercase text-neutral-400 font-semibold tracking-wide">
  //                 Occupancy
  //               </p>
  //               <p className="text-sm font-bold text-neutral-800 mt-0.5">
  //                 {activeModalRoom.MaxOccupancy || 2} Guests
  //               </p>
  //             </div>
  //           </div>

  //           <div className="bg-[#f8f8f4] border border-neutral-100 p-4 rounded-2xl flex items-center gap-3.5">
  //             <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
  //               <MdAcUnit
  //                 className={`text-xl ${
  //                   activeModalRoom.IsAC
  //                     ? "text-[#D4AF37]"
  //                     : "text-neutral-300"
  //                 }`}
  //               />
  //             </div>
  //             <div>
  //               <p className="text-[10px] uppercase text-neutral-400 font-semibold tracking-wide">
  //                 Climate
  //               </p>
  //               <p className="text-sm font-bold text-neutral-800 mt-0.5">
  //                 {activeModalRoom.IsAC ? "Full AC" : "Standard"}
  //               </p>
  //             </div>
  //           </div>
  //         </div>

  //         {/* Premium Features */}
  //         <div>
  //           <h5 className="text-[11px] uppercase text-[#556B2F] font-bold tracking-[0.15em] mb-3.5">
  //             Premium Amenities
  //           </h5>
  //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
  //             {[
  //               "High-speed Wireless Internet",
  //               "24/7 Butler Support Access",
  //               "Luxury Bathing Amenities",
  //               "Flat-screen Digital Media System",
  //             ].map((feature) => (
  //               <div
  //                 key={feature}
  //                 className="flex items-center gap-2.5 text-sm text-neutral-600 bg-neutral-50/80 px-3.5 py-2.5 rounded-xl border border-neutral-100"
  //               >
  //                 <FiAward className="text-[#D4AF37] shrink-0 text-base" />
  //                 <span>{feature}</span>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     {/* ───────── Footer (Fixed) ───────── */}
  //     <div className="p-5 border-t border-neutral-100 bg-[#fafaf7] shrink-0">
  //       {selectedItems.some(
  //         (item) => item.RoomId === activeModalRoom.RoomId
  //       ) ? (
  //         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  //           <button
  //             type="button"
  //             onClick={() => {
  //               onItemToggle(activeModalRoom);
  //               setActiveModalRoom(null);
  //             }}
  //             className="py-3.5 font-semibold text-xs uppercase tracking-widest transition-all rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300"
  //           >
  //             Remove Selection
  //           </button>

  //           <button
  //             type="button"
  //             onClick={() => {
  //               if (onProceed) onProceed();
  //               setActiveModalRoom(null);
  //             }}
  //             disabled={selectedItems.length !== requiredRooms}
  //             className={`py-3.5 font-semibold text-xs uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 ${
  //               selectedItems.length === requiredRooms
  //                 ? "bg-[#D4AF37] text-white hover:bg-[#B3922E] shadow-md shadow-[#D4AF37]/25"
  //                 : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
  //             }`}
  //           >
  //             Next Step
  //             <FiArrowRight className="text-sm" />
  //           </button>
  //         </div>
  //       ) : (
  //         <button
  //           type="button"
  //           onClick={() => {
  //             onItemToggle(activeModalRoom);
  //             setActiveModalRoom(null);
  //           }}
  //           className="w-full py-4 font-semibold text-sm uppercase tracking-widest bg-[#556B2F] text-white rounded-xl hover:bg-[#4a5e28] transition-all shadow-lg shadow-[#556B2F]/20 active:scale-[0.98]"
  //         >
  //           Select This Room
  //         </button>
  //       )}
  //     </div>
  //   </div>
  // </div>
// )}
//     </div>
//   );
// };

// export default Step1RoomSelection;