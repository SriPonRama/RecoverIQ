import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Loader2, Bell, AlertCircle, Save } from "lucide-react";

export function NotificationsSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    notifyOnPaymentFailure: true,
    notifyOnRecoverySuccess: true,
    notifyOnRiskAlert: false,
    notifyOnAIDecision: false,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetchApi("/merchants/me/settings");
        if (response.success && response.data.settings) {
          setFormData({
            notifyOnPaymentFailure: response.data.settings.notifyOnPaymentFailure,
            notifyOnRecoverySuccess: response.data.settings.notifyOnRecoverySuccess,
            notifyOnRiskAlert: response.data.settings.notifyOnRiskAlert,
            notifyOnAIDecision: response.data.settings.notifyOnAIDecision,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
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
      setSuccessMsg("Notification preferences updated successfully.");
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
            <Bell className="w-5 h-5 text-[#6B6862]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#171717]">Notification Preferences</h2>
            <p className="text-sm text-[#6B6862]">Manage how and when you receive alerts</p>
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

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-[#DED9CF] rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
            <div>
              <p className="font-medium text-[#171717]">Payment Failures</p>
              <p className="text-sm text-[#6B6862]">Receive an alert when a customer payment fails.</p>
            </div>
            <input 
              type="checkbox" 
              name="notifyOnPaymentFailure"
              checked={formData.notifyOnPaymentFailure}
              onChange={handleChange}
              className="w-5 h-5 accent-[#C7A64A] cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-4 border border-[#DED9CF] rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
            <div>
              <p className="font-medium text-[#171717]">Recovery Success</p>
              <p className="text-sm text-[#6B6862]">Receive an alert when a payment is successfully recovered.</p>
            </div>
            <input 
              type="checkbox" 
              name="notifyOnRecoverySuccess"
              checked={formData.notifyOnRecoverySuccess}
              onChange={handleChange}
              className="w-5 h-5 accent-[#C7A64A] cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-4 border border-[#DED9CF] rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
            <div>
              <p className="font-medium text-[#171717]">High Risk Alerts</p>
              <p className="text-sm text-[#6B6862]">Receive an alert for high or critical risk payments.</p>
            </div>
            <input 
              type="checkbox" 
              name="notifyOnRiskAlert"
              checked={formData.notifyOnRiskAlert}
              onChange={handleChange}
              className="w-5 h-5 accent-[#C7A64A] cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-4 border border-[#DED9CF] rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
            <div>
              <p className="font-medium text-[#171717]">AI Decisions</p>
              <p className="text-sm text-[#6B6862]">Receive an alert when the AI engine makes a final decision.</p>
            </div>
            <input 
              type="checkbox" 
              name="notifyOnAIDecision"
              checked={formData.notifyOnAIDecision}
              onChange={handleChange}
              className="w-5 h-5 accent-[#C7A64A] cursor-pointer"
            />
          </label>
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
