import { X, CheckCircle2 } from "lucide-react"
import { Button } from "../ui/Button"
import type { RiskCaseUI, RiskCaseStatus } from "../../pages/RiskCases"
import { useState, useEffect } from "react"

interface RiskStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: RiskCaseStatus, resolutionNote?: string) => void;
  riskCase?: RiskCaseUI | null;
  targetStatus?: RiskCaseStatus;
}

export function RiskStatusModal({ isOpen, onClose, onSubmit, riskCase, targetStatus }: RiskStatusModalProps) {
  const [status, setStatus] = useState<RiskCaseStatus>('Open');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (targetStatus) {
      setStatus(targetStatus);
    } else if (riskCase) {
      setStatus(riskCase.status);
    }
    setNote('');
  }, [isOpen, riskCase, targetStatus]);

  if (!isOpen || !riskCase) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(status, status === 'Resolved' ? note : undefined);
  };

  const isResolving = status === 'Resolved';

  return (
    <>
      <div className="fixed inset-0 bg-landing-graphite/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-landing-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-landing-border/60">
          <div className="flex items-center justify-between p-4 border-b border-landing-border/60 bg-landing-ivory/50">
            <h2 className="text-lg font-bold text-landing-graphite flex items-center gap-2 font-editorial">
              {isResolving ? <CheckCircle2 className="h-5 w-5 text-landing-success" /> : null}
              {isResolving ? 'Resolve Risk Case' : 'Update Case Status'}
            </h2>
            <button onClick={onClose} className="p-1.5 text-landing-text-sec hover:text-landing-graphite rounded-full hover:bg-landing-ivory transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-sm font-semibold text-landing-text-sec mb-4">
              Update the status for <span className="font-bold text-landing-graphite">{riskCase.id}</span>.
            </p>
            <form id="status-form" onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-1">Status</label>
                <select 
                  className="w-full h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-colors"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RiskCaseStatus)}
                >
                  <option value="Open">Open</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Action Planned">Action Planned</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {isResolving && (
                <div>
                  <label className="block text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-1">Resolution Note <span className="text-landing-failure">*</span></label>
                  <textarea 
                    className="w-full rounded-md border border-landing-border/60 bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-colors"
                    rows={3}
                    placeholder="Describe how this case was resolved..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                  />
                </div>
              )}

            </form>
          </div>
          
          <div className="p-4 border-t border-landing-border/60 bg-landing-ivory/50 flex justify-end gap-3">
            <Button variant="outline" className="border-landing-border/60 text-landing-graphite font-bold hover:bg-landing-ivory" onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              form="status-form"
              className={isResolving ? "bg-landing-success hover:bg-landing-success/90 text-landing-surface font-bold border-transparent" : "bg-landing-graphite hover:bg-landing-graphite/90 text-landing-surface font-bold border-transparent"}
            >
              {isResolving ? 'Resolve Case' : 'Update Status'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
