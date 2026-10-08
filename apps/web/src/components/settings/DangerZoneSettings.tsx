import { useState } from "react";
import { fetchApi } from "../../lib/api";
import { AlertCircle, AlertOctagon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DangerZoneSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate your merchant account? This will restrict all access immediately and can only be reversed by contacting support.")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await fetchApi("/merchants/me/deactivate", {
        method: "POST"
      });
      // Redirect to login or home as session is killed
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Failed to deactivate account.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#DED9CF] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-[#FFFCF7] border border-[#8A3F3F]/20 rounded-full flex items-center justify-center">
            <AlertOctagon className="w-5 h-5 text-[#8A3F3F]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#171717]">Danger Zone</h2>
            <p className="text-sm text-[#6B6862]">Destructive actions for your merchant account</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#8A3F3F]/10 border border-[#8A3F3F]/20 rounded-xl flex items-center gap-3 text-[#8A3F3F]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="p-6 border border-[#8A3F3F]/20 bg-[#8A3F3F]/5 rounded-xl">
          <h3 className="font-medium text-[#8A3F3F] mb-2">Deactivate Account</h3>
          <p className="text-sm text-[#6B6862] mb-6">
            Deactivating your account will immediately suspend access for all team members. Active payment recoveries will be halted. Data is preserved but cannot be modified.
          </p>
          
          <button 
            onClick={handleDeactivate}
            disabled={loading}
            className="px-6 py-2.5 bg-[#8A3F3F] hover:bg-[#723232] text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Deactivate Merchant Account
          </button>
        </div>
      </div>
    </div>
  );
}
