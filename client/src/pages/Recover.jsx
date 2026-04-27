import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "";

const Recover = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/backend/edit/user/forgetPassword`, { email });
      toast.success("Link do resetowania wysłany na email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Błąd wysyłania");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Hasła nie są identyczne");
    }
    setIsLoading(true);
    try {
      await axios.patch(`${API_URL}/backend/edit/user/changePassword`, { token, password });
      toast.success("Hasło zostało zmienione!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Link wygasł lub jest niepoprawny");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-6">
      <div className="flex flex-col w-full max-w-md p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl text-zinc-100">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {token ? "Nowe hasło" : "Odzyskaj konto"}
        </h2>
        <p className="text-zinc-400 mt-2 text-sm">
          {token 
            ? "Wprowadź nowe hasło dla swojego konta." 
            : "Wyślemy Ci link do zmiany hasła."}
        </p>

        <form className="mt-8" onSubmit={token ? handleSetNewPassword : handleRequestReset}>
          {!token ? (
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-zinc-200">
                Email
              </label>
              <input
                required
                disabled={isLoading}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twój@email.example"
                className="w-full p-3 mb-8 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              <div>
                <label className="block mb-2 text-sm font-semibold text-zinc-200">
                  Nowe hasło
                </label>
                <input
                  required
                  disabled={isLoading}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-zinc-200">
                  Powtórz hasło
                </label>
                <input
                  required
                  disabled={isLoading}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 font-bold text-zinc-950 bg-zinc-100 rounded-lg hover:bg-white hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-100 focus:ring-offset-zinc-900 transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? "Przetwarzanie..." : (token ? "Zapisz hasło" : "Wyślij link")}
          </button>

          <p className="text-center text-zinc-500 mt-8 text-sm">
            Pamiętasz hasło?{" "}
            <button
              type="button"
              disabled={isLoading}
              className="text-white font-semibold hover:underline cursor-pointer disabled:opacity-50"
              onClick={() => navigate("/login?mode=login")}
            >
              Wróć do logowania
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Recover;