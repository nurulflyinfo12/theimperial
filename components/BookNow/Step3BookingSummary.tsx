"use client";

import React from "react";
import {
  FiCalendar,
  FiUser,
  FiSliders,
  FiCreditCard,
  FiBookmark,
  FiInfo,
  FiGlobe,
  FiMapPin,
} from "react-icons/fi";
import { MdOutlineAirlineSeatIndividualSuite, MdAcUnit } from "react-icons/md";

interface SearchData {
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: string;
  children: string;
}

interface Country {
  CountryCode?: string | number;
  CountryName?: string;
  Name?: string;
}

interface Step3Props {
  selectedItems: any[];
  searchData: SearchData;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    countryId: string;  
    address: string;     
  };
  countries: Country[];  
  totalPriceSum: number;
  numberOfNights: number;
}

const Step3BookingSummary: React.FC<Step3Props> = ({
  selectedItems,
  searchData,
  formData,
  countries,
  totalPriceSum,
  numberOfNights,
}) => {
  // resolve country name from id
  const getCountryId = (c: Country) =>
    String(c.CountryCode ?? "");
  const getCountryName = (c: Country) => c.CountryName ?? "";

  const selectedCountryName =
    countries?.find((c) => getCountryId(c) === String(formData.countryId))
      ?.CountryName ??
    countries?.find((c) => getCountryId(c) === String(formData.countryId))
      ?.Name ??
    "—";

  return (
    <div className="max-w-5xl mx-auto font-biryani space-y-8">
      <h3 className="text-2xl font-extrabold text-center text-primary tracking-wide uppercase">
        Booking Summary Preview
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left - Selected Rooms */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <FiBookmark className="text-base" /> Selected Accommodations
          </h4>

          <div className="bg-card border border-border rounded-2xl p-4 space-y-3 max-h-[460px] overflow-y-auto shadow-sm">
            {selectedItems.map((room, idx) => (
              <div
                key={room.RoomId || idx}
                className="bg-background/40 border border-border/60 rounded-xl p-3 space-y-2.5 transition-colors hover:border-accent/30"
              >
                <div className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-background border border-border/40 shrink-0">
                    <img
                      src={
                        room.RoomImage ||
                        room.coverImage ||
                        "/images/viproom/viproom.webp"
                      }
                      alt="Room Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-xs text-foreground truncate tracking-wide">
                        {room.RoomName ||
                          room.roomName ||
                          `Room ${room.RoomNumber || "Allocated Unit"}`}
                      </p>
                      <span className="text-[9px] font-mono text-text-muted bg-background px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                        Slot #{idx + 1}
                      </span>
                    </div>
                    <p className="text-[10px] text-primary font-bold mt-1">
                      BDT {(room.PricePerNight || 3500).toLocaleString()}{" "}
                      <span className="text-text-muted font-normal">
                        / night
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30 text-[9px] text-text-muted uppercase font-bold tracking-widest">
                  <div className="flex items-center gap-1">
                    <MdOutlineAirlineSeatIndividualSuite className="text-primary text-xs" />
                    <span>Max {room.MaxOccupancy || 2} Guests</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdAcUnit
                      className={`text-xs ${
                        room.IsAC ? "text-accent" : "text-text-muted/30"
                      }`}
                    />
                    <span className="truncate">
                      {room.IsAC ? "A/C Unit" : "Standard"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Summary Details */}
        <div className="lg:col-span-3 bg-card border border-border p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-3">
            <FiSliders className="text-base" /> Reservation Manifest
          </h4>

          <div className="space-y-4 text-sm text-foreground">
            {/* Rooms Secured */}
            <div className="flex justify-between items-center py-1.5 border-b border-border/30">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <FiBookmark className="text-primary" /> Rooms Secured:
              </span>
              <span className="font-bold text-foreground bg-background border border-border px-3 py-1 rounded-xl text-xs">
                {selectedItems.length} Unit(s) selected
              </span>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center py-1.5 border-b border-border/30">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <FiCreditCard className="text-primary" /> Total Amount:
              </span>
              <div className="text-right">
                <span className="font-black text-primary text-xl tracking-tight block">
                  BDT {totalPriceSum.toLocaleString()}
                </span>
                <span className="text-[11px] text-text-muted">
                  for {numberOfNights} night
                  {numberOfNights > 1 ? "s" : ""} × {selectedItems.length} room
                  {selectedItems.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Stay Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-b border-border/30">
              <div className="flex flex-col gap-1">
                <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <FiCalendar className="text-primary" /> Check-In Date
                </span>
                <span className="font-bold text-foreground pl-5 text-xs sm:text-sm">
                  {searchData.checkIn || "Not Configured"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <FiCalendar className="text-primary" /> Check-Out Date
                </span>
                <span className="font-bold text-foreground pl-5 text-xs sm:text-sm">
                  {searchData.checkOut || "Not Configured"}
                </span>
              </div>
            </div>

            {/* Primary Guest */}
            <div className="flex justify-between items-start py-1.5 border-b border-border/30">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2 pt-0.5">
                <FiUser className="text-primary" /> Primary Guest:
              </span>
              <span className="font-bold text-foreground text-right">
                {formData.firstName} {formData.lastName}
              </span>
            </div>

            {/* Contact Info */}
            <div className="flex justify-between items-start py-1.5 border-b border-border/30">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2 pt-0.5">
                <FiInfo className="text-primary" /> Contact Channels:
              </span>
              <span className="font-semibold text-text-muted text-xs text-right space-y-0.5 truncate max-w-[220px] sm:max-w-none">
                <strong className="text-foreground font-bold block truncate">
                  {formData.email}
                </strong>
                <span className="block tracking-wide font-mono">
                  {formData.phone}
                </span>
              </span>
            </div>

            {/* Country */}
            <div className="flex justify-between items-start py-1.5 border-b border-border/30">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2 pt-0.5">
                <FiGlobe className="text-primary" /> Country:
              </span>
              <span className="font-bold text-foreground text-right">
                {selectedCountryName}
              </span>
            </div>

            {/* Address */}
            <div className="flex justify-between items-start py-1.5 border-b border-border/30">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2 pt-0.5">
                <FiMapPin className="text-primary" /> Address:
              </span>
              <span className="font-medium text-foreground text-right text-xs max-w-[220px] sm:max-w-[300px] break-words">
                {formData.address || "—"}
              </span>
            </div>

            {/* Special Requests */}
            {formData.message.trim() && (
              <div className="bg-background/60 border border-border/80 p-4 rounded-xl space-y-1.5 mt-2">
                <span className="text-[10px] text-primary uppercase font-extrabold tracking-widest block">
                  Special Accommodations Notes
                </span>
                <p className="italic text-text-muted text-xs leading-relaxed font-light">
                  "{formData.message}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-text-muted max-w-md mx-auto leading-relaxed border-t border-border/40 pt-4">
        Please review all specified validation details and confirmation
        parameters meticulously before committing final verification.
      </div>
    </div>
  );
};

export default Step3BookingSummary;


// "use client";

// import React from "react";
// import { FiCalendar, FiUser, FiSliders, FiCreditCard, FiBookmark, FiInfo } from "react-icons/fi";
// import { MdOutlineAirlineSeatIndividualSuite, MdAcUnit } from "react-icons/md";

// interface SearchData {
//   checkIn: string;
//   checkOut: string;
//   rooms: number;
//   adults: string;
//   children: string;
// }

// interface Step3Props {
//   selectedItems: any[];
//   searchData: SearchData;
//   formData: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//     message: string;
//   };
//   totalPriceSum: number;
//   numberOfNights: number;   
// }

// const Step3BookingSummary: React.FC<Step3Props> = ({
//   selectedItems,
//   searchData,
//   formData,
//   totalPriceSum,
//   numberOfNights,
// }) => {
//   return (
//     <div className="max-w-5xl mx-auto font-biryani space-y-8">
//       <h3 className="text-2xl font-extrabold text-center text-primary tracking-wide uppercase">
//         Booking Summary Preview
//       </h3>

//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
//         {/* Left - Selected Rooms */}
//         <div className="lg:col-span-2 space-y-4">
//           <h4 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
//             <FiBookmark className="text-base" /> Selected Accommodations
//           </h4>
          
//           <div className="bg-card border border-border rounded-2xl p-4 space-y-3 max-h-[460px] overflow-y-auto shadow-sm">
//             {selectedItems.map((room, idx) => (
//               <div
//                 key={room.RoomId || idx}
//                 className="bg-background/40 border border-border/60 rounded-xl p-3 space-y-2.5 transition-colors hover:border-accent/30"
//               >
//                 <div className="flex gap-3">
//                   <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-background border border-border/40 shrink-0">
//                     <img
//                       src={room.RoomImage || room.coverImage || "/images/viproom/viproom.webp"}
//                       alt="Room Preview"
//                       className="object-cover w-full h-full"
//                     />
//                   </div>
//                   <div className="min-w-0 flex-1 flex flex-col justify-center">
//                     <div className="flex items-center justify-between gap-2">
//                       <p className="font-bold text-xs text-foreground truncate tracking-wide">
//                         {room.RoomName || room.roomName || `Room ${room.RoomNumber || "Allocated Unit"}`}
//                       </p>
//                       <span className="text-[9px] font-mono text-text-muted bg-background px-1.5 py-0.5 rounded border border-border/40 shrink-0">
//                         Slot #{idx + 1}
//                       </span>
//                     </div>
//                     <p className="text-[10px] text-primary font-bold mt-1">
//                       BDT {(room.PricePerNight || 3500).toLocaleString()} <span className="text-text-muted font-normal">/ night</span>
//                     </p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30 text-[9px] text-text-muted uppercase font-bold tracking-widest">
//                   <div className="flex items-center gap-1">
//                     <MdOutlineAirlineSeatIndividualSuite className="text-primary text-xs" />
//                     <span>Max {room.MaxOccupancy || 2} Guests</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <MdAcUnit className={`text-xs ${room.IsAC ? "text-accent" : "text-text-muted/30"}`} />
//                     <span className="truncate">{room.IsAC ? "A/C Unit" : "Standard"}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right - Summary Details */}
//         <div className="lg:col-span-3 bg-card border border-border p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
//           <h4 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-3">
//             <FiSliders className="text-base" /> Reservation Manifest
//           </h4>

//           <div className="space-y-4 text-sm text-foreground">
//             {/* Rooms Secured */}
//             <div className="flex justify-between items-center py-1.5 border-b border-border/30">
//               <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
//                 <FiBookmark className="text-primary" /> Rooms Secured:
//               </span>
//               <span className="font-bold text-foreground bg-background border border-border px-3 py-1 rounded-xl text-xs">
//                 {selectedItems.length} Unit(s) selected
//               </span>
//             </div>

//             {/* Updated Total Rate */}
//             <div className="flex justify-between items-center py-1.5 border-b border-border/30">
//               <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
//                 <FiCreditCard className="text-primary" /> Total Amount:
//               </span>
//               <div className="text-right">
//                 <span className="font-black text-primary text-xl tracking-tight block">
//                   BDT {totalPriceSum.toLocaleString()}
//                 </span>
//                 <span className="text-[11px] text-text-muted">
//                   for {numberOfNights} night{numberOfNights > 1 ? "s" : ""} × {selectedItems.length} room{selectedItems.length > 1 ? "s" : ""}
//                 </span>
//               </div>
//             </div>

//             {/* Stay Dates */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-b border-border/30">
//               <div className="flex flex-col gap-1">
//                 <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
//                   <FiCalendar className="text-primary" /> Check-In Date
//                 </span>
//                 <span className="font-bold text-foreground pl-5 text-xs sm:text-sm">
//                   {searchData.checkIn || "Not Configured"}
//                 </span>
//               </div>
//               <div className="flex flex-col gap-1">
//                 <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
//                   <FiCalendar className="text-primary" /> Check-Out Date
//                 </span>
//                 <span className="font-bold text-foreground pl-5 text-xs sm:text-sm">
//                   {searchData.checkOut || "Not Configured"}
//                 </span>
//               </div>
//             </div>

//             {/* Primary Guest */}
//             <div className="flex justify-between items-start py-1.5 border-b border-border/30">
//               <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2 pt-0.5">
//                 <FiUser className="text-primary" /> Primary Guest:
//               </span>
//               <span className="font-bold text-foreground text-right">
//                 {formData.firstName} {formData.lastName}
//               </span>
//             </div>

//             {/* Contact Info */}
//             <div className="flex justify-between items-start py-1.5 border-b border-border/30">
//               <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-2 pt-0.5">
//                 <FiInfo className="text-primary" /> Contact Channels:
//               </span>
//               <span className="font-semibold text-text-muted text-xs text-right space-y-0.5 truncate max-w-[220px] sm:max-w-none">
//                 <strong className="text-foreground font-bold block truncate">{formData.email}</strong>
//                 <span className="block tracking-wide font-mono">{formData.phone}</span>
//               </span>
//             </div>

//             {/* Special Requests */}
//             {formData.message.trim() && (
//               <div className="bg-background/60 border border-border/80 p-4 rounded-xl space-y-1.5 mt-2">
//                 <span className="text-[10px] text-primary uppercase font-extrabold tracking-widest block">
//                   Special Accommodations Notes
//                 </span>
//                 <p className="italic text-text-muted text-xs leading-relaxed font-light">
//                   "{formData.message}"
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="text-center text-[11px] text-text-muted max-w-md mx-auto leading-relaxed border-t border-border/40 pt-4">
//         Please review all specified validation details and confirmation parameters meticulously before committing final verification.
//       </div>
//     </div>
//   );
// };

// export default Step3BookingSummary;