'use client'

import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTripadvisor,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/redux/hook/useApplicationDetails";

const Footer = () => {

  const { application } = useAppSelector((state) => state.application);

  const logoSrc =
    typeof application?.Logo === "string" &&
      application.Logo.trim().length > 0
      ? application.Logo
      : null;

  return (
    <footer className=" text-foreground py-16  transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href="/">
              <div className=" bg-white/80 rounded-xl p-2">
                {logoSrc &&
                  <Image
                    src={logoSrc}
                    alt="tarc Logo"
                    width={150}
                    height={65}
                    className="md:w-[300px] mx-auto"
                    priority
                  />
                }

              </div>
            </Link>


            <div className="space-y-4 mt-6 text-sm text-text-muted font-light transition-colors duration-300">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-primary shrink-0 transition-colors duration-300" />
                <p className="leading-relaxed">
                  The Imperial Institute Of Hospitality & Hotel Management
                </p>
              </div>

              {/* <div className="flex items-start gap-3">
                <FaPhoneAlt className="mt-1 text-primary shrink-0 transition-colors duration-300" />
                <div className="space-y-1">
                  <p>
                    01704199798{" "}
                    <span className="text-xs opacity-70">(Head Office)</span>
                  </p>
                  <p>
                    +880 1XXX XXX XXX{" "}
                    <span className="text-xs opacity-70">(Field Office)</span>
                  </p>
                </div>
              </div> */}

              <div className="flex items-start gap-3">
                <FaCalendarAlt className="mt-1 text-primary shrink-0 transition-colors duration-300" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground transition-colors duration-300">
                    For Booking & Inquiries:
                  </p>
                  <p>+880 1704-199798</p>

                  <p className="pt-2   select-all">Email: info@rrf-bd.org</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-serif font-bold text-primary tracking-wide mb-6 pb-2 border-b border-border/20 transition-colors duration-300">
              Useful links
            </h3>
            <ul className="space-y-3.5 text-sm md:text-base">
              {[
                { label: "Rooms and Suites", path: "/roomsandsuites" },
                { label: "Restaurants", path: "/restaurantsandcafes" },
                { label: "Meetings", path: "/meetingsandevents" },
                // { label: "Recreations", path: "/recreations" },
                // { label: "Relaxation", path: "/relaxation" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.path}
                    className="text-text-muted hover:text-primary transition-colors duration-200 block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-serif font-bold text-primary tracking-wide mb-6 pb-2 border-b border-border/20 transition-colors duration-300">
              Quick links
            </h3>
            <ul className="space-y-3.5 text-sm md:text-base">
              {[
                // { label: "Surrounding Us", path: "/surroundings" },
                { label: "Getting There", path: "/gettingthere" },
                { label: "Photo Gallery", path: "/photogallery" },
                { label: "Contact", path: "/contactus" },
                { label: "Guest Policy", path: "/guestpolicy" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.path}
                    className="text-text-muted hover:text-primary transition-colors duration-200 block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-serif font-bold text-primary tracking-wide mb-6 pb-2 border-b border-border/20 transition-colors duration-300">
              Follow us
            </h3>
            <div className="grid grid-cols-3 gap-3 w-fit">
              {[
                {
                  icon: <FaFacebookF />,
                  color: "hover:text-blue-600",
                  href: "#",
                },
                {
                  icon: <FaXTwitter />,
                  color: "hover:text-black dark:hover:text-white",
                  href: "#",
                },
                {
                  icon: <FaInstagram />,
                  color: "hover:text-pink-500",
                  href: "#",
                },
                {
                  icon: <FaLinkedinIn />,
                  color: "hover:text-blue-700",
                  href: "#",
                },
                { icon: <FaYoutube />, color: "hover:text-red-600", href: "#" },
                {
                  icon: <FaTripadvisor />,
                  color: "hover:text-green-600",
                  href: "#",
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-12 h-12 bg-background border border-border/40 text-text-muted rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-card hover:border-primary/50 ${social.color}`}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-text-muted/60 text-xs mt-16 pt-8 border-t border-border/40 font-light transition-colors duration-300">
          © {new Date().getFullYear()} All Rights Reserved. Develop by <Link href="https://flyinfosoftbd.com/" target="-blank" className="font-bold text-white hover:text-primary">Flyinfosoft Technology Limited</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
