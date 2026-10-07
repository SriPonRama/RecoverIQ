import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";

export function AccountSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi("/auth/me");
      if (res.success && res.data.user) {
        setFormData({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load account settings");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetchApi("/users/me", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setSuccess("Account settings saved successfully.");
        // Re-load to ensure we have the exact server state
        setFormData({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save account settings");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="bg-white border border-[#DED9CF] rounded-2xl p-12 flex justify-center items-center shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 rounded-full border-2 border-[#C7A64A] border-t-transparent animate-spin"></div>
          <p className="text-[#6B6862] text-sm">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DED9CF] rounded-2xl overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-[#DED9CF] bg-white flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#171717]">Account Settings</h3>
          <p className="mt-1 text-sm text-[#6B6862]">
            Manage your personal profile and email address.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="px-8 py-8 bg-[#FFFCF7] space-y-8">
        {error && (
          <div className="bg-[#8A3F3F]/10 border border-[#8A3F3F]/20 text-[#8A3F3F] px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-[#3F6B4F]/10 border border-[#3F6B4F]/20 text-[#3F6B4F] px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#171717]">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border-[#DED9CF] px-4 py-2.5 shadow-sm focus:border-[#C7A64A] focus:ring-[#C7A64A] sm:text-sm bg-white text-[#171717]"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#171717]">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border-[#DED9CF] px-4 py-2.5 shadow-sm focus:border-[#C7A64A] focus:ring-[#C7A64A] sm:text-sm bg-white text-[#171717]"
              required
            />
          </div>
        </div>

        <div className="pt-6 border-t border-[#DED9CF] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center items-center rounded-xl border border-transparent bg-[#171717] py-2.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[#C7A64A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
