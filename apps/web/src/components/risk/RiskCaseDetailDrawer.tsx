import { X, Clock, BrainCircuit, AlertTriangle, ShieldAlert, Activity, CheckCircle2 } from "lucide-react"
import { Badge } from "../ui/Badge"
import { type RiskCaseUI } from "../../pages/RiskCases"
import { useEffect, useState } from "react"
import { fetchApi } from "../../lib/api"

type AIDecision = {
  id: number;
  riskCaseId: number;
  decisionType: string;
  recommendedAction: string;
  confidence: number;
  reasoningSummary: string;
  modelVersion: string;
  createdAt: string;
  updatedAt: string;
};
interface RiskCaseDetailDrawerProps {
  riskCase: RiskCaseUI | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RiskCaseDetailDrawer({ riskCase, isOpen, onClose }: RiskCaseDetailDrawerProps) {
  const [decision, setDecision] = useState<AIDecision | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !riskCase) {
      setDecision(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDecision = async () => {
      setLoading(true);
      try {
        const dbId = riskCase.id.replace("RC-", "");
        const res = await fetchApi(`/risk-cases/${dbId}/decision`);
        if (isMounted) {
          setDecision(res.data?.decision || null);
        }
      } catch (err) {
        console.error("Failed to fetch AI decision:", err);
        if (isMounted) {
          setDecision(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDecision();

    return () => {
      isMounted = false;
    };
  }, [isOpen, riskCase]);

  if (!isOpen || !riskCase) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-landing-graphite/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-landing-surface shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-landing-border/60">
        <div className="sticky top-0 z-10 bg-landing-surface/80 backdrop-blur-md border-b border-landing-border/60 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${
              riskCase.riskLevel === 'Critical' ? 'bg-landing-failure/10 border-landing-failure/20 text-landing-failure' :
              riskCase.riskLevel === 'High' ? 'bg-landing-champagne-light/10 border-landing-champagne/30 text-landing-champagne' :
              riskCase.riskLevel === 'Medium' ? 'bg-landing-ivory border-landing-border/60 text-landing-text-sec' :
              'bg-landing-success/10 border-landing-success/20 text-landing-success'
            }`}>
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-landing-graphite font-editorial">{riskCase.id}</h2>
              <div className="flex items-center gap-2 text-sm font-semibold text-landing-text-sec mt-0.5">
                <span className="font-bold text-landing-graphite">{riskCase.riskType}</span>
                <span>•</span>
                <Badge variant={
                  riskCase.status === 'Resolved' ? 'success' : 
                  riskCase.status === 'Action Planned' ? 'info' : 
                  riskCase.status === 'Investigating' ? 'warning' : 'error'
                } className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider">
                  {riskCase.status}
                </Badge>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-landing-text-sec hover:text-landing-graphite rounded-full hover:bg-landing-ivory transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 pb-20">
          
          {/* Risk Assessment (Primary Focus) */}
          <div>
            <h3 className="text-lg font-bold text-landing-graphite mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-landing-text-sec/60" />
              Risk Assessment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-landing-surface border border-landing-border/60 rounded-lg p-4">
                <p className="text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-1">Risk Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-landing-graphite">{Math.round(riskCase.prediction.riskScore)}</span>
                  <span className="text-sm font-semibold text-landing-text-sec">/100</span>
                </div>
              </div>
              <div className="bg-landing-surface border border-landing-border/60 rounded-lg p-4">
                <p className="text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-1">Risk Level</p>
                <div className="flex items-center mt-1">
                  <Badge variant={riskCase.riskLevel === 'Critical' || riskCase.riskLevel === 'High' ? 'error' : riskCase.riskLevel === 'Medium' ? 'warning' : 'success'} className="px-2 py-0.5 font-bold">
                    {riskCase.riskLevel}
                  </Badge>
                </div>
              </div>
              <div className="bg-landing-surface border border-landing-border/60 rounded-lg p-4">
                <p className="text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-1">Recovery Prob.</p>
                <div className="text-2xl font-bold text-landing-graphite">{riskCase.prediction.recoveryProbability}%</div>
              </div>
              <div className="bg-landing-surface border border-landing-border/60 rounded-lg p-4">
                <p className="text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-1">Confidence</p>
                <div className="text-2xl font-bold text-landing-graphite">{riskCase.prediction.confidence}%</div>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div>
            <h3 className="text-sm font-bold text-landing-graphite mb-3 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-landing-champagne" />
              AI Recommendation
            </h3>
            {loading ? (
              <div className="bg-landing-ivory/50 border border-landing-border/60 rounded-lg p-5 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-landing-champagne"></div>
              </div>
            ) : decision ? (
              <div className="bg-landing-champagne-light/10 border border-landing-champagne/30 rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-landing-champagne uppercase tracking-wider mb-1">Recommended Action</p>
                    <h4 className="text-lg font-bold text-landing-graphite">
                      {decision.recommendedAction}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-landing-champagne uppercase tracking-wider mb-1">Confidence</p>
                    <div className="text-lg font-bold text-landing-graphite">{Math.round(decision.confidence * 100)}%</div>
                  </div>
                </div>
                <div className="bg-landing-surface rounded p-3 mb-3 border border-landing-champagne/20">
                  <p className="text-sm font-semibold text-landing-text-sec leading-relaxed">
                    {decision.reasoningSummary || "Not available yet"}
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs text-landing-champagne font-bold pt-2 border-t border-landing-champagne/20">
                  <span>Model: {decision.modelVersion}</span>
                  <span>Generated: {new Date(decision.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="bg-landing-ivory/50 border border-landing-border/60 rounded-lg p-5 flex items-center justify-center">
                <span className="text-landing-text-sec italic text-sm font-semibold">Not available yet</span>
              </div>
            )}
          </div>

          {/* Overview Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-bold text-landing-graphite mb-3">Case Details</h3>
              <div className="bg-landing-surface border border-landing-border/60 rounded-lg p-4 space-y-3 text-sm font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec">Amount at Risk</span>
                  <span className="font-bold text-landing-failure">{riskCase.currency} {riskCase.amountAtRisk.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec">Payment Ref</span>
                  <span className="font-mono text-[10px] text-landing-champagne">{riskCase.paymentId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec">Order Ref</span>
                  <span className="font-mono text-[10px] text-landing-champagne">{riskCase.orderId}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-landing-border/60">
                  <span className="text-landing-text-sec">Detected</span>
                  <span className="font-bold text-landing-graphite">{riskCase.detectedAt}</span>
                </div>
              </div>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-bold text-landing-graphite mb-3 flex items-center justify-between">
                Customer
              </h3>
              <div className="bg-landing-surface border border-landing-border/60 rounded-lg p-4 space-y-3 text-sm font-semibold h-[134px]">
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec">Name</span>
                  <span className="font-bold text-landing-graphite">{riskCase.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec">Email</span>
                  <span className="font-bold text-landing-graphite truncate max-w-[150px]" title={riskCase.customerEmail}>{riskCase.customerEmail}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-landing-border/60">
                  <span className="text-landing-text-sec">ID</span>
                  <span className="font-mono text-[10px] text-landing-text-sec/80">{riskCase.customerId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Reasons & Feature Snapshot */}
          <div>
            <h3 className="text-sm font-bold text-landing-graphite mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-landing-champagne" />
              Flag Reasons & Feature Snapshot
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-landing-surface border border-landing-border/60 rounded-lg p-4">
                <h4 className="text-[10px] font-bold text-landing-text-sec uppercase mb-3 tracking-wider">Model Features</h4>
                <ul className="space-y-2 text-sm font-semibold">
                  <li className="flex justify-between">
                    <span className="text-landing-text-sec">Payment Attempts</span>
                    <span className="font-bold text-landing-graphite">{riskCase.prediction.featuresSnapshot.attemptCount}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-landing-text-sec">Customer Failures</span>
                    <span className="font-bold text-landing-graphite">{riskCase.prediction.featuresSnapshot.customerFailureHistory}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-landing-text-sec">Customer Success</span>
                    <span className="font-bold text-landing-graphite">{riskCase.prediction.featuresSnapshot.customerSuccessHistory}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-landing-text-sec">Amount</span>
                    <span className="font-bold text-landing-graphite">{(riskCase.prediction.featuresSnapshot.paymentAmount || 0).toLocaleString()}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-landing-surface border border-landing-border/60 rounded-lg p-4">
                 <h4 className="text-[10px] font-bold text-landing-text-sec uppercase mb-3 tracking-wider">Flag Reasons</h4>
                 <ul className="space-y-2 text-sm font-semibold list-disc pl-4 text-landing-graphite marker:text-landing-text-sec/40">
                   {riskCase.prediction.featuresSnapshot.flagReasons?.map((reason, i) => (
                     <li key={i}>{reason}</li>
                   ))}
                   {(!riskCase.prediction.featuresSnapshot.flagReasons || riskCase.prediction.featuresSnapshot.flagReasons.length === 0) && (
                     <li className="list-none -ml-4 text-landing-text-sec/60 italic">No specific reasons provided</li>
                   )}
                 </ul>
              </div>
            </div>
          </div>

          {/* Recovery Preview */}
          <div>
            <h3 className="text-sm font-bold text-landing-graphite mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-landing-success" />
              Recovery Stage
            </h3>
            <div className="bg-landing-ivory/50 border border-landing-border/60 rounded-lg p-5 flex items-center justify-center">
               <span className="text-landing-text-sec italic text-sm font-semibold">Not available yet</span>
            </div>
          </div>

          {/* Resolution Note if resolved */}
          {riskCase.status === 'Resolved' && riskCase.resolutionNote && (
            <div className="bg-landing-success/5 border border-landing-success/20 rounded-lg p-4">
              <h4 className="text-landing-success font-bold text-sm mb-1">Resolution Details</h4>
              <p className="text-sm font-semibold text-landing-success/80">{riskCase.resolutionNote}</p>
              {riskCase.resolvedAt && (
                <p className="text-xs font-semibold text-landing-success/60 mt-2">Resolved {riskCase.resolvedAt}</p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-bold text-landing-graphite mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-landing-text-sec/60" />
              Event Timeline
            </h3>
            <div className="bg-landing-ivory/50 border border-landing-border/60 rounded-lg p-5 flex items-center justify-center mt-6">
              <span className="text-landing-text-sec italic text-sm font-semibold">Not available yet</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
