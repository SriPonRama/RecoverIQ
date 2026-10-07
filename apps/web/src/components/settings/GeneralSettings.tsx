import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";

export function GeneralSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    currency: "USD",
    timezone: "UTC",
  });

  useEffect(() => {
    loadMerchant();
  }, []);

  async function loadMerchant() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi("/merchants/me");
      if (res.success && res.data.merchant) {
        setFormData({
          businessName: res.data.merchant.businessName || res.data.merchant.name || "",
          email: res.data.merchant.email || "",
          currency: res.data.merchant.currency || "USD",
          timezone: res.data.merchant.timezone || "UTC",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load merchant settings");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetchApi("/merchants/me", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setSuccess("General settings saved successfully.");
        setFormData({
          businessName: res.data.merchant.businessName || res.data.merchant.name || "",
          email: res.data.merchant.email || "",
          currency: res.data.merchant.currency || "USD",
          timezone: res.data.merchant.timezone || "UTC",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save merchant settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#DED9CF] rounded-2xl p-12 flex justify-center items-center shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 rounded-full border-2 border-[#C7A64A] border-t-transparent animate-spin"></div>
          <p className="text-[#6B6862] text-sm">Loading workspace preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DED9CF] rounded-2xl overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-[#DED9CF] bg-white flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#171717]">Workspace Preferences</h3>
          <p className="mt-1 text-sm text-[#6B6862]">
            Manage your business profile, default currency, and timezone.
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
          <div className="col-span-1 sm:col-span-2">
            <label htmlFor="businessName" className="block text-sm font-semibold text-[#171717]">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              id="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border-[#DED9CF] px-4 py-2.5 shadow-sm focus:border-[#C7A64A] focus:ring-[#C7A64A] sm:text-sm bg-white text-[#171717]"
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-semibold text-[#171717]">
              Business Email Address
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

          <div>
            <label htmlFor="currency" className="block text-sm font-semibold text-[#171717]">
              Default Currency
            </label>
            <select
              name="currency"
              id="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border-[#DED9CF] px-4 py-2.5 shadow-sm focus:border-[#C7A64A] focus:ring-[#C7A64A] sm:text-sm bg-white text-[#171717]"
              required
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-semibold text-[#171717]">
              Timezone
            </label>
            <select
              name="timezone"
              id="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border-[#DED9CF] px-4 py-2.5 shadow-sm focus:border-[#C7A64A] focus:ring-[#C7A64A] sm:text-sm bg-white text-[#171717]"
              required
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Kolkata">India Standard Time</option>
            </select>
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
