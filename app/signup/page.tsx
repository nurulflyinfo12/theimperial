"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiAlertCircle, FiCheck } from "react-icons/fi";
import { useAppSelector } from "@/redux/hook/useApplicationDetails";
import { useLoginRegister } from "@/redux/hook/useLogingRegister";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const { application } = useAppSelector((state) => state.application);

  // ===== Register Hook =====
  const {
    createRegister,
    registerLoading,
    registerError,
    registerData,
  } = useLoginRegister();

  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
    type?: "success" | "error" | "info";
  }>({ message: "", visible: false, type: "info" });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message, visible: true, type });
    setTimeout(() => setToast({ message: "", visible: false }), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the Terms & Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    // CompanyID is required
    if (!application?.CompanyID) {
      showToast("Company information is missing. Please try again later.");
      return;
    }

    const payload = {
      CompanyID: application.CompanyID,
      FirstName: formData.firstName.trim(),
      LastName: formData.lastName.trim(),
      Email: formData.email.trim(),
      Phone: formData.phone.trim(),
      Password: formData.password,
    }
    try {
      await createRegister(payload);

      // Success
      showToast("Account created successfully!");
      // Optional: redirect
      // router.push("/signin");
    } catch (err) {
      // Error is already handled in the hook (registerError)
      console.error("Registration failed:", err);
    }
  };

  const logoSrc =
    typeof application?.Logo === "string" && application.Logo.trim().length > 0
      ? application.Logo
      : "/logo.png";

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 pt-35 pb-20">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-2 rounded-md">
              <Link href="/" className="flex items-center gap-3">
                {logoSrc && (
                  <Image
                    src={logoSrc}
                    alt={application?.ApplicationName || "Resort"}
                    width={180}
                    height={70}
                    className="h-14 w-auto object-contain"
                    priority
                  />
                )}
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-serif font-bold text-center text-foreground mb-2">
              Create Account
            </h2>
            <p className="text-center text-text-muted mb-8">
              Join us for easy booking &amp; exclusive offers
            </p>

            {/* Show API Error */}
            {registerError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {registerError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <FiUser size={20} />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className={`w-full pl-11 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-text-muted ${errors.firstName ? "border-red-500" : "border-border"
                      }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <FiUser size={20} />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className={`w-full pl-11 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-text-muted ${errors.lastName ? "border-red-500" : "border-border"
                      }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <FiMail size={20} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={`w-full pl-11 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-text-muted ${errors.email ? "border-red-500" : "border-border"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <FiPhone size={20} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+880 1XXX-XXXXXX"
                    className={`w-full pl-11 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-text-muted ${errors.phone ? "border-red-500" : "border-border"
                      }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <FiLock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={`w-full pl-11 pr-12 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-text-muted ${errors.password ? "border-red-500" : "border-border"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <FiLock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`w-full pl-11 pr-12 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-text-muted ${errors.confirmPassword ? "border-red-500" : "border-border"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.terms) setErrors({ ...errors, terms: undefined });
                  }}
                  className="mt-1 accent-primary"
                />
                <label htmlFor="terms" className="text-sm text-text-muted">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm -mt-2">{errors.terms}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-primary hover:bg-primary-dark text-background font-semibold py-3.5 rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                {registerLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-background border-t-transparent rounded-full" />
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Already have account */}
            <p className="text-center text-sm text-text-muted mt-6">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-sm text-text-muted hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

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
          {toast.type === "error" && <FiAlertCircle className="text-xl shrink-0 text-accent" />}
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
    </>
  );
}