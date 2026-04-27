import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, DollarSign, Search } from 'lucide-react';
import Listings from "../components/Listings";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "";

const Browse = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, ...newParams });
  };

  const commitSearch = () => {
    if (localSearch !== searchTerm) {
      updateParams({ search: localSearch, page: 1 });
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/backend/offers?page=${page}&search=${searchTerm}`, { withCredentials: true })
      .then(res => {
        if (res.data && Array.isArray(res.data.offers)) {
          setOffers(res.data.offers);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setOffers([]);
          setTotalPages(1);
        }
      })
      .catch(() => setError('Nie udało się załadować ofert'))
      .finally(() => setLoading(false));
  }, [page, searchTerm]);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  return (
    <div className="min-h-screen p-8 font-sans w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-12 text-black">Przeglądaj ogłoszenia</h1>

      <div className="my-6">
        <div className="flex gap-3">
          <div className="relative grow flex gap-3">
            <div className="relative grow">
              <input
                type="text"
                placeholder="Szukaj po nazwie lub technologii..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitSearch()}
                onBlur={commitSearch}
                className="w-full bg-[#070709] text-white border border-[#1f1f22] rounded-2xl px-6 py-4 outline-none transition-all duration-200 focus:border-[#3f3f46] focus:bg-[#111114] placeholder:text-zinc-500 font-medium"
              />
              {localSearch && (
                <button 
                  onClick={() => { setLocalSearch(''); setSearchParams({}); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white text-[10px] cursor-pointer font-bold uppercase tracking-widest"
                >
                  Reset
                </button>
              )}
            </div>
            
            <button 
              onClick={commitSearch}
              className="h-[58px] aspect-square flex items-center justify-center bg-[#070709] border border-[#1f1f22] rounded-2xl text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all duration-200 cursor-pointer"
            >
              <Search size={20} />
            </button>
          </div>

          <div className="relative group">
            <button
              disabled
              className="h-[58px] aspect-square flex items-center justify-center bg-[#070709] border border-[#1f1f22] rounded-2xl text-zinc-500  cursor-not-allowed transition-all duration-200"
            >
              <SlidersHorizontal size={18} />
              <DollarSign
                size={12}
                className="absolute top-2.5 right-2.5 text-zinc-500"
              />
            </button>
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#18181b] text-zinc-300 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#3f3f46] shadow-2xl z-50">
              Funkcja Premium
            </span>
          </div>
        </div>
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 my-5">
          <button
            onClick={() => { updateParams({ page: Math.max(page - 1, 1) }); window.scrollTo(0,0); }}
            disabled={page === 1 || loading}
            className="text-[10px] font-bold text-[#f4f4f5] bg-[#070709] border border-[#1f1f22] px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-[#18181b] disabled:opacity-20 transition-all cursor-pointer"
          >
            Wstecz
          </button>
          
          <span className="text-[#71717a] text-[11px] font-bold uppercase tracking-widest">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => { updateParams({ page: Math.min(page + 1, totalPages) }); window.scrollTo(0,0); }}
            disabled={page === totalPages || loading}
            className="text-[10px] font-bold text-[#f4f4f5] bg-[#070709] border border-[#1f1f22] px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-[#18181b] disabled:opacity-20 transition-all cursor-pointer"
          >
            Dalej
          </button>
        </div>
      )}

      <Listings 
        offers={offers} 
        loading={loading} 
        error={error} 
        onTagClick={(tag) => updateParams({ search: tag, page: 1 })}
      />

      {!loading && !error && totalPages > 1 && offers?.length > 3 && (
        <div className="flex justify-center items-center gap-6 my-3">
          <button
            onClick={() => { updateParams({ page: Math.max(page - 1, 1) }); window.scrollTo(0,0); }}
            disabled={page === 1 || loading}
            className="text-[10px] font-bold text-[#f4f4f5] bg-[#070709] border border-[#1f1f22] px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-[#18181b] disabled:opacity-20 transition-all cursor-pointer"
          >
            Wstecz
          </button>
          
          <span className="text-[#71717a] text-[11px] font-bold uppercase tracking-widest">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => { updateParams({ page: Math.min(page + 1, totalPages) }); window.scrollTo(0,0); }}
            disabled={page === totalPages || loading}
            className="text-[10px] font-bold text-[#f4f4f5] bg-[#070709] border border-[#1f1f22] px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-[#18181b] disabled:opacity-20 transition-all cursor-pointer"
          >
            Dalej
          </button>
        </div>
      )}
    </div>
  );
};

export default Browse;