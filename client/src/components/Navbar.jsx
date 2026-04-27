import {
  LogIn,
  LogOut,
  MenuIcon,
  PlusSquare,
  CircleUser,
  User,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "/logo.svg";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "";

const Navbar = () => {
  const [mobileNavbarOpen, setMobileNavbarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    setMobileNavbarOpen(false);
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/backend/logout`,
        {},
        { withCredentials: true },
      );
      setUser(null);
      localStorage.removeItem("user");
      toast.success("Wylogowano");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "Admin";

  return (
    <nav className="grid grid-cols-[auto_1fr_auto] items-center px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-zinc-800 bg-zinc-950 relative text-zinc-100 z-50">
      <div className="flex justify-start">
        <Link to="/">
          <img src={logo} alt="logo" className="h-8 w-auto" />
        </Link>
      </div>

      <div className="hidden sm:flex items-center justify-center flex-1 gap-4 md:gap-8 text-zinc-400 px-4">
        <Link to="/" className="hover:text-white transition-colors whitespace-nowrap">
          Strona główna
        </Link>
        <Link to="/browse" className="hover:text-white transition-colors whitespace-nowrap">
          Przeglądaj
        </Link>
        <Link to="/contact" className="hover:text-white transition-colors whitespace-nowrap">
          Kontakt
        </Link>
      </div>

      <div className="flex items-center justify-end">
        <div className="hidden sm:flex items-center relative" ref={dropdownRef}>
          {user ? (
            <div className="relative flex items-center gap-3">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 focus:outline-none cursor-pointer"
              >
                <span className="text-zinc-300 font-medium text-sm max-w-[120px] truncate">
                  {user.name}
                </span>

                {user.photo ? (
                  <img
                    src={user.photo}
                    className="h-9 w-9 rounded-full border border-zinc-700 object-cover"
                    alt=""
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center">
                    <User className="h-5 w-5 text-zinc-500" />
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl py-2 z-50">
                  <Link
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 cursor-pointer"
                    to={`/CreateOffer`}
                  >
                    <PlusSquare className="h-4 w-4" /> Stwórz post
                  </Link>
                  <div className="h-px bg-zinc-800 my-1 mx-2"></div>
                  <Link
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 cursor-pointer"
                    to={`/profile/${user.id || user._id}`}
                  >
                    <CircleUser className="h-4 w-4" /> Mój profil
                  </Link>
                  <div className="h-px bg-zinc-800 my-1 mx-2"></div>
                  {isAdmin && (
                    <>
                      <Link
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-900 cursor-pointer"
                        to="/admin"
                      >
                        <ShieldAlert className="h-4 w-4" /> Panel Admina
                      </Link>
                      <div className="h-px bg-zinc-800 my-1 mx-2"></div>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-900 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Wyloguj
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="px-6 py-2.5 font-bold text-zinc-950 bg-zinc-100 rounded-lg hover:bg-white transition-all cursor-pointer whitespace-nowrap">
                Zaloguj się
              </button>
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileNavbarOpen(!mobileNavbarOpen)}
          className="sm:hidden text-zinc-400 cursor-pointer"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      <div
        className={`absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 py-6 flex flex-col items-start gap-4 px-6 transition-all ${
          mobileNavbarOpen ? "block" : "hidden"
        }`}
      >
        <Link to="/" className="text-zinc-300 hover:text-white py-2">
          Strona główna
        </Link>
        <Link to="/browse" className="text-zinc-300 hover:text-white py-2">
          Przeglądaj
        </Link>
        <Link to="/contact" className="text-zinc-300 hover:text-white py-2">
          Kontakt
        </Link>

        <div className="w-full h-px bg-zinc-800 my-2"></div>

        {user ? (
          <>
            <div className="w-full relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      className="h-8 w-8 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="font-bold text-sm uppercase">{user.name}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {mobileDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-2 z-50">
                  <Link
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                    to={`/CreateOffer`}
                  >
                    <PlusSquare className="h-4 w-4" /> Stwórz post
                  </Link>
                  <div className="h-px bg-zinc-800 my-1 mx-2"></div>
                  <Link
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                    to={`/profile/${user.id || user._id}`}
                  >
                    <CircleUser className="h-4 w-4" /> Mój profil
                  </Link>
                  <div className="h-px bg-zinc-800 my-1 mx-2"></div>
                  {isAdmin && (
                    <>
                      <Link
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 cursor-pointer"
                        to="/admin"
                      >
                        <ShieldAlert className="h-4 w-4" /> Panel Admina
                      </Link>
                      <div className="h-px bg-zinc-800 my-1 mx-2"></div>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Wyloguj
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="w-full">
            <button className="w-full py-3 font-bold text-zinc-950 bg-zinc-100 rounded-lg cursor-pointer">
              Zaloguj się
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
