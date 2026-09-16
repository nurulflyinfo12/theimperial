"use client";

import { useState, useEffect } from "react";
import { FiMenu, FiPhone, FiUser, FiLogOut } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import MobileMenu from "./MobileMenu";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/redux/hook/useApplicationDetails";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slice/authSlice";
import RegisterModal from "@/auth/RegisterModal";
import LoginModal from "@/auth/LoginModal";
import ProfileModal from "@/auth/ProfileModal"; // ← add this

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // ← add this
  const [mounted, setMounted] = useState(false);

  const dispatch = useDispatch();
  const { application } = useAppSelector((state) => state.application);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const logoSrc =
    typeof application?.Logo === "string" && application.Logo.trim().length > 0
      ? application.Logo
      : "/images/logo.svg";

  return (
    <>
      {/* Top Contact Bar */}
      <div className="fixed top-0 left-0 z-50 w-full bg-[#0A2F1F] text-white lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex h-11 items-center justify-between">
            <a
              href="https://wa.me/8801704199798"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-green-400"
            >
              <FaWhatsapp className="text-[18px] relative -top-[2px]" />
              <span className="text-[12px]">Chat with us</span>
            </a>

            <a
              href="tel:+8801704199798"
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-green-400"
            >
              <FiPhone className="text-sm flex-shrink-0" />
              <span className="whitespace-nowrap text-[12px]">
                +880 1704-199798
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`fixed top-11 lg:top-0 left-0 w-full z-40 transition-all duration-300 backdrop-blur-sm ${
          scrolled
            ? "bg-white/85 dark:bg-white/100 backdrop-blur-md text-secondary dark:text-secondary shadow-[0px_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_20px_rgba(0,0,0,0.4)]"
            : "bg-white/85 dark:bg-white/90 backdrop-blur-md text-secondary dark:text-black shadow-[0px_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_20px_rgba(0,0,0,0.4)]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between py-3 md:py-5">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 max-w-[140px] sm:max-w-none">
              {logoSrc && (
                <Image
                  src={logoSrc}
                  alt={application?.ApplicationName || "Resort"}
                  width={160}
                  height={70}
                  className="h-10 sm:h-12 md:h-16 w-auto object-contain"
                  priority
                  unoptimized={logoSrc.startsWith("data:")}
                />
              )}
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Desktop Phone */}
              <div className="hidden xl:flex items-center gap-6 text-sm font-medium">
                <a
                  href="tel:01704199798"
                  className="inline-flex items-center gap-2 leading-none"
                >
                  <FiPhone size={14} className="flex-shrink-0 mb-0.6" />
                  <span className="inline-block pt-[1px]">
                    +880 1704-199798
                  </span>
                </a>
              </div>

              {/* Book Now */}
              <Link
                href="/booknow"
                className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs font-serif font-bold uppercase tracking-widest border border-current rounded-none transform hover:scale-105 hover:bg-secondary hover:text-white dark:hover:bg-white dark:hover:text-secondary shadow-sm"
              >
                Book Now
              </Link>

              {/* Sign In / Profile + Logout */}
              {mounted &&
                (isAuthenticated ? (
                  <div className="hidden md:flex items-center gap-3">
                    {/* Profile → opens modal */}
                    <button
                      onClick={() => setShowProfile(true)}
                      className="flex items-center gap-1.5 text-sm font-medium hover:text-secondary transition-colors cursor-pointer"
                      title={user?.firstName || "Profile"}
                    >
                      <FiUser size={18} />
                      <span>{user?.firstName || "Profile"}</span>
                    </button>

                    {/* Logout */}
                    {/* <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 text-sm font-medium hover:text-red-600 transition-colors cursor-pointer"
                      title="Logout"
                    >
                      <FiLogOut size={18} />
                      <span>Logout</span>
                    </button> */}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="hidden md:flex items-center justify-center p-1.5 rounded-full hover:text-secondary transition-colors cursor-pointer"
                    title="Sign In"
                  >
                    <FiUser size={18} />
                  </button>
                ))}

              <div className="hidden sm:block h-5 w-px bg-current opacity-20" />

              {/* Menu Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center cursor-pointer gap-1 sm:gap-2"
              >
                <span className="hidden sm:block text-sm font-serif font-bold uppercase tracking-wider">
                  Menu
                </span>
                <FiMenu size={24} className="sm:size-[26px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} /> */}
      <MobileMenu
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSignInClick={() => setShowLogin(true)}
  onProfileClick={() => setShowProfile(true)}
/>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { FiMenu, FiPhone } from "react-icons/fi";
// import { FaWhatsapp } from "react-icons/fa";
// import MobileMenu from "./MobileMenu";
// import ThemeToggle from "../ThemeToggle/ThemeToggle";
// import Image from "next/image";
// import Link from "next/link";
// import { useAppSelector } from "@/redux/hook/useApplicationDetails";
// import SignInModal from "../SignIn/SingIn";

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [isSignInOpen, setIsSignInOpen] = useState(false);
//   const { application } = useAppSelector((state) => state.application);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const logoSrc =
//     typeof application?.Logo === "string" &&
//     application.Logo.trim().length > 0
//       ? application.Logo
//       : null;

//   return (
//     <>
//       {/* Top Contact Bar (Visible on ALL screens) */}
//       <div className="fixed top-0 left-0 z-50 w-full bg-[#0A2F1F] text-white lg:hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
//           <div className="flex h-11 items-center justify-between">
//             {/* WhatsApp */}
//             <a
//               href="https://wa.me/8801704199798"
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-green-400"
//             >
//               <FaWhatsapp className="text-[18px] relative -top-[2px]" />
//               <span className="text-[12px]">Chat with us</span>
//             </a>

//             {/* Phone */}
//             <a
//               href="tel:+8801704199798"
//               className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-green-400"
//             >
//               <FiPhone className="text-sm flex-shrink-0" />
//               <span className="whitespace-nowrap text-[12px]">
//                 +880 1704-199798
//               </span>
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Main Navbar */}
//       <header
//         className={`fixed top-11 lg:top-0 left-0 w-full z-40 transition-all duration-300 backdrop-blur-sm ${scrolled
//             ? "bg-white/85 dark:bg-white/100 backdrop-blur-md text-secondary dark:text-secondary shadow-[0px_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_20px_rgba(0,0,0,0.4)]"
//             : "bg-white/85 dark:bg-white/90 backdrop-blur-md text-secondary dark:text-black shadow-[0px_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_20px_rgba(0,0,0,0.4)]"
//           }`}
//       >
//         <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10">
//           <div className="flex items-center justify-between py-3 md:py-5">
//             {/* Logo */}
//             <Link
//               href="/"
//               className="flex-shrink-0 max-w-[140px] sm:max-w-none"
//             >
//               {logoSrc && (
//                 <Image
//                   src={logoSrc}
//                   alt={application?.ApplicationName || "Resort"}
//                   width={160}
//                   height={70}
//                   className="h-10 sm:h-12 md:h-16 w-auto object-contain"
//                   priority
//                   unoptimized={logoSrc.startsWith("data:")}
//                 />
//               )}
//             </Link>

//             {/* Right Side */}
//             <div className="flex items-center gap-3 sm:gap-5">
//               {/* Desktop Phone */}
//               <div className="hidden xl:flex items-center gap-6 text-sm font-medium">
//                 <a
//                   href="tel:01704199798"
//                   className="inline-flex items-center gap-2 leading-none"
//                 >
//                   <FiPhone size={14} className="flex-shrink-0 mb-0.6" />
//                   <span className="inline-block pt-[1px]">
//                     +880 1704-199798
//                   </span>
//                 </a>
//               </div>

//               {/* Sign In Link - Added here */}
//               <Link
//                 href="/signin"
//                 className="hidden md:flex items-center text-sm font-medium hover:text-secondary transition-colors"
//               >
//                 Sign In
//               </Link>

//               {/* Sign In Link - Now opens Modal */}
//               {/* <button
//                 onClick={() => setIsSignInOpen(true)}
//                 className="hidden md:flex items-center text-sm font-medium hover:text-secondary transition-colors cursor-pointer"
//               >
//                 Sign In
//               </button> */}

//               {/* <ThemeToggle scrolled={scrolled} /> */}

//               {/* Book Now Button */}
//               <Link
//                 href="/booknow"
//                 className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs font-serif font-bold uppercase tracking-widest border border-current rounded-none transform hover:scale-105 hover:bg-secondary hover:text-white dark:hover:bg-white dark:hover:text-secondary shadow-sm"
//               >
//                 Book Now
//               </Link>

//               <div className="hidden sm:block h-5 w-px bg-current opacity-20" />

//               {/* Menu Button */}
//               <button
//                 onClick={() => setIsOpen(true)}
//                 className="flex items-center cursor-pointer gap-1 sm:gap-2"
//               >
//                 <span className="hidden sm:block text-sm font-serif font-bold uppercase tracking-wider">
//                   Menu
//                 </span>
//                 <FiMenu size={24} className="sm:size-[26px]" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />

//       {/* Sign In Modal */}
//       <SignInModal
//         isOpen={isSignInOpen}
//         onClose={() => setIsSignInOpen(false)}
//       />
//     </>
//   );
// }



