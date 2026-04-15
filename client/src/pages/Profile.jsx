import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ExternalLink,
  Camera,
  Plus,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const { id } = useParams();
  const { user: loggedInUser, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({ email: "", phone: "" });
  const fileInputRef = useRef(null);

  const isOwner = loggedInUser && (loggedInUser.id === id);
  const isAdmin = loggedInUser && (loggedInUser.role === "admin");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email);
  const isPhoneValid = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(editForm.phone);
  const canSave = isEmailValid && isPhoneValid && !isSubmitting;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, offersRes] = await Promise.all([
        axios.get(`http://localhost:3000/profile/getProfile/${id}`, { withCredentials: true }),
        axios.get(`http://localhost:3000/offer/user/${id}`, { withCredentials: true })
      ]);

      if (profileRes.data.message && profileRes.data.message.length > 0) {
        const userData = profileRes.data.message[0];
        setProfile(userData);
        setEditForm({ email: userData.email, phone: userData.phone || "" });
      }

      const offersData = offersRes.data.message;
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

const handleUpdateProfile = async () => {
    if (!canSave) return;
    setIsSubmitting(true);
    try {
      const res = await axios.patch(`http://localhost:3000/edit/user/${id}`, editForm, { withCredentials: true });
      const updated = { ...profile, ...editForm };
      setProfile(updated); 
      if (isOwner) {
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
      setIsEditing(false);
      toast.success(res.data.message || "Profil zaktualizowany");
    } catch (e) {
      toast.error(e.response?.data?.message || "Błąd zapisu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("profilePhoto", file);
    const uploadToast = toast.loading("Wgrywanie...");
    try {
      await axios.post(
        "http://localhost:3000/upload/profilePhoto",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const usersRes = await axios.get(`http://localhost:3000/profile/getProfile/${id}`, { withCredentials: true });
      const updatedMe = usersRes.data.message && usersRes.data.message[0];
      if (updatedMe) {
        setUser(updatedMe);
        localStorage.setItem("user", JSON.stringify(updatedMe));
        setProfile(updatedMe);
        toast.success("Zdjęcie zmienione", { id: uploadToast });
      }
    } catch (error) {
      toast.error("Błąd", { id: uploadToast });
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 font-black uppercase italic tracking-widest text-zinc-900">
        Ładowanie...
      </div>
    );

  if (!profile)
    return (
      <div className="text-zinc-950 flex items-center justify-center font-bold py-20">
        Użytkownik nie istnieje.
      </div>
    );

  return (
    <div className="text-zinc-950 pb-24 relative z-10">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

      <div className="relative h-48 bg-white/10 border-b border-zinc-200 backdrop-blur-sm">
        <div className="absolute -bottom-16 left-6 md:left-16 lg:left-32">
          <div className="relative group">
            {profile.photo ? (
              <img src={profile.photo} className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white shadow-xl bg-white" alt="" />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white shadow-xl bg-white flex items-center justify-center">
                <User className="w-20 h-20 text-zinc-300" />
              </div>
            )}
            {isOwner && (
              <div
                onClick={() => !isSubmitting && fileInputRef.current.click()}
                className={`absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Camera className="text-white w-8 h-8" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20 px-6 md:px-16 lg:px-32 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic text-zinc-900">
              {profile.name} {profile.surname}
            </h1>
            <div className="flex flex-wrap gap-4 mt-3 text-zinc-700 font-bold">
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm">
                <Mail className={`w-4 h-4 shrink-0 ${isEditing && !isEmailValid ? 'text-red-500' : 'text-zinc-400'}`} />
                {isEditing ? (
                  <input 
                    disabled={isSubmitting}
                    className="bg-transparent outline-none border-b border-zinc-300 focus:border-zinc-900 min-w-[180px]"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                ) : profile.email}
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm">
                <Phone className={`w-4 h-4 shrink-0 ${isEditing && !isPhoneValid ? 'text-red-500' : 'text-zinc-400'}`} />
                {isEditing ? (
                  <input 
                    disabled={isSubmitting}
                    className="bg-transparent outline-none border-b border-zinc-300 focus:border-zinc-900 min-w-[120px]"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                ) : profile.phone || "Brak numeru"}
              </div>
            </div>
          </div>
          {(isOwner || isAdmin) && (
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleUpdateProfile} 
                    disabled={!canSave}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-tighter transition-all shadow-lg active:scale-95 cursor-pointer ${canSave ? 'bg-zinc-950 text-white hover:bg-zinc-800' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                  >
                    {isSubmitting ? "Czekaj..." : <><Check className="w-5 h-5" /> Zapisz</>}
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setEditForm({ email: profile.email, phone: profile.phone || "" }); }} 
                    disabled={isSubmitting} 
                    className={`flex items-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-900 px-4 py-3 rounded-xl font-bold transition-all shadow-sm uppercase text-xs cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
                  >
                    <X className="w-4 h-4" /> Anuluj
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-zinc-950 text-white px-8 py-3 rounded-xl font-black uppercase tracking-tighter hover:bg-zinc-800 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Edytuj Profil
                </button>
              )}
            </div>
          )}
        </div>

        <div className="h-px bg-zinc-200 my-12 w-full"></div>

        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-zinc-400" />
              <h2 className="text-2xl font-black uppercase tracking-tighter italic text-zinc-800 underline decoration-zinc-300 underline-offset-8">
                Oferty ({offers.length})
              </h2>
            </div>
            {isOwner && (
              <Link
                className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-900 px-4 py-2 rounded-xl font-bold hover:bg-white transition-all shadow-sm uppercase text-xs cursor-pointer"
                to={`/CreateOffer`}
              >
                <Plus className="w-4 h-4" />Dodaj ogłoszenie
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.length > 0 ? (
              offers.map((offer) => {
                let techTags = [];
                try {
                  if (offer.tech) {
                    const first = typeof offer.tech === "string" ? JSON.parse(offer.tech) : offer.tech;
                    techTags = typeof first === "string" ? JSON.parse(first) : first;
                  }
                } catch (e) { techTags = []; }

                return (
                  <div key={offer.id} className="group bg-white/60 backdrop-blur-md border border-zinc-200 p-6 rounded-2xl hover:border-zinc-400 hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900 leading-tight">
                          <Link className="cursor-pointer" to={`/offer/${offer.id}`}>{offer.title}</Link>
                        </h3>
                        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-1">{offer.company}</p>
                      </div>
                      <Link className="cursor-pointer" to={`/offer/${offer.id}`}>
                        <ExternalLink className="w-5 h-5 text-zinc-300 group-hover:text-zinc-950 transition-colors" />
                      </Link>
                    </div>
                    <p className="text-zinc-700 text-sm leading-relaxed mb-6 line-clamp-3 font-semibold">{offer.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(techTags) && techTags.map((t, idx) => (
                        <span key={idx} className="text-[9px] font-black bg-white border border-zinc-200 px-2.5 py-1 rounded-md uppercase text-zinc-600 shadow-sm antialiased">{t}</span>
                      ))}
                    </div>
                    {offer.updated && (
                      <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                        <Calendar className="w-3 h-3" /> {offer.updated}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 bg-white/40 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-zinc-400">
                <p className="font-black uppercase tracking-[0.2em] text-xs">Brak ogłoszeń</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;