import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Loader2, ShieldAlert, AlertCircle, Save } from "lucide-react";

export function RiskSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    lowRiskThreshold: 30,
    mediumRiskThreshold: 60,
    highRiskThreshold: 80,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetchApi("/merchants/me/settings");
        if (response.success && response.data.settings) {
          setFormData({
            lowRiskThreshold: response.data.settings.lowRiskThreshold,
            mediumRiskThreshold: response.data.settings.mediumRiskThreshold,
            highRiskThreshold: response.data.settings.highRiskThreshold,
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
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: Number(value)
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
      setSuccessMsg("Risk thresholds updated successfully.");
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
            <ShieldAlert className="w-5 h-5 text-[#6B6862]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#171717]">Risk Configuration</h2>
            <p className="text-sm text-[#6B6862]">Adjust the AI scoring thresholds for categorizing payment risks</p>
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
          <div className="p-4 border border-[#DED9CF] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium text-[#171717]">Low Risk Threshold (Maximum)</p>
                <p className="text-sm text-[#6B6862]">Scores below this value are considered Low Risk.</p>
              </div>
              <div className="w-20">
                <input 
                  type="number" 
                  name="lowRiskThreshold"
                  min={0}
                  max={100}
                  value={formData.lowRiskThreshold}
                  onChange={handleChange}
                  className="w-full text-center rounded-lg border border-[#DED9CF] px-3 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#C7A64A] transition-all"
                />
              </div>
            </div>
            <div className="w-full bg-[#DED9CF] rounded-full h-1.5 mt-2">
              <div className="bg-[#4A7D59] h-1.5 rounded-full" style={{ width: `${formData.lowRiskThreshold}%` }}></div>
            </div>
          </div>

          <div className="p-4 border border-[#DED9CF] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium text-[#171717]">Medium Risk Threshold (Maximum)</p>
                <p className="text-sm text-[#6B6862]">Scores below this value are considered Medium Risk.</p>
              </div>
              <div className="w-20">
                <input 
                  type="number" 
                  name="mediumRiskThreshold"
                  min={0}
                  max={100}
                  value={formData.mediumRiskThreshold}
                  onChange={handleChange}
                  className="w-full text-center rounded-lg border border-[#DED9CF] px-3 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#C7A64A] transition-all"
                />
              </div>
            </div>
            <div className="w-full bg-[#DED9CF] rounded-full h-1.5 mt-2">
              <div className="bg-[#E5B15D] h-1.5 rounded-full" style={{ width: `${formData.mediumRiskThreshold}%` }}></div>
            </div>
          </div>

          <div className="p-4 border border-[#DED9CF] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium text-[#171717]">High Risk Threshold (Maximum)</p>
                <p className="text-sm text-[#6B6862]">Scores below this value are High Risk. Scores above are Critical.</p>
              </div>
              <div className="w-20">
                <input 
                  type="number" 
                  name="highRiskThreshold"
                  min={0}
                  max={100}
                  value={formData.highRiskThreshold}
                  onChange={handleChange}
                  className="w-full text-center rounded-lg border border-[#DED9CF] px-3 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#C7A64A] transition-all"
                />
              </div>
            </div>
            <div className="w-full bg-[#DED9CF] rounded-full h-1.5 mt-2">
              <div className="bg-[#C86464] h-1.5 rounded-full" style={{ width: `${formData.highRiskThreshold}%` }}></div>
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
            Save Thresholds
          </button>
        </div>
      </div>
    </div>
  );
}
