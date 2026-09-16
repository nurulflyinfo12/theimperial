// app/components/auth/RegisterModal.tsx
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
    User,
    Phone,
    CheckCircle,
} from "lucide-react";
// import { useAuth } from "@/app/redux/hook/useAuth";
import { useLoginRegister } from "@/redux/hook/useLogingRegister";
import { useAppSelector } from "@/redux/hook/useApplicationDetails";

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
    isOpen,
    onClose,
    onSwitchToLogin,
}) => {
    //   const { register, isLoading, error } = useAuth();
    const { registerData,
        registerLoading,
        createRegister, registerError } = useLoginRegister()
    const { application } = useAppSelector((state) => state.application);


    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            errors.firstName = "First name is required";
        } else if (formData.firstName.trim().length < 2) {
            errors.firstName = "First name must be at least 2 characters";
        } else if (/[0-9]/.test(formData.firstName)) {
            errors.firstName = "First name cannot contain numbers";
        }

        if (!formData.lastName.trim()) {
            errors.lastName = "Last name is required";
        } else if (formData.lastName.trim().length < 2) {
            errors.lastName = "Last name must be at least 2 characters";
        } else if (/[0-9]/.test(formData.lastName)) {
            errors.lastName = "Last name cannot contain numbers";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Invalid email format";
        }

        if (!formData.phone.trim()) {
            errors.phone = "Phone number is required";
        } else {
            const cleanPhone = formData.phone.replace(/[\s\-()+. ]/g, "");
            if (!/^\d+$/.test(cleanPhone)) {
                errors.phone = "Phone number can only contain digits";
            } else if (cleanPhone.length < 10) {
                errors.phone = "Phone number must be at least 10 digits";
            } else if (cleanPhone.length > 15) {
                errors.phone = "Phone number cannot exceed 15 digits";
            }
        }

        if (!formData.password) {
            errors.password = "Password is required";
        } else if (formData.password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
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
        if (showSuccess) {
            setShowSuccess(false);
            setSuccessMessage("");
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const formattedValue = value.replace(/[^0-9+\s\-()+. ]/g, "");
        setFormData((prev) => ({ ...prev, phone: formattedValue }));
        if (formErrors.phone) {
            setFormErrors((prev) => ({ ...prev, phone: "" }));
        }
        if (showSuccess) {
            setShowSuccess(false);
            setSuccessMessage("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");
        setSuccessMessage("");
        setShowSuccess(false);

        if (!validateForm()) {
            return;
        }

        // CompanyID check
        if (!application?.CompanyID) {
            setLocalError("Company information is missing. Please try again later.");
            return;
        }

        const payload = {
            CompanyID: application.CompanyID, // now guaranteed to be string
            FirstName: formData.firstName.trim(),
            LastName: formData.lastName.trim(),
            Email: formData.email.trim(),
            Phone: formData.phone.trim(),
            Password: formData.password,
        };

        try {
            await createRegister(payload);

            // Success
            setSuccessMessage(
                `Welcome ${formData.firstName}! Your account has been created successfully.`
            );
            setShowSuccess(true);
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
            });
            setFormErrors({});

            setTimeout(() => {
                setShowSuccess(false);
                setSuccessMessage("");
                onClose();
                onSwitchToLogin();
            }, 3000);
        } catch (err: any) {
            setLocalError(err?.message || "Registration failed. Please try again.");
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

            {/* Modal Content */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md relative z-10 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-[#0A2F1F] px-8 py-6 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-xl font-medium tracking-wider text-white">
                            Create Account
                        </h3>
                        <p className="text-[#D4AF37] text-xs mt-1 font-light tracking-widest">
                            Join us for a premium experience
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
                    {/* Success Message */}
                    {showSuccess && successMessage && (
                        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-slideDown">
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-green-800 text-sm font-medium">
                                    {successMessage}
                                </p>
                                <p className="text-green-600 text-xs mt-1">
                                    Redirecting to login in 3 seconds...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {(localError || registerError) && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-red-600 text-sm">{localError || registerError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* First Name */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                First Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <User className="w-4 h-4 text-neutral-400" />
                                </div>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all text-neutral-900 placeholder:text-neutral-400 ${formErrors.firstName
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-neutral-200 focus:border-[#0A2F1F] focus:ring-[#0A2F1F]/20"
                                        }`}
                                    disabled={registerLoading || showSuccess}
                                />
                            </div>
                            {formErrors.firstName && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formErrors.firstName}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                Last Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <User className="w-4 h-4 text-neutral-400" />
                                </div>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all text-neutral-900 placeholder:text-neutral-400 ${formErrors.firstName
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-neutral-200 focus:border-[#0A2F1F] focus:ring-[#0A2F1F]/20"
                                        }`}
                                    disabled={registerLoading || showSuccess}
                                />
                            </div>
                            {formErrors.lastName && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formErrors.lastName}
                                </p>
                            )}
                        </div>

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
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all text-neutral-900 placeholder:text-neutral-400 ${formErrors.firstName
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-neutral-200 focus:border-[#0A2F1F] focus:ring-[#0A2F1F]/20"
                                        }`}
                                    disabled={registerLoading || showSuccess}
                                />
                            </div>
                            {formErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Phone className="w-4 h-4 text-neutral-400" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="01712345678"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all text-neutral-900 placeholder:text-neutral-400 ${formErrors.firstName
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-neutral-200 focus:border-[#0A2F1F] focus:ring-[#0A2F1F]/20"
                                        }`}
                                    disabled={registerLoading || showSuccess}
                                />
                            </div>
                            {formErrors.phone && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
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
                                    placeholder="Min 8 characters"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all text-neutral-900 placeholder:text-neutral-400 ${formErrors.firstName
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                        : "border-neutral-200 focus:border-[#0A2F1F] focus:ring-[#0A2F1F]/20"
                                        }`}
                                    disabled={registerLoading || showSuccess}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                                    disabled={registerLoading || showSuccess}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {formErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4 text-neutral-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all text-neutral-900 placeholder:text-neutral-400 ${formErrors.firstName
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                            : "border-neutral-200 focus:border-[#0A2F1F] focus:ring-[#0A2F1F]/20"
                                        }`}
                                    disabled={registerLoading || showSuccess}
                                />
                            </div>
                            {formErrors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formErrors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        {!showSuccess ? (
                            <button
                                type="submit"
                                disabled={registerLoading}
                                className="w-full bg-[#0A2F1F] text-white py-3.5 rounded-xl font-medium text-sm tracking-widest uppercase transition-all duration-200 hover:bg-[#0A2F1F]/90 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                            >
                                {registerLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        ) : (
                            <div className="w-full bg-green-100 text-green-800 py-3.5 rounded-xl font-medium text-sm tracking-widest uppercase flex items-center justify-center gap-2 mt-2">
                                <CheckCircle className="w-4 h-4" />
                                Account Created!
                            </div>
                        )}
                    </form>

                    {/* Login Link - Hide during success */}
                    {!showSuccess && (
                        <div className="mt-6 text-center">
                            <p className="text-xs text-neutral-500">
                                Already have an account?{" "}
                                <button
                                    onClick={() => {
                                        onClose();
                                        onSwitchToLogin();
                                    }}
                                    className="text-[#0A2F1F] font-bold hover:text-[#D4AF37] transition-colors"
                                >
                                    Sign In
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;