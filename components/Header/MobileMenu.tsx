"use client";

import Link from "next/link";
import Image from "next/image";
import { FiX, FiHome, FiBookOpen, FiCoffee, FiUsers, FiGift, FiPhone, FiLogIn, FiUser, FiLogOut } from "react-icons/fi";
import { useAppSelector } from "@/redux/hook/useApplicationDetails";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slice/authSlice";

const mainMenuItems = [
  { name: "Home", icon: FiHome, path: "/" },
  { name: "Rooms & Suites", icon: FiBookOpen, path: "/roomsandsuites" },
  { name: "Restaurants", icon: FiCoffee, path: "/restaurantsandcafes" },
  { name: "Meetings", icon: FiUsers, path: "/meetingsandevents" },
  { name: "Special Offers", icon: FiGift, path: "/specialoffers" },
  { name: "Contact Us", icon: FiPhone, path: "/contactus" },
];

const bottomMenuItems = [
  { name: "Getting There", path: "/gettingthere" },
  { name: "Photo Gallery", path: "/photogallery" },
  { name: "Contact", path: "/contactus" },
  { name: "Guest Policy", path: "/guestpolicy" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  onSignInClick,
  onProfileClick,
}: MobileMenuProps) {
  const dispatch = useDispatch();
  const { application } = useAppSelector((state) => state.application);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const logoSrc =
    typeof application?.Logo === "string" && application.Logo.trim().length > 0
      ? application.Logo
      : null;

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 bg-black/95 backdrop-blur-md z-[999] transition-all duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      style={{
        backgroundImage: `url('/images/cooridoor.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:top-8 md:right-8 text-white hover:text-primary transition z-10 cursor-pointer"
      >
        <FiX size={36} className="md:size-10" />
      </button>

      <div
        className="relative h-full flex flex-col items-center justify-center px-4 py-6 md:py-12 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="mb-8 md:mb-10 bg-white/80 rounded-2xl p-4">
          {logoSrc && (
            <Image
              src={logoSrc}
              alt="Logo"
              width={150}
              height={65}
              className="md:w-[300px] mx-auto"
              priority
            />
          )}
        </div>

        {/* Main Menu Grid */}
        <div className="w-full max-w-5xl border border-primary/80 bg-black/40 backdrop-blur-none overflow-hidden rounded-2xl">
          <div className="max-h-[45vh] sm:max-h-[52vh] md:max-h-none overflow-y-auto scrollbar-thin scrollbar-thumb-primary/70 scrollbar-track-transparent">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary/30 divide-y">
              {mainMenuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.path}
                  onClick={onClose}
                  className="group flex flex-col items-center justify-center
                    py-6 sm:py-8 md:py-10
                    px-3 sm:px-4 md:px-6
                    hover:bg-primary/10
                    transition duration-300
                    text-center
                    min-h-[110px] sm:min-h-[125px] md:min-h-[150px]"
                >
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 md:mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                    <item.icon />
                  </div>
                  <span className="text-[14px] sm:text-base md:text-lg font-light tracking-wider text-white group-hover:text-primary text-center leading-tight px-1">
                    {item.name}
                  </span>
                </Link>
              ))}

              {/* ===== Auth Item ===== */}
              {isAuthenticated ? (
                <>
                  {/* Profile */}
                  <button
                    onClick={() => {
                      onClose();
                      onProfileClick?.();
                    }}
                    className="group flex flex-col items-center justify-center
                      py-6 sm:py-8 md:py-10
                      px-3 sm:px-4 md:px-6
                      hover:bg-primary/10
                      transition duration-300
                      text-center
                      min-h-[110px] sm:min-h-[125px] md:min-h-[150px]
                      border-t border-primary/30 md:border-t-0 cursor-pointer"
                  >
                    <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 md:mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                      <FiUser />
                    </div>
                    <span className="text-[14px] sm:text-base md:text-lg font-light tracking-wider text-white group-hover:text-primary text-center leading-tight px-1">
                      {user?.firstName || "Profile"}
                    </span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="group flex flex-col items-center justify-center
                      py-6 sm:py-8 md:py-10
                      px-3 sm:px-4 md:px-6
                      hover:bg-red-500/20
                      transition duration-300
                      text-center
                      min-h-[110px] sm:min-h-[125px] md:min-h-[150px]
                      border-t border-primary/30 md:border-t-0 cursor-pointer"
                  >
                    <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 md:mb-4 text-red-400 group-hover:scale-110 transition-transform duration-300">
                      <FiLogOut />
                    </div>
                    <span className="text-[14px] sm:text-base md:text-lg font-light tracking-wider text-white group-hover:text-red-400 text-center leading-tight px-1">
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                /* Sign In */
                <button
                  onClick={() => {
                    onClose();
                    onSignInClick?.();
                  }}
                  className="group flex flex-col items-center justify-center
                    py-6 sm:py-8 md:py-10
                    px-3 sm:px-4 md:px-6
                    hover:bg-primary/10
                    transition duration-300
                    text-center
                    min-h-[110px] sm:min-h-[125px] md:min-h-[150px]
                    border-t border-primary/30 md:border-t-0 cursor-pointer"
                >
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 md:mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                    <FiLogIn />
                  </div>
                  <span className="text-[14px] sm:text-base md:text-lg font-light tracking-wider text-white group-hover:text-primary text-center leading-tight px-1">
                    Sign In
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 md:mt-12 px-4">
          {bottomMenuItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              onClick={onClose}
              className="border border-primary/70 hover:border-primary text-white hover:text-primary 
                         px-5 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-light 
                         tracking-widest transition duration-300 whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}



// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { FiX } from "react-icons/fi";
// import {
//   FiHome,
//   FiBookOpen,
//   FiCoffee,
//   FiUsers,
//   FiSun,
//   FiActivity,
//   FiGift,
//   FiPhone,
// } from "react-icons/fi";
// import { useAppSelector } from "@/app/redux/hook/useApplicationDetails";

// const mainMenuItems = [
//   { name: "Home", icon: FiHome, path: "/" },
//   { name: "Rooms & Suites", icon: FiBookOpen, path: "/roomsandsuites" },
//   { name: "Restaurants", icon: FiCoffee, path: "/restaurantsandcafes" },
//   { name: "Meetings", icon: FiUsers, path: "/meetingsandevents" },
//   // { name: "Relaxation", icon: FiSun, path: "/relaxation" },
//   // { name: "Recreations", icon: FiActivity, path: "/recreations" },
//   { name: "Special Offers", icon: FiGift, path: "/specialoffers" },
//   { name: "Contact Us", icon: FiPhone, path: "/contactus" },
// ];

// // Updated with paths
// const bottomMenuItems = [
//   // { name: "Surrounding Us", path: "/surroundingus" },
//   { name: "Getting There", path: "/gettingthere" },
//   { name: "Photo Gallery", path: "/photogallery" },
//   { name: "Contact", path: "/contactus" },
//   { name: "Guest Policy", path: "/guestpolicy" },
// ];

// interface MobileMenuProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
//   const { application } = useAppSelector((state) => state.application);

//   const logoSrc =
//   typeof application?.Logo === "string" &&
//   application.Logo.trim().length > 0
//     ? application.Logo
//     : null;

//   return (
//     <div onClick={onClose}
//       className={`fixed inset-0 bg-black/95 backdrop-blur-md z-[999] transition-all duration-500 ${
//         isOpen ? "opacity-100 visible" : "opacity-0 invisible"
//       }`}
//       style={{
//         backgroundImage: `url('/images/cooridoor.webp')`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       {/* Overlay Dark Tint */}
//       <div className="absolute inset-0 bg-black/70" />

//       {/* Close Button */}
//       <button
//         onClick={onClose}
//         className="absolute top-6 right-6 md:top-8 md:right-8 text-white hover:text-primary transition z-10 cursor-pointer"
//       >
//         <FiX size={36} className="md:size-10" />
//       </button>

//       <div className="relative h-full flex flex-col items-center justify-center px-4 py-6 md:py-12 overflow-auto">
//         {/* Logo */}
//         <div className="mb-8 md:mb-10 bg-white/80 rounded-2xl p-4">
//         {logoSrc &&
//           <Image
//             src={logoSrc}
//             alt="tarc Logo"
//             width={150}
//             height={65}
//             className="md:w-[300px] mx-auto"
//             priority
//           />
//         }
//         </div>

//         {/* Table Style Menu */}
//         <div className="w-full max-w-5xl border border-primary/80 bg-black/40 backdrop-blur-none overflow-hidden rounded-2xl">
//           {/* Scrollable Container */}
//           <div className="max-h-[45vh] sm:max-h-[52vh] md:max-h-none overflow-y-auto scrollbar-thin scrollbar-thumb-primary/70 scrollbar-track-transparent">
//             <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary/30 divide-y">
//               {mainMenuItems.map((item, index) => (
//                 <Link
//                   key={index}
//                   href={item.path}
//                   onClick={onClose}
//                   className={`group flex flex-col items-center justify-center
//                     py-6 sm:py-8 md:py-10
//                     px-3 sm:px-4 md:px-6
//                     hover:bg-primary/10
//                     transition duration-300
//                     text-center
//                     min-h-[110px] sm:min-h-[125px] md:min-h-[150px]
//                     ${item.name === "Contact Us" ? " md:border-r md:border-primary/30" : ""}`}
//                 >
//                   <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 md:mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
//                     <item.icon />
//                   </div>
//                   <span className="text-[14px] sm:text-base md:text-lg font-light tracking-wider text-white group-hover:text-primary text-center leading-tight px-1">
//                     {item.name}
//                   </span>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Bottom Rounded Buttons */}
//         <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 md:mt-12 px-4">
//           {bottomMenuItems.map((item, index) => (
//             <Link
//               key={index}
//               href={item.path}
//               onClick={onClose}
//               className="border border-primary/70 hover:border-primary text-white hover:text-primary 
//                          px-5 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-light 
//                          tracking-widest transition duration-300 whitespace-nowrap"
//             >
//               {item.name}
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }