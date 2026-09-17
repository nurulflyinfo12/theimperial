"use client";

import React from "react";
import { X, User, Mail, Phone, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slice/authSlice";
import { useAppSelector } from "@/redux/hook/useApplicationDetails";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.auth);

  if (!isOpen) return null;

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="bg-[#0A2F1F] px-6 py-5 flex items-center justify-between">
          <h3 className="text-lg font-medium tracking-wider text-white">
            My Profile
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#0A2F1F]/10 flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-[#0A2F1F]" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-900">
              {user?.UserFullName || "User"}{" "}
            </h4>
            <p className="text-sm text-neutral-500 mt-0.5">
              {user?.email || user?.Email || "—"}
            </p>
          </div>

          {/* Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
              <Mail className="w-4 h-4 text-neutral-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                  Email
                </p>
                <p className="text-sm text-neutral-800">
                  {user?.email || user?.Email || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
              <Phone className="w-4 h-4 text-neutral-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                  Phone
                </p>
                <p className="text-sm text-neutral-800">
                  {user?.phone || user?.Phone || "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;