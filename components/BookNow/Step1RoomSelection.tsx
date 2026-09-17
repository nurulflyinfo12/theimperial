"use client";

import React, { useState, useEffect } from "react";
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

const Step1RoomSelection: React.FC<Step1Props> = ({
  results,
  loading,
  error,
  selectedItems,
  requiredRooms,
  onItemToggle,
  showToast,
  onProceed,
  isSelectionComplete = false
}) => {
  const [activeModalRoom, setActiveModalRoom] = useState<any | null>(null);
  const { application } = useApplication();

  useEffect(() => {
    if (activeModalRoom) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [activeModalRoom]);

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
            Required Configuration: Select exactly <strong className="text-foreground font-bold">{requiredRooms} room(s)</strong> to continue.
          </span>
        </div>
        <div className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-xl text-xs font-bold shrink-0 shadow-sm">
          <FiLayers className="text-primary" />
          <span className="text-primary">{selectedItems.length}</span> / <span>{requiredRooms} Selected</span>
        </div>
      </div>

      {/* Loading, Error, Empty States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-text-muted gap-4 bg-card/40 rounded-3xl border border-border/55">
          <FiLoader className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium tracking-wide">Searching for premium available spaces...</p>
        </div>
      )}

      {error && <p className="text-center text-accent bg-red-950/20 py-4 px-6 rounded-2xl border border-border font-medium">{error}</p>}

      {!loading && results.length === 0 && !error && (
        <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl bg-card/20 backdrop-blur-sm">
          <p className="text-text-muted font-medium max-w-sm mx-auto text-sm leading-relaxed">
            Please enter your preferred dates above to view exclusively curated luxury properties.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          {results.map((room: any) => {
            const isSelected = selectedItems.some((item) => item.RoomId === room.RoomId);
            const matchIndex = selectedItems.findIndex((item) => item.RoomId === room.RoomId);

            return (
              <div 
                key={room.RoomId || room.id} 
                className={`bg-card transition-all duration-300 flex flex-col justify-between border rounded-2xl overflow-hidden group shadow-lg ${isSelected ? "border-primary ring-2 ring-primary/20 shadow-[0_15px_40px_-10px_rgba(212,175,55,0.15)]" : "border-border hover:border-accent/60"}`}
              >
                {/* Image + Body */}
                <div>
                  <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-background">
                    <Image 
                      src={room.RoomImage || "/images/imperiallogo.png"} 
                      alt={room.RoomName || "Hotel Room"} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-md text-foreground font-semibold text-sm px-4 py-2 rounded-xl border border-border/80 tracking-wide">
                      <span className="text-primary font-bold">BDT {(room.PricePerNight || 3500).toLocaleString()}</span>{" "}
                      <span className="text-[10px] text-text-muted font-normal lowercase">/ night</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-secondary text-foreground text-[10px] font-bold px-3.5 py-1.5 rounded-lg shadow-md uppercase tracking-widest border border-border/40 animate-pulse">
                        Selected (Slot #{matchIndex + 1})
                      </div>
                    )}
                  </div>

                  <div className="p-5 md:p-6 lg:p-8">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h4 className="text-lg md:text-xl font-bold text-foreground tracking-wide truncate group-hover:text-primary transition-colors">
                        {room.RoomName || room.roomName || `Room ${room.RoomNumber}`}
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setActiveModalRoom(room)} 
                        className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors shrink-0 bg-background border border-border px-3 py-1.5 rounded-lg whitespace-nowrap"
                      >
                        <FiEye className="text-sm" /> View
                      </button>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-6 min-h-[44px]">
                      {room.description || "Indulge in absolute luxury and spacious design constructed explicitly for deep relaxation."}
                    </p>

                    <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4 text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                      <div className="flex items-center gap-2.5">
                        <MdOutlineAirlineSeatIndividualSuite className="text-base text-primary" />
                        <span>Max {room.MaxOccupancy || 2} Guests</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MdAcUnit className={`text-base ${room.IsAC ? "text-accent" : "text-text-muted/40"}`} />
                        <span>{room.IsAC ? "Air Conditioning" : "Standard Air"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons - Responsive */}
                <div className="p-5 md:p-6 lg:p-8 pt-0 mt-auto">
                  {isSelected ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <button
                        type="button"
                        onClick={() => onItemToggle(room)}
                        className="py-4 font-bold text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.98] rounded-xl border border-secondary bg-secondary text-foreground hover:bg-secondary/90"
                      >
                        Remove Selection
                      </button>

                      <button
                        type="button"
                        onClick={onProceed}
                        disabled={selectedItems.length !== requiredRooms}
                        className={`py-4 font-bold text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.98] rounded-xl border flex items-center justify-center gap-2 ${
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

      {/* Luxury Pop-up Details Modal */}
      {activeModalRoom && (
        <div
          id="modal-backdrop"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "modal-backdrop") {
              setActiveModalRoom(null);
            }
          }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in"
        >
          <div className="bg-card text-foreground rounded-3xl border border-border shadow-[0_25px_70px_rgba(0,0,0,0.5)] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Hero */}
            <div className="relative h-56 sm:h-64 w-full bg-background shrink-0">
              <Image
                src={activeModalRoom.RoomImage || activeModalRoom.coverImage || application?.Logo}
                alt={activeModalRoom.RoomName || "Accommodation Detail"}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

              <button
                type="button"
                onClick={() => setActiveModalRoom(null)}
                className="absolute top-4 right-4 bg-background/80 text-foreground border border-border hover:text-primary transition-colors rounded-full w-9 h-9 flex items-center justify-center backdrop-blur-sm shadow-md"
              >
                <FiX className="text-lg" />
              </button>

              <div className="absolute bottom-4 left-6">
                <span className="bg-primary/90 text-background text-[10px] uppercase font-extrabold px-3 py-1 rounded-md tracking-wider border border-primary/20">
                  Premium Suite #{activeModalRoom.RoomNumber || "N/A"}
                </span>
                <h4 className="text-xl sm:text-2xl font-bold mt-1.5 drop-shadow-md">
                  {activeModalRoom.RoomName || `Room Spec ${activeModalRoom.RoomNumber}`}
                </h4>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-8 overflow-y-auto space-y-6 flex-1">
              {/* ... your existing modal content (unchanged) ... */}
              <div>
                <h5 className="text-xs uppercase text-primary font-bold tracking-widest mb-2">Description Overview</h5>
                <p className="text-sm text-text-muted leading-relaxed font-light">
                  {activeModalRoom.description || "Experience top-tier hospitality inside this meticulously prepared space..."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-border/50 py-4">
                <div className="bg-background/50 border border-border/65 p-3 rounded-xl flex items-center gap-3">
                  <MdOutlineAirlineSeatIndividualSuite className="text-2xl text-primary" />
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-bold">Occupancy Limit</p>
                    <p className="text-sm font-bold text-foreground">{activeModalRoom.MaxOccupancy || 2} Expected Guests</p>
                  </div>
                </div>

                <div className="bg-background/50 border border-border/65 p-3 rounded-xl flex items-center gap-3">
                  <MdAcUnit className={`text-2xl ${activeModalRoom.IsAC ? "text-accent" : "text-text-muted/40"}`} />
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-bold">Atmosphere Control</p>
                    <p className="text-sm font-bold text-foreground">{activeModalRoom.IsAC ? "Full Climate AC" : "Standard Climate Control"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs uppercase text-primary font-bold tracking-widest mb-3">Premium Features</h5>
                <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
                  <div className="flex items-center gap-2"><FiAward className="text-accent shrink-0" /> High-speed Wireless Internet</div>
                  <div className="flex items-center gap-2"><FiAward className="text-accent shrink-0" /> 24/7 Butler Support Access</div>
                  <div className="flex items-center gap-2"><FiAward className="text-accent shrink-0" /> Luxury Bathing Amenities</div>
                  <div className="flex items-center gap-2"><FiAward className="text-accent shrink-0" /> Flat-screen Digital Media System</div>
                </div>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="p-5 md:p-6 border-t border-border bg-background/50 flex items-center justify-between gap-4 shrink-0">
              {selectedItems.some(item => item.RoomId === activeModalRoom.RoomId) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      onItemToggle(activeModalRoom);
                      setActiveModalRoom(null);
                    }}
                    className="py-4 font-bold text-xs uppercase tracking-widest transition-all rounded-xl border border-secondary bg-secondary text-foreground hover:bg-secondary/90"
                  >
                    Remove Selection
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onProceed) onProceed();
                      setActiveModalRoom(null);
                    }}
                    disabled={selectedItems.length !== requiredRooms}
                    className={`py-4 font-bold text-xs uppercase tracking-widest transition-all rounded-xl border flex items-center justify-center gap-2 ${
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
                  onClick={() => {
                    onItemToggle(activeModalRoom);
                    setActiveModalRoom(null);
                  }}
                  className="w-full py-4 font-bold text-sm uppercase tracking-widest bg-primary text-background rounded-xl hover:bg-primary-dark transition-all"
                >
                  Select This Room
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1RoomSelection;