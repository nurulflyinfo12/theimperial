// app/components/auth/LoginModal.tsx
"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoginRegister } from "@/redux/hook/useLogingRegister";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSuccess?: () => void; // ← new optional prop
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSuccess,
}) => {
  const router = useRouter();

  const {
    loginData,
    loginLoading,
    loginError,
    createLogin,
  } = useLoginRegister();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (localError) {
      setLocalError("");
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLocalError("");

  //   if (!validateForm()) {
  //     return;
  //   }

  //   try {
  //     await createLogin({
  //       Username: formData.email.trim(),
  //       Password: formData.password,
  //     });

  //     // Success
  //     onClose();
  //     setFormData({ email: "", password: "" });

  //     // If onSuccess is provided (from BookingStepper) → call it
  //     // Otherwise just stay on the current page (no redirect)
  //     if (onSuccess) {
  //       onSuccess();
  //     }
  //   } catch (err: any) {
  //     setLocalError(err?.message || "Login failed. Please try again.");
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLocalError("");

  if (!validateForm()) {
    return;
  }

  try {
    await createLogin({
      Username: formData.email.trim(),
      Password: formData.password,
    });
    // Success
    onClose();
    setFormData({ email: "", password: "" });

    if (onSuccess) {
      onSuccess();
    }
  } catch (err: any) {
    // Get message from API
    const apiMessage =  
      err?.response?.data?.message ||
      err?.response?.data?.Message ||
      err?.message ||
      "";

    const lowerMsg = apiMessage.toLowerCase();

    // Username incorrect / user not found → ask to register
    if (
      lowerMsg.includes("not found") ||
      lowerMsg.includes("user does not exist") ||
      lowerMsg.includes("no user") ||
      lowerMsg.includes("invalid username") ||
      lowerMsg.includes("email not found") ||
      lowerMsg.includes("username not found")
    ) {
      setLocalError("Username is incorrect. Please register first.");
    }
    // Password wrong
    else if (
      lowerMsg.includes("password") ||
      lowerMsg.includes("invalid credential") ||
      lowerMsg.includes("wrong password") ||
      lowerMsg.includes("incorrect password")
    ) {
      setLocalError("Password is wrong.");
    }
    // Fallback
    else {
      setLocalError(apiMessage || "Login failed. Please try again.");
    }
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md relative z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0A2F1F] px-8 py-6 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-medium tracking-wider text-white">
              Welcome Back
            </h3>
            <p className="text-[#D4AF37] text-xs mt-1 font-light tracking-widest">
              Sign in to your account
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1">
          {(localError || loginError) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-slideDown">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{localError || loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all text-neutral-900 placeholder:text-neutral-400 ${formErrors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-neutral-200 focus:border-[#0A2F1F] focus:ring-[#0A2F1F]/20"
                    }`}
                  disabled={loginLoading}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all text-neutral-900 placeholder:text-neutral-400 ${formErrors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-neutral-200 focus:border-[#0A2F1F] focus:ring-[#0A2F1F]/20"
                    }`}
                  disabled={loginLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  disabled={loginLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#0A2F1F] text-white py-3.5 rounded-xl font-medium text-sm tracking-widest uppercase transition-all duration-200 hover:bg-[#0A2F1F]/90 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  onClose();
                  onSwitchToRegister();
                }}
                className="text-[#0A2F1F] font-bold hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;