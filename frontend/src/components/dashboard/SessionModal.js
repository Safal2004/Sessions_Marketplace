import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';

export default function SessionModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    meeting_link: '',
    price: 0,
    duration_minutes: 30,
    max_participants: 1,
    is_published: true,
    tags: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  // Sync with initialData if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        thumbnail_url: initialData.thumbnail_url || '',
        meeting_link: initialData.meeting_link || '',
        price: parseFloat(initialData.price) || 0,
        duration_minutes: initialData.duration_minutes || 30,
        max_participants: initialData.max_participants || 1,
        is_published: initialData.is_published ?? true,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        thumbnail_url: '',
        meeting_link: '',
        price: 0,
        duration_minutes: 30,
        max_participants: 1,
        is_published: true,
        tags: ''
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors for that field
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError(null);
    setErrors({});

    try {
      if (initialData) {
        // Edit Session (PATCH)
        await axiosInstance.patch(`/api/v1/sessions/${initialData.id}/`, formData);
      } else {
        // Create Session (POST)
        await axiosInstance.post('/api/v1/sessions/', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Session submit failed:', err);
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6 font-sans">
      
      {/* Modal Container */}
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 overflow-y-auto max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-5">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            {initialData ? 'Edit Hosted Session' : 'Host a New Session'}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 text-sm bg-transparent border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {generalError && (
          <div className="mb-4 rounded-xl bg-rose-50/50 border border-rose-200/50 p-4 text-xs font-semibold text-rose-600 dark:bg-rose-950/10 dark:border-rose-900/20 dark:text-rose-450 leading-normal">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Session Title *</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. System Design Mock Interview"
              className="w-full h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-700 dark:text-white"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title[0]}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Description *</label>
            <textarea 
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail what attendees will learn, custom formats, and background requirements."
              className="w-full rounded-lg border border-zinc-200 bg-transparent p-3 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-700 dark:text-white"
            />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description[0]}</p>}
          </div>

          {/* Meeting Link & Cover URL Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Meeting URL</label>
              <input 
                type="url" 
                name="meeting_link"
                value={formData.meeting_link}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                className="w-full h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-700 dark:text-white"
              />
              {errors.meeting_link && <p className="text-xs text-rose-500 mt-1">{errors.meeting_link[0]}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Thumbnail Cover URL</label>
              <input 
                type="url" 
                name="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={handleChange}
                placeholder="https://unsplash.com/..."
                className="w-full h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-700 dark:text-white"
              />
              {errors.thumbnail_url && <p className="text-xs text-rose-500 mt-1">{errors.thumbnail_url[0]}</p>}
            </div>
          </div>

          {/* Price, Duration, Participants Capacity */}
          <div className="grid gap-4 grid-cols-3">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Price (USD)</label>
              <input 
                type="number" 
                name="price"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-700 dark:text-white"
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price[0]}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Duration (m)</label>
              <input 
                type="number" 
                name="duration_minutes"
                min="1"
                required
                value={formData.duration_minutes}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-700 dark:text-white"
              />
              {errors.duration_minutes && <p className="text-xs text-rose-500 mt-1">{errors.duration_minutes[0]}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Capacity (p)</label>
              <input 
                type="number" 
                name="max_participants"
                min="1"
                required
                value={formData.max_participants}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-700 dark:text-white"
              />
              {errors.max_participants && <p className="text-xs text-rose-500 mt-1">{errors.max_participants[0]}</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Topics / Tags (comma-separated)</label>
            <input 
              type="text" 
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. system-design, nextjs, interview"
              className="w-full h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-700 dark:text-white"
            />
            {errors.tags && <p className="text-xs text-rose-500 mt-1">{errors.tags[0]}</p>}
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              name="is_published"
              id="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-200 text-purple-600 focus:ring-purple-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
            <label htmlFor="is_published" className="font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Publish immediately (visible in the public catalog)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-900 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-zinc-200 px-4 text-xs font-bold text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-lg bg-zinc-950 px-5 text-xs font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
            >
              {loading ? 'Submitting...' : initialData ? 'Save Changes' : 'Create Hosted Session'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
