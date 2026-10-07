import { X, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "../ui/Button"
import { useState, useEffect } from "react"
import { fetchApi } from "../../lib/api"

interface RecoveryActionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (action: any) => void;
}

export function RecoveryActionFormModal({ isOpen, onClose, onSubmit }: RecoveryActionFormModalProps) {
  const [formData, setFormData] = useState<any>({
    riskCaseId: '',
    actionType: 'Retry Payment'
  });
  
  const [errors, setErrors] = useState<any>({});
  
  // Data
  const [riskCases, setRiskCases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // AI Decision State
  const [aiDecisionLoading, setAiDecisionLoading] = useState(false);
  const [aiDecisionError, setAiDecisionError] = useState<string | null>(null);
  const [currentAiDecision, setCurrentAiDecision] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        riskCaseId: '',
        actionType: 'Retry Payment'
      });
      setErrors({});
      setCurrentAiDecision(null);
      setAiDecisionError(null);
      
      const loadOptions = async () => {
        setLoadingData(true);
        try {
          const [rcRes, payRes] = await Promise.all([
            fetchApi("/risk-cases"),
            fetchApi("/payments")
          ]);
          setRiskCases(rcRes.data?.riskCases || []);
          setPayments(payRes.data?.payments || []);
        } catch (e) {
          console.error("Failed to load options", e);
        } finally {
          setLoadingData(false);
        }
      };
      
      loadOptions();
    }
  }, [isOpen]);

  // When riskCaseId changes, fetch the AI decision to validate
  useEffect(() => {
    if (!formData.riskCaseId) {
      setCurrentAiDecision(null);
      setAiDecisionError(null);
      return;
    }

    const fetchDecision = async () => {
      setAiDecisionLoading(true);
      setAiDecisionError(null);
      setCurrentAiDecision(null);
      try {
        const res = await fetchApi(`/risk-cases/${formData.riskCaseId}/decision`);
        if (res.data?.decision) {
          setCurrentAiDecision(res.data.decision);
          // Suggest action type
          setFormData((prev: any) => ({ ...prev, actionType: res.data.decision.recommendedAction }));
        } else {
          setAiDecisionError("An AI decision is required before creating a recovery action.");
        }
      } catch (e) {
        setAiDecisionError("An AI decision is required before creating a recovery action.");
      } finally {
        setAiDecisionLoading(false);
      }
    };
    
    fetchDecision();
  }, [formData.riskCaseId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    if (!formData.riskCaseId) {
      newErrors.riskCaseId = "Risk Case / Payment selection is required";
    }
    if (!formData.actionType?.trim()) {
      newErrors.actionType = "Action type is required";
    }
    if (!currentAiDecision) {
      newErrors.aiDecision = "An AI decision is required before creating a recovery action.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      aiDecisionId: currentAiDecision.id,
      actionType: formData.actionType
    });
  };

  const getPaymentDesc = (rc: any) => {
    const pay = payments.find(p => p.id === rc.paymentId);
    if (!pay) return `Risk Case #${rc.id}`;
    return `RC #${rc.id} - ${pay.currency} ${pay.amount} (Payment: ${pay.id})`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Create Recovery Action
            </h2>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto">
            <form id="action-form" onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Risk Case <span className="text-red-500">*</span></label>
                {loadingData ? (
                   <p className="text-sm text-gray-500">Loading cases...</p>
                ) : (
                  <select 
                    className={`w-full h-10 rounded-md border ${errors.riskCaseId ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500`}
                    value={formData.riskCaseId}
                    onChange={(e) => {
                      setFormData({...formData, riskCaseId: e.target.value});
                    }}
                  >
                    <option value="" disabled>Select a risk case...</option>
                    {riskCases.filter(r => r.status === 'OPEN').map(rc => (
                      <option key={rc.id} value={rc.id}>{getPaymentDesc(rc)}</option>
                    ))}
                  </select>
                )}
                {errors.riskCaseId && <p className="text-red-500 text-xs mt-1">{errors.riskCaseId}</p>}
              </div>

              {aiDecisionLoading && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying AI Decision...
                </div>
              )}

              {aiDecisionError && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p>{aiDecisionError}</p>
                </div>
              )}

              {currentAiDecision && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded text-sm">
                  <p className="text-emerald-800 font-semibold mb-1">AI Decision Found</p>
                  <p className="text-emerald-700">Recommended: <strong>{currentAiDecision.recommendedAction}</strong></p>
                </div>
              )}
              {errors.aiDecision && !aiDecisionError && (
                 <p className="text-red-500 text-xs mt-1">{errors.aiDecision}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type <span className="text-red-500">*</span></label>
                <select 
                  className={`w-full h-10 rounded-md border ${errors.actionType ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500`}
                  value={formData.actionType}
                  onChange={(e) => setFormData({...formData, actionType: e.target.value})}
                  disabled={!currentAiDecision}
                >
                  <option value="Retry Payment">Retry Payment</option>
                  <option value="Retry Alternate Method">Retry Alternate Method</option>
                  <option value="Request Customer Action">Request Customer Action</option>
                  <option value="Delay Retry">Delay Retry</option>
                  <option value="MANUAL_REVIEW">Manual Review</option>
                  <option value="Stop Recovery">Stop Recovery</option>
                </select>
                {errors.actionType && <p className="text-red-500 text-xs mt-1">{errors.actionType}</p>}
              </div>

            </form>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="action-form" disabled={!currentAiDecision || aiDecisionLoading}>Create Action</Button>
          </div>
        </div>
      </div>
    </>
  );
}


interface CancelActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionId?: string;
}

export function CancelActionDialog({ isOpen, onClose, onConfirm, actionId }: CancelActionDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Cancel Recovery Action?</h2>
          <p className="text-sm text-gray-500">
            Are you sure you want to cancel action <span className="font-semibold text-gray-900">{actionId}</span>? 
            This will stop any pending or scheduled recovery attempts.
          </p>
        </div>
        <div className="p-4 bg-gray-50 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Keep Action</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent" onClick={onConfirm}>Cancel Action</Button>
        </div>
      </div>
    </div>
  );
}
