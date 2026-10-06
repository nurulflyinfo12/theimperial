"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiCalendar, FiUsers } from "react-icons/fi";

interface SearchData {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    adults: string;
    children: string;
    rooms?: number;
    childrenAges?: number[];
}

interface BookingSearchProps {
    searchData: SearchData;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSearchClick: () => void;
    onGuestChange?: (guestsData: { rooms: number; adults: number; children: number; childrenAges: number[] }) => void;
}

const BookingSearch: React.FC<BookingSearchProps> = ({
    searchData,
    handleSearchChange,
    onSearchClick,
    onGuestChange,
}) => {
    const [errors, setErrors] = useState({ checkIn: "", checkOut: "" });
    const [ageError, setAgeError] = useState("");
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);

    const [rooms, setRooms] = useState(1);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [childrenAges, setChildrenAges] = useState<number[]>([]);

    const guestSectionRef = useRef<HTMLDivElement>(null);
    const hasInitialSearched = useRef(false);

    // ─── Auto-fill default dates (only once) ───────────────────────────────
    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStr = today.toISOString().split("T")[0];
        const tomorrowStr = tomorrow.toISOString().split("T")[0];

        if (!searchData.checkIn) {
            handleSearchChange({
                target: { name: "checkIn", value: todayStr },
            } as React.ChangeEvent<HTMLInputElement>);
        }
        if (!searchData.checkOut) {
            handleSearchChange({
                target: { name: "checkOut", value: tomorrowStr },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    }, []); // run only on mount

    // ─── Close dropdown on outside click ───────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                guestSectionRef.current &&
                !guestSectionRef.current.contains(event.target as Node)
            ) {
                setShowGuestDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ─── Sync local guest state when dropdown opens ────────────────────────
    useEffect(() => {
        if (showGuestDropdown) {
            setRooms(Number(searchData.rooms) || 1);
            setAdults(Number(searchData.adults) || 1);
            setChildren(Number(searchData.children) || 0);
            setChildrenAges(searchData.childrenAges || []);
            setTimeout(() => validateChildrenAges(), 10);
        }
    }, [showGuestDropdown]);

    // ─── Push guest values to parent ───────────────────────────────────────
    const updateParentGuests = () => {
        onGuestChange?.({ rooms, adults, children, childrenAges });
    };

    useEffect(() => {
        if (!showGuestDropdown) {
            updateParentGuests();
        }
    }, [showGuestDropdown, rooms, adults, children, childrenAges]);

    // ─── Initial search with default values (once) ─────────────────────────
    useEffect(() => {
        if (
            !hasInitialSearched.current &&
            searchData.checkIn &&
            searchData.checkOut
        ) {
            hasInitialSearched.current = true;
            // small delay so parent state is ready
            const t = setTimeout(() => {
                updateParentGuests();
                onSearchClick();
            }, 50);
            return () => clearTimeout(t);
        }
    }, [searchData.checkIn, searchData.checkOut]);

    // ─── Validation helpers ────────────────────────────────────────────────
    const validateChildrenAges = (): boolean => {
        if (children === 0) {
            setAgeError("");
            return true;
        }
        const hasUnselectedAge = childrenAges.some((age) => age === 0);
        if (hasUnselectedAge) {
            setAgeError("Please select age for all children");
            return false;
        }
        setAgeError("");
        return true;
    };

    const validateDates = (): boolean => {
        const newErrors = { checkIn: "", checkOut: "" };
        let isValid = true;

        if (!searchData.checkIn || !searchData.checkOut) {
            newErrors.checkIn = "Please select both dates";
            newErrors.checkOut = "Please select both dates";
            isValid = false;
        } else {
            const checkInDate = new Date(searchData.checkIn);
            const checkOutDate = new Date(searchData.checkOut);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (checkInDate < today) {
                newErrors.checkIn = "Check-in date cannot be in the past";
                isValid = false;
            }
            if (checkOutDate <= checkInDate) {
                newErrors.checkOut = "Check-out date must be after Check-in date";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // ─── Search handler (used by both buttons) ─────────────────────────────
    const handleSearch = () => {
        const datesValid = validateDates();
        const agesValid = validateChildrenAges();

        if (!agesValid) {
            setShowGuestDropdown(true);
            return;
        }

        if (datesValid && agesValid) {
            updateParentGuests();
            onSearchClick();
            setShowGuestDropdown(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleSearchChange(e);
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    useEffect(() => {
        if (searchData.checkIn || searchData.checkOut) {
            validateDates();
        }
    }, [searchData.checkIn, searchData.checkOut]);

    const openDatePicker = (name: string) => {
        const input = document.querySelector(
            `input[name="${name}"]`
        ) as HTMLInputElement;
        if (input) {
            input.focus();
            input.showPicker?.();
        }
    };

    // ─── Counter helpers ───────────────────────────────────────────────────
    const increaseRooms = () => {
        const newRooms = rooms + 1;
        setRooms(newRooms);
        if (adults < newRooms) setAdults(newRooms);
    };

    const decreaseRooms = () => {
        if (rooms > 1) {
            const newRooms = rooms - 1;
            setRooms(newRooms);
            const maxChildren = newRooms * 2;
            if (children > maxChildren) {
                setChildren(maxChildren);
                setChildrenAges((prev) => prev.slice(0, maxChildren));
            }
        }
    };

    const increaseAdults = () => setAdults(adults + 1);
    const decreaseAdults = () => {
        if (adults > rooms) setAdults(adults - 1);
    };

    const increaseChildren = () => {
        const maxChildren = rooms * 2;
        if (children < maxChildren) {
            setChildren((prev) => prev + 1);
            setChildrenAges((prev) => [...prev, 0]);
        }
    };

    const decreaseChildren = () => {
        if (children > 0) {
            setChildren((prev) => prev - 1);
            setChildrenAges((prev) => prev.slice(0, -1));
        }
    };
    return (
        <section className="-mt-20 relative z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-white/50 p-4 sm:p-6">
                    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 rounded-2xl shadow-inner overflow-visible">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70">

                            {/* Check In */}
                            <div onClick={() => openDatePicker("checkIn")} className="p-4 sm:p-5 transition-all duration-300 flex gap-4 items-center group cursor-pointer">
                                <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 relative flex-shrink-0">
                                    <FiCalendar className="w-5 h-5 z-10 relative" />
                                    <input type="date" name="checkIn" value={searchData.checkIn} onChange={handleDateChange} min={new Date().toISOString().split("T")[0]} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1">Check In</label>
                                    <input type="date" name="checkIn" value={searchData.checkIn} onChange={handleDateChange} min={new Date().toISOString().split("T")[0]} className="w-full font-semibold text-sm text-slate-800 bg-transparent focus:outline-none focus:text-emerald-600 transition-colors" />
                                    {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>}
                                </div>
                            </div>

                            {/* Check Out */}
                            <div onClick={() => openDatePicker("checkOut")} className="p-4 sm:p-5 transition-all duration-300 flex gap-4 items-center group cursor-pointer">
                                <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 relative flex-shrink-0">
                                    <FiCalendar className="w-5 h-5 z-10 relative" />
                                    <input type="date" name="checkOut" value={searchData.checkOut} onChange={handleDateChange} min={searchData.checkIn || new Date().toISOString().split("T")[0]} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1">Check Out</label>
                                    <input type="date" name="checkOut" value={searchData.checkOut} onChange={handleDateChange} min={searchData.checkIn || new Date().toISOString().split("T")[0]} className="w-full font-semibold text-sm text-slate-800 bg-transparent focus:outline-none focus:text-emerald-600 transition-colors" />
                                    {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>}
                                </div>
                            </div>

                            {/* Guests Dropdown */}
                            <div className="relative" ref={guestSectionRef}>
                                <div onClick={() => setShowGuestDropdown(prev => !prev)} className="relative flex gap-4 items-center group p-4 sm:p-5 transition-all duration-300 cursor-pointer">
                                    <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
                                        <FiUsers className="w-5 h-5" />
                                    </div>
                                    <button type="button" className="flex-1 flex items-center justify-between text-left min-w-0 cursor-pointer">
                                        <div className="truncate">
                                            <p className="font-semibold text-slate-800 text-sm">
                                                {adults} adults
                                                {children > 0 && `, ${children} ${children === 1 ? "child" : "children"}`}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {rooms} room{rooms > 1 ? 's' : ''} • Max 2 children per room
                                            </p>
                                        </div>
                                        <svg className={`w-5 h-5 transition-transform duration-300 text-slate-400 flex-shrink-0 ${showGuestDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {showGuestDropdown && (
                                    <div className="absolute top-full left-0 right-0 -mt-2 md:left-auto md:right-0 md:w-[360px] w-full bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] p-5 z-[9999] max-h-[85vh] overflow-auto">
                                        <div className="space-y-6 text-slate-800">
                                            {/* Rooms */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-base">Rooms</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">Number of rooms</p>
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <button type="button" onClick={decreaseRooms} disabled={rooms === 1} className={`w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-lg font-medium transition-all ${rooms === 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 hover:border-slate-400 active:scale-95"}`}>–</button>
                                                    <span className="font-bold text-xl w-6 text-center">{rooms}</span>
                                                    <button type="button" onClick={increaseRooms} className="cursor-pointer w-8 h-8 rounded-full border border-blue-300 flex items-center justify-center text-lg font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-400 active:scale-95 transition-all">+</button>
                                                </div>
                                            </div>

                                            {/* Adults */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-base">Adults</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">Ages 18+</p>
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <button type="button" onClick={decreaseAdults} disabled={adults <= rooms} className={`w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-lg font-medium transition-all ${adults <= rooms ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 hover:border-slate-400 active:scale-95"}`}>–</button>
                                                    <span className="font-bold text-xl w-6 text-center">{adults}</span>
                                                    <button type="button" onClick={increaseAdults} className="cursor-pointer w-8 h-8 rounded-full border border-blue-300 flex items-center justify-center text-lg font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-400 active:scale-95 transition-all">+</button>
                                                </div>
                                            </div>

                                            {/* Children */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-base">Children</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">Ages 0-17 (max 2 per room)</p>
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <button type="button" onClick={decreaseChildren} disabled={children === 0} className={`w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-lg font-medium transition-all ${children === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 hover:border-slate-400 active:scale-95"}`}>–</button>
                                                    <span className="font-bold text-xl w-6 text-center">{children}</span>
                                                    <button type="button" onClick={increaseChildren} disabled={children >= rooms * 2} className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg font-medium transition-all ${children >= rooms * 2 ? "opacity-30 cursor-not-allowed border-slate-300" : "border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 active:scale-95"}`}>+</button>
                                                </div>
                                            </div>

                                            {children > 0 && (
                                                <div className="pt-4 border-t border-slate-200">
                                                    <p className="text-sm text-slate-600 mb-4 font-medium">
                                                        Select children&apos;s ages for accurate pricing:
                                                    </p>
                                                    <div className="space-y-3">
                                                        {childrenAges.map((age, index) => (
                                                            <select
                                                                key={index}
                                                                value={age}
                                                                onChange={(e) => {
                                                                    const updated = [...childrenAges];
                                                                    updated[index] = Number(e.target.value);
                                                                    setChildrenAges(updated);
                                                                    if (ageError) setAgeError("");
                                                                }}
                                                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                                            >
                                                                <option value={0}>Select age...</option>
                                                                {Array.from({ length: 18 }, (_, i) => (
                                                                    <option key={i} value={i + 1}>
                                                                        {i + 1} {i + 1 === 1 ? "year" : "years"} old
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ))}
                                                    </div>
                                                    {ageError && (
                                                        <p className="text-red-500 text-sm mt-3 font-medium">{ageError}</p>
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                onClick={handleSearch}
                                                className="w-full py-3 text-sm font-bold tracking-wider uppercase rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-blue-500/40 active:scale-[0.98] transition-all"
                                            >
                                                Search Properties
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* External Search Button */}
                    <div className="flex justify-center -mb-8 mt-6 relative z-10 px-4">
                        <button
                            onClick={handleSearch}
                            className="inline-flex items-center justify-center px-10 py-4 text-sm font-bold tracking-widest uppercase rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 transition-all duration-200 w-full sm:w-auto cursor-pointer"
                        >
                            Search Properties
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BookingSearch;