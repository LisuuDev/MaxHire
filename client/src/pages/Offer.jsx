import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Globe, Mail, User, Phone } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "";

const Offer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);

  const isOwner = loggedInUser && (loggedInUser.id === offer?.user_id);
  const isAdmin = loggedInUser && (loggedInUser.role === "admin");

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/backend/offer/getOffer/${id}`, { withCredentials: true })
      .then(res => {
        const data = res.data.message;
        if (Array.isArray(data) && data.length > 0) {
          setOffer(data[0]);
        } else {
          setOffer(null);
        }
      })
      .catch(() => setError('Nie udało się załadować oferty'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-20 text-black font-bold uppercase tracking-widest">Wczytywanie...</div>;
  if (error || !offer) return <div className="max-w-4xl mx-auto px-6 py-20 text-red-600 font-bold uppercase tracking-widest">{error}</div>;

  const techTags = typeof offer.tech === 'string' 
    ? JSON.parse(offer.tech.startsWith('"') ? JSON.parse(offer.tech) : offer.tech) 
    : (offer.tech || []);
  const links = offer.links ? (typeof offer.links === 'string' ? JSON.parse(offer.links) : offer.links) : {};

  return (
    <div className="w-full min-h-screen font-sans antialiased text-[#18181b] bg-white/30 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-8 py-12">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-black/60 hover:text-black transition-colors mb-12 cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">Wróć</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-8">
            <header className="flex items-center gap-6 p-8 bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-sm">
              <div className="w-20 h-20 bg-white rounded-2xl shrink-0 flex items-center justify-center shadow-lg overflow-hidden border border-black/5">
                {offer.photo ? (
                  <img 
                    src={offer.photo} 
                    alt={offer.company} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-black" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">{offer.title}</h1>
                <p className="text-zinc-600 text-lg font-medium">{offer.company}</p>
              </div>
            </header>

            <section className="p-8 bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6">
                Opis stanowiska
              </h2>
              <div className="text-zinc-800 leading-relaxed text-[17px] whitespace-pre-wrap">
                {offer.description}
              </div>
            </section>

            <section className="p-8 bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6">
                Stack Technologiczny
              </h2>
              <div className="flex flex-wrap gap-3">
                {techTags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-5 py-2.5 bg-black text-white text-[11px] font-bold rounded-xl uppercase tracking-widest"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <aside className="sticky top-12 space-y-6">
              <div className="p-8 border border-white/40 rounded-3xl bg-white/60 backdrop-blur-md shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-8 border-b border-black/5 pb-2">
                  Ogłoszeniodawca
                </h3>
                
                <Link 
                  to={`/profile/${offer.user_id}`} 
                  className="flex items-center gap-4 mb-8 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-black/10 shadow-sm overflow-hidden">
                    {offer.photo ? (
                      <img 
                        src={offer.photo} 
                        alt={`${offer.name} ${offer.surname}`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-black" />
                    )}
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-black decoration-zinc-300 underline-offset-4">
                      {offer.name} {offer.surname}
                    </p>
                    <p className="text-xs text-zinc-500 font-medium">Zobacz profil</p>
                  </div>
                </Link>

                <div className="flex flex-col gap-2">
                  {Object.entries(links).map(([name, url]) => (
                    <a 
                      key={name}
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between text-zinc-600 hover:text-black text-sm font-semibold p-3 rounded-xl hover:bg-white/80 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Globe size={16} />
                        <span className="capitalize">{name}</span>
                      </div>
                      <ExternalLink size={14} className="opacity-40" />
                    </a>
                  ))}
                  
                  <a href={`mailto:${offer.email}`} className="flex items-center justify-between text-zinc-600 hover:text-black text-sm font-semibold p-3 rounded-xl hover:bg-white/80 transition-all">
                    <div className="flex items-center gap-3">
                      <Mail size={16} />
                      <span>Email</span>
                    </div>
                    <ExternalLink size={14} className="opacity-40" />
                  </a>

                  {offer.phone && (
                    <div className="select-text">
                      {!showPhone ? (
                        <button 
                          onClick={() => setShowPhone(true)}
                          className="w-full flex items-center justify-between text-zinc-600 hover:text-black text-sm font-semibold p-3 rounded-xl hover:bg-white/80 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Phone size={16} />
                            <span>xxx-xxx-xxx</span>
                          </div>
                          <span className="text-[10px] uppercase tracking-tighter opacity-40 ">Pokaż</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 text-black text-sm font-semibold p-3">
                          <Phone size={16} />
                          <span className="select-all cursor-text">{offer.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isOwner || isAdmin ? (
                <Link 
                  to={`/editOffer/${id}`}
                  className="w-full bg-black text-white text-[13px] font-bold uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-zinc-800 transition-all text-center flex items-center justify-center shadow-xl cursor-pointer"
                >
                  Edytuj ogłoszenie
                </Link>
              ) : (
                <a 
                  href={`mailto:${offer.email}?subject=Aplikacja: ${offer.title}`}
                  className="w-full bg-black text-white text-[13px] font-bold uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-zinc-800 transition-all text-center flex items-center justify-center shadow-xl"
                >
                  Aplikuj Teraz
                </a>
              )}
            </aside>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Offer;