"use client";

import React from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiBookmark,
  FiMapPin,
  FiGlobe,
  FiTrash2,
  FiEdit2,
} from "react-icons/fi";
import { MdOutlineAirlineSeatIndividualSuite, MdAcUnit } from "react-icons/md";

interface SearchDate {
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: string;
  children: string;
  childrenAges: number[];
}

interface Country {
  CountryCode?: string | number;
  CountryName?: string;
  Name?: string;
}

interface Step2Props {
  selectedItems: any[];
  searchDate: SearchDate;
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    message: string;
    countryId: string;
    address: string;
  };
  formErrors: Record<string, string>;
  totalPriceSum: number;
  numberOfNights: number;
  countries: Country[];  // ← new
  onFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onRemoveRoom?: (roomId: any) => void;
  onEditRoom?: (roomId: any) => void;
}

const Step2GuestDetails: React.FC<Step2Props> = ({
  selectedItems,
  searchDate,
  formData,
  formErrors,
  totalPriceSum,
  numberOfNights,
  countries,
  onFormChange,
  onRemoveRoom,
  onEditRoom,
}) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const onlyNumbers = value.replace(/\D/g, "");
    const limitedValue = onlyNumbers.slice(0, 11);

    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: limitedValue },
    } as React.ChangeEvent<HTMLInputElement>;

    onFormChange(syntheticEvent);
  };

  // helper so both CountryId and CountryID work
  const getCountryId = (c: Country) =>
    String(c.CountryCode ?? "");
  const getCountryName = (c: Country) =>
    c.CountryName ?? "";

  return (
    <div className="grid lg:grid-cols-5 gap-10 font-biryani">
      {/*  LEFT COLUMN (unchanged)  */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-xl font-bold text-primary tracking-wide uppercase flex items-center gap-2">
          <FiBookmark className="text-base shrink-0" /> Your Selection List
        </h3>
        <style jsx>{`
            .premium-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
                  
            .premium-scrollbar::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 99px;
              margin: 12px 0;
            }
                  
            .premium-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #d4af37, #556b2f);
              border-radius: 99px;
              border: 1.5px solid transparent;
              background-clip: padding-box;
            }
                  
            .premium-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #c9a227, #4a5e28);
            }
                  
            /* Force hide arrows */
            .premium-scrollbar::-webkit-scrollbar-button {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
              background: transparent !important;
            }
                  
            .premium-scrollbar::-webkit-scrollbar-button:start:decrement,
            .premium-scrollbar::-webkit-scrollbar-button:end:increment {
              display: none !important;
            }
                  
            .premium-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #d4af37 transparent;
            }
          `}</style>

        <div className="bg-card rounded-2xl p-5 border border-border space-y-4 max-h-[520px] premium-scrollbar overflow-y-auto shadow-inner">
          {selectedItems.map((room, idx) => (
            <div
              key={room.RoomId || idx}
              className="relative bg-background/40 p-4 rounded-xl border border-border/70 hover:border-accent/40 transition-all duration-200 shadow-sm space-y-3"
            >
              {/* Edit + Delete icons — top right */}
              {(onEditRoom || onRemoveRoom) && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  {onEditRoom && (
                    <button
                      type="button"
                      onClick={() => onEditRoom(room.RoomId)}
                      title="Edit room"
                      aria-label="Edit room"
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-card text-accent border border-border hover:bg-accent hover:text-white hover:border-accent transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
                    >
                      <FiEdit2 className="text-xs" />
                    </button>
                  )}
                  {onRemoveRoom && (
                    <button
                      type="button"
                      onClick={() => onRemoveRoom(room.RoomId)}
                      title="Remove room"
                      aria-label="Remove room"
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-card text-red-500 border border-border hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-4 pr-16">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-background border border-border/50 shrink-0">
                  <img
                    src={
                      room.RoomImage ||
                      room.coverImage ||
                      "/images/imperiallogo.png"
                    }
                    alt="room"
                    className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-sm text-foreground truncate tracking-wide">
                        {room.RoomName ||
                          room.roomName ||
                          `Room ${room.RoomNumber || "Allocated Unit"}`}
                      </p>
                      <span className="text-text-muted bg-background px-2 py-0.5 rounded-md border border-border/60 font-mono text-[9px] shrink-0">
                        Slot #{idx + 1}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-semibold">
                      Suite ID: #{room.RoomNumber || room.RoomId || "N/A"}
                    </p>
                  </div>
                  <div className="text-xs pt-1">
                    <span className="text-primary font-bold text-sm">
                      BDT {(room.PricePerNight || 3500).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-text-muted font-normal lowercase">
                      {" "}/ night
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border/40 text-[10px] text-text-muted uppercase font-semibold tracking-wider">
                <div className="flex items-center gap-1.5 bg-background/60 px-2 py-1.5 rounded-lg border border-border/40">
                  <MdOutlineAirlineSeatIndividualSuite className="text-xs text-primary" />
                  <span>Max {room.MaxOccupancy || 2} Guests</span>
                </div>
                <div className="flex items-center gap-1.5 bg-background/60 px-2 py-1.5 rounded-lg border border-border/40">
                  <MdAcUnit
                    className={`text-xs ${room.IsAC ? "text-accent" : "text-text-muted/40"
                      }`}
                  />
                  <span className="truncate">
                    {room.IsAC ? "A/C Room" : "Standard Climate"}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-background/30 border border-border/50 rounded-xl p-3 text-[11px] text-text-muted space-y-1.5 font-medium">
            <p className="flex justify-between">
              <span>• Check-In Protocol:</span>{" "}
              <span className="text-foreground font-semibold">14:00 PM</span>
            </p>
            <p className="flex justify-between">
              <span>• Wi-Fi & Amenities:</span>{" "}
              <span className="text-accent font-semibold">Complimentary</span>
            </p>
          </div>

          <div className="pt-4 border-t border-dashed border-border/80 flex flex-col gap-1 text-sm font-bold text-foreground">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
              Combined Total Rate ({numberOfNights} night
              {numberOfNights > 1 ? "s" : ""})
            </span>
            <span className="text-primary text-2xl font-black tracking-tight">
              BDT {totalPriceSum.toLocaleString()}
            </span>
            <span className="text-[11px] text-text-muted font-normal">
              {numberOfNights} night{numberOfNights > 1 ? "s" : ""} ×{" "}
              {selectedItems.length} room
              {selectedItems.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/*  RIGHT COLUMN  */}
      <div className="lg:col-span-3 space-y-4">
        <h3 className="text-xl font-bold text-primary tracking-wide uppercase flex items-center gap-2">
          <FiUser className="text-base shrink-0" /> Guest Information
        </h3>

        <div className="grid md:grid-cols-2 gap-5">
          {/* First Name */}
          <div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                <FiUser className="text-base" />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                placeholder="First Name *"
                onChange={onFormChange}
                className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${formErrors.firstName
                  ? "border-accent focus:border-accent"
                  : "border-border focus:border-primary"
                  }`}
              />
            </div>
            {formErrors.firstName && (
              <p className="text-accent text-[11px] font-semibold mt-1.5 ml-1">
                {formErrors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                <FiUser className="text-base" />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                placeholder="Last Name *"
                onChange={onFormChange}
                className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${formErrors.lastName
                  ? "border-accent focus:border-accent"
                  : "border-border focus:border-primary"
                  }`}
              />
            </div>
            {formErrors.lastName && (
              <p className="text-accent text-[11px] font-semibold mt-1.5 ml-1">
                {formErrors.lastName}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                <FiPhone className="text-base" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                placeholder="Phone Number *"
                onChange={handlePhoneChange}
                maxLength={11}
                className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${formErrors.phone
                  ? "border-accent focus:border-accent"
                  : "border-border focus:border-primary"
                  }`}
              />
            </div>
            {formData.phone.length === 11 && !formErrors.phone && (
              <p className="text-text-muted text-[11px] font-medium">
                Maximum 11 characters
              </p>
            )}
            {formErrors.phone && (
              <p className="text-accent text-[11px] font-semibold mt-1.5 ml-1">
                {formErrors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                <FiMail className="text-base" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Email Address *"
                onChange={onFormChange}
                className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${formErrors.email
                  ? "border-accent focus:border-accent"
                  : "border-border focus:border-primary"
                  }`}
              />
            </div>
            {formErrors.email && (
              <p className="text-accent text-[11px] font-semibold mt-1.5 ml-1">
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Country Dropdown */}
          <div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors z-10">
                <FiGlobe className="text-base" />
              </div>
              <select
                name="countryId"
                value={formData.countryId}
                onChange={onFormChange}
                className={`w-full pl-11 pr-10 py-4 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all appearance-none cursor-pointer ${formErrors.countryId
                  ? "border-accent focus:border-accent"
                  : "border-border focus:border-primary"
                  }`}
              >
                <option value="">Select Country *</option>
                {countries?.map((c, i) => (
                  <option key={getCountryId(c) || i} value={getCountryId(c)}>
                    {getCountryName(c)}
                  </option>
                ))}
              </select>
              {/* caret icon */}
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted">
                ▾
              </div>
            </div>
            {formErrors.countryId && (
              <p className="text-accent text-[11px] font-semibold mt-1.5 ml-1">
                {formErrors.countryId}
              </p>
            )}
          </div>

          {/* Address (NEW) - spans 1 column, aligns with country row */}
          <div className="">
            <div className="relative group">
              <div className="absolute top-4 left-4 flex pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                <FiMapPin className="text-base" />
              </div>
              <input
                type="text"
                name="address"
                value={formData.address}
                placeholder="Full Address *"
                onChange={onFormChange}
                className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${formErrors.address
                  ? "border-accent focus:border-accent"
                  : "border-border focus:border-primary"
                  }`}
              />
            </div>
            {formErrors.address && (
              <p className="text-accent text-[11px] font-semibold mt-1.5 ml-1">
                {formErrors.address}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="relative group pt-1">
          <div className="absolute top-4 left-4 flex pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
            <FiMessageSquare className="text-base" />
          </div>
          <textarea
            name="message"
            value={formData.message}
            placeholder="Special Requests or preferred arrival notes (optional)..."
            onChange={onFormChange}
            rows={6}
            className="w-full pl-11 pr-4 py-4 border border-border focus:border-primary rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default Step2GuestDetails;


// "use client";

// import React from "react";
// import {
//   FiUser,
//   FiMail,
//   FiPhone,
//   FiMessageSquare,
//   FiBookmark,
//   FiMapPin,
//   FiGlobe,
//   FiEdit2,
//   FiTrash2,
// } from "react-icons/fi";
// import { MdOutlineAirlineSeatIndividualSuite, MdAcUnit } from "react-icons/md";

// interface SearchDate {
//   checkIn: string;
//   checkOut: string;
//   rooms: number;
//   adults: string;
//   children: string;
//   childrenAges: number[];
// }

// interface Country {
//   CountryCode?: string | number;
//   CountryName?: string;
//   Name?: string;
// }

// interface Step2Props {
//   selectedItems: any[];
//   searchDate: SearchDate;
//   formData: {
//     firstName: string;
//     lastName: string;
//     phone: string;
//     email: string;
//     message: string;
//     countryId: string;
//     address: string;
//   };
//   formErrors: Record<string, string>;
//   totalPriceSum: number;
//   numberOfNights: number;
//   countries: Country[];
//   onFormChange: (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => void;
// onRemoveRoom?: (roomId: any) => void;
// onEditRoom?: (roomId: any) => void;
// }

// const Step2GuestDetails: React.FC<Step2Props> = ({
//   selectedItems,
//   searchDate,
//   formData,
//   formErrors,
//   totalPriceSum,
//   numberOfNights,
//   countries,
//   onFormChange,
// onRemoveRoom,
// onEditRoom,
// }) => {
//   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     const onlyNumbers = value.replace(/\D/g, "");
//     const limitedValue = onlyNumbers.slice(0, 11);

//     const syntheticEvent = {
//       ...e,
//       target: { ...e.target, name, value: limitedValue },
//     } as React.ChangeEvent<HTMLInputElement>;

//     onFormChange(syntheticEvent);
//   };

//   const getCountryId = (c: Country) => String(c.CountryCode ?? "");
//   const getCountryName = (c: Country) => c.CountryName ?? "";

//   return (
//     <div className="grid lg:grid-cols-5 gap-10 font-biryani">
//       {/* ================= LEFT COLUMN ================= */}
//       <div className="lg:col-span-2 space-y-4">
//         {/* Section heading — ImageCardSlider style */}
//         <div className="flex items-center gap-3 mb-2">
//           <span className="h-[1px] w-10 bg-[#556B2F]" />
//           <h3 className="text-xl sm:text-2xl font-medium text-secondary tracking-wide">
//             Your Selection List
//           </h3>
//         </div>

//         {/* 👇 SCROLLBAR STYLE ADDED VIA INLINE STYLE */}
//         <style jsx>{`
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

//         <div className="premium-scrollbar bg-white rounded-3xl p-5 border border-neutral-100 space-y-4 max-h-[520px] overflow-y-auto shadow-sm">
//           {selectedItems.map((room, idx) => (
//             <div
//               key={room.RoomId || idx}
//               className="bg-[#f5f5f0] p-4 rounded-2xl border border-neutral-100 hover:border-[#D4AF37]/50 transition-all duration-200 shadow-sm space-y-3 relative"
//             >
//               {/* ============ TOP ICON ACTIONS (Edit + Delete) ============ */}
//               {(onEditRoom || onRemoveRoom) && (
//                 <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
//                   {onEditRoom && (
//                     <button
//                       type="button"
//                       onClick={() => onEditRoom(room.RoomId)}
//                       title="Edit room"
//                       aria-label="Edit room"
//                       className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#D4AF37] border border-neutral-200 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
//                     >
//                       <FiEdit2 className="text-xs" />
//                     </button>
//                   )}
//                   {onRemoveRoom && (
//                     <button
//                       type="button"
//                       onClick={() => onRemoveRoom(room.RoomId)}
//                       title="Delete room"
//                       aria-label="Delete room"
//                       className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-red-500 border border-neutral-200 hover:border-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
//                     >
//                       <FiTrash2 className="text-xs" />
//                     </button>
//                   )}
//                 </div>
//               )}

//               {/* ============ ROOM CONTENT ============ */}
//               <div className="flex gap-4 pr-16">
//                 <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0">
//                   <img
//                     src={
//                       room.RoomImage ||
//                       room.coverImage ||
//                       "/images/imperiallogo.png"
//                     }
//                     alt="room"
//                     className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
//                   />
//                 </div>
//                 <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
//                   <div>
//                     <div className="flex items-start justify-between gap-1">
//                       <p className="font-bold text-sm text-neutral-800 truncate tracking-wide">
//                         {room.RoomName ||
//                           room.roomName ||
//                           `Room ${room.RoomNumber || "Allocated Unit"}`}
//                       </p>
//                     </div>
//                     <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider font-semibold">
//                       Suite ID: #{room.RoomNumber || room.RoomId || "N/A"}
//                     </p>
//                   </div>
//                   <div className="text-xs pt-1">
//                     <span className="text-[#556B2F] font-bold text-sm">
//                       BDT {(room.PricePerNight || 3500).toLocaleString()}
//                     </span>
//                     <span className="text-[10px] text-neutral-500 font-normal lowercase">
//                       {" "}
//                       / night
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* ============ ROOM META ============ */}
//               <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-neutral-200 text-[10px] text-neutral-500 uppercase font-semibold tracking-wider">
//                 <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-neutral-100">
//                   <MdOutlineAirlineSeatIndividualSuite className="text-xs text-[#556B2F]" />
//                   <span>Max {room.MaxOccupancy || 2} Guests</span>
//                 </div>
//                 <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-neutral-100">
//                   <MdAcUnit
//                     className={`text-xs ${
//                       room.IsAC ? "text-[#D4AF37]" : "text-neutral-300"
//                     }`}
//                   />
//                   <span className="truncate">
//                     {room.IsAC ? "A/C Room" : "Standard Climate"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {/* Info box */}
//           <div className="bg-[#f5f5f0] border border-neutral-100 rounded-2xl p-3 text-[11px] text-neutral-500 space-y-1.5 font-medium">
//             <p className="flex justify-between">
//               <span>• Check-In Protocol:</span>{" "}
//               <span className="text-neutral-800 font-semibold">14:00 PM</span>
//             </p>
//             <p className="flex justify-between">
//               <span>• Wi-Fi & Amenities:</span>{" "}
//               <span className="text-[#D4AF37] font-semibold">Complimentary</span>
//             </p>
//           </div>

//           {/* Total Price */}
//           <div className="pt-4 border-t border-dashed border-neutral-200 flex flex-col gap-1">
//             <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
//               Combined Total Rate ({numberOfNights} night
//               {numberOfNights > 1 ? "s" : ""})
//             </span>
//             <span className="text-[#556B2F] text-2xl font-black tracking-tight">
//               BDT {totalPriceSum.toLocaleString()}
//             </span>
//             <span className="text-[11px] text-neutral-500 font-normal">
//               {numberOfNights} night{numberOfNights > 1 ? "s" : ""} ×{" "}
//               {selectedItems.length} room
//               {selectedItems.length > 1 ? "s" : ""}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* ================= RIGHT COLUMN ================= */}
//       <div className="lg:col-span-3 space-y-4">
//         {/* Section heading — ImageCardSlider style */}
//         <div className="flex items-center gap-3 mb-2">
//           <span className="h-[1px] w-10 bg-[#556B2F]" />
//           <h3 className="text-xl sm:text-2xl font-medium text-secondary tracking-wide">
//             Guest Information
//           </h3>
//         </div>

//         <div className="grid md:grid-cols-2 gap-5">
//           {/* First Name */}
//           <div>
//             <div className="relative group">
//               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#556B2F] transition-colors">
//                 <FiUser className="text-base" />
//               </div>
//               <input
//                 type="text"
//                 name="firstName"
//                 value={formData.firstName}
//                 placeholder="First Name *"
//                 onChange={onFormChange}
//                 className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-sm transition-all ${
//                   formErrors.firstName
//                     ? "border-red-300 focus:border-red-400"
//                     : "border-neutral-200 focus:border-[#D4AF37]"
//                 }`}
//               />
//             </div>
//             {formErrors.firstName && (
//               <p className="text-red-500 text-[11px] font-semibold mt-1.5 ml-1">
//                 {formErrors.firstName}
//               </p>
//             )}
//           </div>

//           {/* Last Name */}
//           <div>
//             <div className="relative group">
//               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#556B2F] transition-colors">
//                 <FiUser className="text-base" />
//               </div>
//               <input
//                 type="text"
//                 name="lastName"
//                 value={formData.lastName}
//                 placeholder="Last Name *"
//                 onChange={onFormChange}
//                 className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-sm transition-all ${
//                   formErrors.lastName
//                     ? "border-red-300 focus:border-red-400"
//                     : "border-neutral-200 focus:border-[#D4AF37]"
//                 }`}
//               />
//             </div>
//             {formErrors.lastName && (
//               <p className="text-red-500 text-[11px] font-semibold mt-1.5 ml-1">
//                 {formErrors.lastName}
//               </p>
//             )}
//           </div>

//           {/* Phone */}
//           <div>
//             <div className="relative group">
//               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#556B2F] transition-colors">
//                 <FiPhone className="text-base" />
//               </div>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 placeholder="Phone Number *"
//                 onChange={handlePhoneChange}
//                 maxLength={11}
//                 className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-sm transition-all ${
//                   formErrors.phone
//                     ? "border-red-300 focus:border-red-400"
//                     : "border-neutral-200 focus:border-[#D4AF37]"
//                 }`}
//               />
//             </div>
//             {formData.phone.length === 11 && !formErrors.phone && (
//               <p className="text-neutral-400 text-[11px] font-medium mt-1">
//                 Maximum 11 characters
//               </p>
//             )}
//             {formErrors.phone && (
//               <p className="text-red-500 text-[11px] font-semibold mt-1.5 ml-1">
//                 {formErrors.phone}
//               </p>
//             )}
//           </div>

//           {/* Email */}
//           <div>
//             <div className="relative group">
//               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#556B2F] transition-colors">
//                 <FiMail className="text-base" />
//               </div>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 placeholder="Email Address *"
//                 onChange={onFormChange}
//                 className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-sm transition-all ${
//                   formErrors.email
//                     ? "border-red-300 focus:border-red-400"
//                     : "border-neutral-200 focus:border-[#D4AF37]"
//                 }`}
//               />
//             </div>
//             {formErrors.email && (
//               <p className="text-red-500 text-[11px] font-semibold mt-1.5 ml-1">
//                 {formErrors.email}
//               </p>
//             )}
//           </div>

//           {/* Country */}
//           <div>
//             <div className="relative group">
//               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#556B2F] transition-colors z-10">
//                 <FiGlobe className="text-base" />
//               </div>
//               <select
//                 name="countryId"
//                 value={formData.countryId}
//                 onChange={onFormChange}
//                 className={`w-full pl-11 pr-10 py-4 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-sm transition-all appearance-none cursor-pointer ${
//                   formErrors.countryId
//                     ? "border-red-300 focus:border-red-400"
//                     : "border-neutral-200 focus:border-[#D4AF37]"
//                 }`}
//               >
//                 <option value="">Select Country *</option>
//                 {countries?.map((c, i) => (
//                   <option key={getCountryId(c) || i} value={getCountryId(c)}>
//                     {getCountryName(c)}
//                   </option>
//                 ))}
//               </select>
//               <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-400">
//                 ▾
//               </div>
//             </div>
//             {formErrors.countryId && (
//               <p className="text-red-500 text-[11px] font-semibold mt-1.5 ml-1">
//                 {formErrors.countryId}
//               </p>
//             )}
//           </div>

//           {/* Address */}
//           <div>
//             <div className="relative group">
//               <div className="absolute top-4 left-4 flex pointer-events-none text-neutral-400 group-focus-within:text-[#556B2F] transition-colors">
//                 <FiMapPin className="text-base" />
//               </div>
//               <input
//                 type="text"
//                 name="address"
//                 value={formData.address}
//                 placeholder="Full Address *"
//                 onChange={onFormChange}
//                 className={`w-full pl-11 pr-4 py-4 border rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-sm transition-all ${
//                   formErrors.address
//                     ? "border-red-300 focus:border-red-400"
//                     : "border-neutral-200 focus:border-[#D4AF37]"
//                 }`}
//               />
//             </div>
//             {formErrors.address && (
//               <p className="text-red-500 text-[11px] font-semibold mt-1.5 ml-1">
//                 {formErrors.address}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Message */}
//         <div className="relative group pt-1">
//           <div className="absolute top-4 left-4 flex pointer-events-none text-neutral-400 group-focus-within:text-[#556B2F] transition-colors">
//             <FiMessageSquare className="text-base" />
//           </div>
//           <textarea
//             name="message"
//             value={formData.message}
//             placeholder="Special Requests or preferred arrival notes (optional)..."
//             onChange={onFormChange}
//             rows={6}
//             className="w-full pl-11 pr-4 py-4 border border-neutral-200 focus:border-[#D4AF37] rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-sm transition-all resize-none"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Step2GuestDetails;