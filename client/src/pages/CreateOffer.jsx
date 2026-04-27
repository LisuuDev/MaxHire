import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "";

const AddOfferForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    tech: '',
    github: '',
    linkedin: ''
  });

  useEffect(() => {
    if (isEdit) {
      axios.get(`${API_URL}/backend/offer/getOffer/${id}`, { withCredentials: true })
        .then(res => {
          const data = res.data.message[0];
          if (data) {
            let techArr = [];
            try {
              const parsedTech = typeof data.tech === 'string' ? JSON.parse(data.tech) : data.tech;
              techArr = Array.isArray(parsedTech) ? parsedTech : JSON.parse(parsedTech);
            } catch (e) { techArr = []; }

            let linksObj = {};
            try {
              linksObj = typeof data.links === 'string' ? JSON.parse(data.links) : data.links;
            } catch (e) { linksObj = {}; }
            
            setFormData({
              title: data.title || '',
              company: data.company || '',
              description: data.description || '',
              tech: Array.isArray(techArr) ? techArr.join(', ') : '',
              github: linksObj?.Github || '',
              linkedin: linksObj?.Linkedin || ''
            });
          }
        })
        .catch(() => toast.error("Nie udało się pobrać danych ogłoszenia"));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/backend/offers/deleteOffer/${id}`, { withCredentials: true });
      toast.success("Ogłoszenie zostało usunięte");
      navigate(`/profile/${user?.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Błąd podczas usuwania");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const linksObj = {};
    if (formData.github.trim()) linksObj.Github = formData.github.trim();
    if (formData.linkedin.trim()) linksObj.Linkedin = formData.linkedin.trim();

    const payload = {
      id: id,
      title: formData.title,
      company: formData.company || "", 
      description: formData.description,
      tech: JSON.stringify(formData.tech.split(',').map(item => item.trim()).filter(i => i !== "")),
      links: JSON.stringify(linksObj)
    };

    try {
      if (isEdit) {
        const isAdmin = user && (user.role === "admin");
        const url = isAdmin ? `${API_URL}/backend/admin/update/offer/${id}` : `${API_URL}/backend/offers/editOffer/${id}`;
        await axios.patch(url, payload, { withCredentials: true });
        
        toast.success("Ogłoszenie zaktualizowane!");
        navigate(`/offer/${id}`);
      } else {
        const url = `${API_URL}/backend/addOffer`;
        await axios.post(url, payload, { withCredentials: true });
        
        toast.success("Ogłoszenie opublikowane!");
        navigate(`/profile/${user?.id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Wystąpił błąd podczas zapisu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4 font-sans antialiased">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white w-full max-w-2xl rounded-4xl p-8 md:p-10 shadow-xl shadow-black/3 border border-gray-100"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            {isEdit ? "Edytuj ogłoszenie" : "Nowe ogłoszenie"}
          </h2>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || loading}
              className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? "Usuwanie..." : "Usuń ofertę"}
            </button>
          )}
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Podstawowe informacje</p>
          <div className="space-y-3">
            <input 
              name="title" 
              value={formData.title}
              placeholder="Tytuł ogłoszenia" 
              maxLength={40}
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:border-black focus:bg-white outline-none transition-all text-sm font-normal" 
            />
            <input 
              name="company" 
              value={formData.company}
              placeholder="Firma (opcjonalnie)" 
              maxLength={40}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:border-black focus:bg-white outline-none transition-all text-sm font-normal" 
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Opis stanowiska</p>
          <textarea 
            name="description" 
            value={formData.description}
            placeholder="Napisz coś o projekcie..." 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:border-black focus:bg-white outline-none transition-all h-64 resize-none text-sm font-normal leading-relaxed" 
          />
        </div>

        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Technologie i Linki</p>
          <div className="space-y-3">
            <input 
              name="tech" 
              value={formData.tech}
              placeholder="Stack technologiczny (po przecinku, np. React, Node.js)" 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:border-black focus:bg-white outline-none transition-all text-sm font-normal" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                name="github" 
                value={formData.github}
                placeholder="Link GitHub" 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:border-black focus:bg-white outline-none transition-all text-sm font-normal" 
              />
              <input 
                name="linkedin" 
                value={formData.linkedin}
                placeholder="Link LinkedIn" 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:border-black focus:bg-white outline-none transition-all text-sm font-normal" 
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || isDeleting}
          className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 uppercase tracking-widest text-xs cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Przetwarzanie..." : (isEdit ? "Zapisz zmiany" : "Opublikuj")}
        </button>
      </form>
    </div>
  );
};

export default AddOfferForm;