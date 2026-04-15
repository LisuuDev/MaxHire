import {
  LogIn,
  LogOut,
  MenuIcon,
  PlusSquare,
  CircleUser,
  User,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/logo.svg";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/logout",
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
    <nav className="grid grid-cols-3 items-center px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-zinc-800 bg-zinc-950 relative text-zinc-100 z-50">
      <div className="flex justify-start">
        <Link to="/">
          <img src={logo} alt="logo" className="h-8 w-auto" />
        </Link>
      </div>

      <div className="hidden sm:flex items-center justify-center flex-1 gap-4 md:gap-8 text-zinc-400 px-4">
        <Link to="/" className="hover:text-white transition-colors">
          Strona główna
        </Link>
        <Link to="/browse" className="hover:text-white transition-colors">
          Przeglądaj
        </Link>
        <Link to="/contact" className="hover:text-white transition-colors">
          Kontakt
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className="hover:text-white transition-colors text-red-400 font-bold"
          >
            Panel Admina
          </Link>
        )}
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
          onClick={() => setOpen(!open)}
          className="sm:hidden text-zinc-400 cursor-pointer"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      <div
        className={`absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 py-6 flex flex-col items-start gap-4 px-6 transition-all ${
          open ? "block" : "hidden"
        }`}
      >
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="text-zinc-300 hover:text-white py-2"
        >
          Strona główna
        </Link>
        <Link
          to="/browse"
          onClick={() => setOpen(false)}
          className="text-zinc-300 hover:text-white py-2"
        >
          Przeglądaj
        </Link>
        <Link
          to="/contact"
          onClick={() => setOpen(false)}
          className="text-zinc-300 hover:text-white py-2"
        >
          Kontakt
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="text-red-400 hover:text-red-300 py-2 font-medium"
          >
            Panel admina
          </Link>
        )}

        <div className="w-full h-px bg-zinc-800 my-2"></div>

        {user ? (
          <>
            <Link
              to={`/profile/${user.id || user._id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 text-zinc-400 uppercase text-xs font-bold"
            >
              {user.photo ? (
                <img
                  src={user.photo}
                  className="h-8 w-8 rounded-full object-cover"
                  alt=""
                />
              ) : (
                <User className="h-4 w-4" />
              )}
              Profil: {user.name}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full py-3 font-bold text-zinc-950 bg-zinc-100 rounded-lg cursor-pointer mt-2"
            >
              Wyloguj
            </button>
          </>
        ) : (
          <Link to="/login" className="w-full" onClick={() => setOpen(false)}>
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
