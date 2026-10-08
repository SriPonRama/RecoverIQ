import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Loader2, RefreshCw, AlertCircle, Save } from "lucide-react";

export function RecoverySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    automaticRecoveryEnabled: false,
    maxRetryAttempts: 3,
    retryDelayHours: 24,
    allowAlternateMethods: false,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetchApi("/merchants/me/settings");
        if (response.success && response.data.settings) {
          setFormData({
            automaticRecoveryEnabled: response.data.settings.automaticRecoveryEnabled,
            maxRetryAttempts: response.data.settings.maxRetryAttempts,
            retryDelayHours: response.data.settings.retryDelayHours,
            allowAlternateMethods: response.data.settings.allowAlternateMethods,
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : Number(value) 
    }));
    setSuccessMsg(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await fetchApi("/merchants/me/settings", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      setSuccessMsg("Recovery settings updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#C7A64A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#DED9CF] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-[#FFFCF7] border border-[#DED9CF] rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-[#6B6862]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#171717]">Recovery Engine Configuration</h2>
            <p className="text-sm text-[#6B6862]">Configure how the background worker recovers failed payments</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#8A3F3F]/10 border border-[#8A3F3F]/20 rounded-xl flex items-center gap-3 text-[#8A3F3F]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-[#4A7D59]/10 border border-[#4A7D59]/20 rounded-xl flex items-center gap-3 text-[#4A7D59]">
            <div className="w-2 h-2 rounded-full bg-[#4A7D59]" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <div className="space-y-6">
          <label className="flex items-center justify-between p-4 border border-[#DED9CF] rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
            <div>
              <p className="font-medium text-[#171717]">Automatic Recovery Worker</p>
              <p className="text-sm text-[#6B6862]">Allow the background worker to automatically attempt recovery.</p>
            </div>
            <input 
              type="checkbox" 
              name="automaticRecoveryEnabled"
              checked={formData.automaticRecoveryEnabled}
              onChange={handleChange}
              className="w-5 h-5 accent-[#C7A64A] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-[#DED9CF] rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
            <div>
              <p className="font-medium text-[#171717]">Allow Alternate Payment Methods</p>
              <p className="text-sm text-[#6B6862]">Send users payment links to try different methods if retries fail.</p>
            </div>
            <input 
              type="checkbox" 
              name="allowAlternateMethods"
              checked={formData.allowAlternateMethods}
              onChange={handleChange}
              className="w-5 h-5 accent-[#C7A64A] cursor-pointer"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#171717]">Max Retry Attempts</label>
              <select 
                name="maxRetryAttempts"
                value={formData.maxRetryAttempts}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#DED9CF] px-4 py-2.5 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#C7A64A] focus:border-transparent transition-all"
              >
                <option value={1}>1 attempt</option>
                <option value={3}>3 attempts</option>
                <option value={5}>5 attempts</option>
                <option value={10}>10 attempts</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#171717]">Retry Delay (Hours)</label>
              <select 
                name="retryDelayHours"
                value={formData.retryDelayHours}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#DED9CF] px-4 py-2.5 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#C7A64A] focus:border-transparent transition-all"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#171717] hover:bg-[#2A2A2A] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
