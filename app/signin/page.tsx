"use client";

import { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/redux/hook/useApplicationDetails";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const { application } = useAppSelector((state) => state.application);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email or phone number is required";
    } else if (email.includes("@") && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);

    console.log("Sign in attempt:", { email, password, rememberMe });

    setTimeout(() => {
      setLoading(false);
    //   onClose(); 
    }, 1200);
  };

//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

  // Route to Sign Up Page
  const handleCreateAccountClick = () => {
    // onClose();           // Close modal first
    router.push("/signup");   // Then navigate to full signup page
  };

  const logoSrc =
    typeof application?.Logo === "string" && application.Logo.trim().length > 0
      ? application.Logo
      : "/logo.png";

//   if (!isOpen) return null;

  return (
    <div 
      className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12"
    //   onClick={handleBackdropClick}   
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Close Button */}
        {/* <button
        //   onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-foreground z-10 cursor-pointer"
        >
          <FiX size={24} />
        </button> */}

        <div className="p-8 pt-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-2 rounded-md">
              <Image
                src={logoSrc}
                alt={application?.ApplicationName || "Resort"}
                width={160}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          <h2 className="text-3xl font-serif font-bold text-center text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-text-muted mb-8">
            Sign in to manage your bookings
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <FiMail size={20} />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="example@email.com or +880..."
                  className={`w-full pl-11 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-text-muted ${
                    errors.email ? "border-red-500" : "border-border"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-text-muted ${
                    errors.password ? "border-red-500" : "border-border"
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
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-text-muted">Remember me</span>
              </label>

              <Link href="#" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-background font-semibold py-3.5 rounded-lg transition-all disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{" "}
            <button
              onClick={handleCreateAccountClick}
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}