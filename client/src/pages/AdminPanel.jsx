import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Briefcase } from "lucide-react"; // <-- Dodano import Briefcase
import { Link } from "react-router-dom";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/admin/userList",
          {
            withCredentials: true,
          },
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Błąd pobierania użytkowników:", error);
        toast.error("Nie udało się pobrać listy użytkowników.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:3000/admin/remove/${id}`,
        {
          withCredentials: true,
        },
      );

      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.filter((user) => user.id !== id);

        const newTotalPages = Math.ceil(updatedUsers.length / usersPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }

        return updatedUsers;
      });

      toast.success(response.data.message || "Użytkownik został usunięty.");
    } catch (error) {
      console.error("Błąd usuwania użytkownika:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Nie udało się usunąć użytkownika.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full px-6 py-12">
      <div className="flex flex-col w-full max-w-4xl p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl text-zinc-100">
        <div className="mb-8 flex justify-between items-end border-b border-zinc-800/50 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Panel Administratora
            </h2>
            <p className="text-zinc-400 mt-2 text-sm">
              Zarządzaj użytkownikami systemu.
            </p>
          </div>
          <div className="text-sm text-zinc-500 font-medium">
            Łącznie: {users.length}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-zinc-500">
              Ładowanie danych...
            </div>
          ) : currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition-colors gap-4"
              >
                {/* ZDJĘCIE I DANE */}
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-4 mb-2 sm:mb-0 group cursor-pointer"
                >
                  {user.photo ? (
                    <img
                      src={user.photo}
                      className="h-9 w-9 shrink-0 rounded-full border border-zinc-700 object-cover group-hover:border-zinc-500 transition-colors"
                      alt=""
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${user.name}+${user.surname}&background=27272a&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="h-9 w-9 shrink-0 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
                      <User className="h-5 w-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </div>
                  )}

                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-zinc-200 truncate group-hover:text-white group-hover:underline transition-all">
                      {user.name} {user.surname}
                    </span>
                    <span className="text-sm text-zinc-400 truncate">
                      {user.email}
                    </span>
                  </div>
                </Link>

                {/* AKCJE (ROLA, OGŁOSZENIA, USUŃ) */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <span
                    className={`hidden sm:inline-block text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      user.role === "admin"
                        ? "bg-zinc-100 text-zinc-900"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {user.role}
                  </span>

                  {/* PRZYCISK DO OGŁOSZEŃ */}
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                    title="Zobacz ogłoszenia"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden sm:inline">Ogłoszenia</span>
                  </Link>

                  {/* PRZYCISK USUŃ */}
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-3 sm:px-4 py-2 text-sm font-semibold text-red-400 bg-red-400/10 border border-red-400/20 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-500">
              Brak użytkowników do wyświetlenia.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Poprzednia
            </button>

            <span className="text-sm text-zinc-400 font-medium tracking-wide">
              Strona {currentPage} z {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Następna
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;