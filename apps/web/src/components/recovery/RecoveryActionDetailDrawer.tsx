import { X, ExternalLink, Clock, BrainCircuit, Activity, RefreshCw, CheckCircle2, AlertTriangle, Loader2, Play } from "lucide-react"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { useState, useEffect } from "react"
import { fetchApi } from "../../lib/api"

interface RecoveryActionDetailDrawerProps {
  action: any | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function RecoveryActionDetailDrawer({ action, isOpen, onClose, onRefresh }: RecoveryActionDetailDrawerProps) {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [aiDecision, setAiDecision] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [executeLoading, setExecuteLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !action) {
      setAttempts([]);
      setOutcomes([]);
      setAiDecision(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const [attRes, outRes, decRes] = await Promise.all([
          fetchApi(`/recovery/actions/${action.rawId}/attempts`),
          fetchApi(`/recovery/actions/${action.rawId}/outcome`),
          action.riskCaseId ? fetchApi(`/risk-cases/${action.riskCaseId}/decision`).catch(() => ({ data: null })) : Promise.resolve({ data: null })
        ]);
        
        if (isMounted) {
          setAttempts(attRes.data?.attempts || []);
          setOutcomes(outRes.data?.outcomes || []);
          setAiDecision(decRes.data?.decision || null);
        }
      } catch (err) {
        console.error("Failed to load recovery action details", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadDetails();
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, action]);

  const handleExecute = async () => {
    if (!action) return;
    setExecuteLoading(true);
    try {
      await fetchApi(`/recovery/actions/${action.rawId}/execute`, {
        method: "POST"
      });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to execute", err);
      alert(err.message || "Failed to execute recovery action.");
    } finally {
      setExecuteLoading(false);
    }
  };

  if (!isOpen || !action) return null;

  // We take the latest outcome if multiple, or a pending placeholder if none
  const latestOutcome = outcomes.length > 0 ? outcomes[0] : { outcomeType: 'PENDING', recoveredAmount: 0, status: 'PENDING' };

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${
              action.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-200 text-emerald-500' :
              action.status === 'FAILED' ? 'bg-red-50 border-red-200 text-red-500' :
              action.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-500' :
              'bg-amber-50 border-amber-200 text-amber-500'
            }`}>
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{action.id}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <span className="font-medium text-gray-900">{action.actionType}</span>
                <span>•</span>
                <Badge variant={
                  action.status === 'COMPLETED' ? 'success' : 
                  action.status === 'FAILED' ? 'error' : 
                  action.status === 'IN_PROGRESS' ? 'info' : 
                  action.status === 'CANCELLED' ? 'default' : 'warning'
                } className="h-5 px-1.5 text-[10px] uppercase">
                  {action.status || 'PENDING'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {action.status === 'PENDING' && action.actionType !== 'MANUAL_REVIEW' && (
               <Button onClick={handleExecute} disabled={executeLoading} className="h-8 text-xs bg-brand-600 hover:bg-brand-700">
                  {executeLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
                  Execute Action
               </Button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 pb-20 flex-1 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
               <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
            </div>
          )}

          {/* Recovery Outcome */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${latestOutcome.outcomeType === 'RECOVERED' ? 'text-emerald-500' : latestOutcome.outcomeType === 'FAILED' ? 'text-red-500' : 'text-amber-500'}`} />
              Recovery Outcome
            </h3>
            <div className={`border rounded-lg p-5 ${
                latestOutcome.outcomeType === 'RECOVERED' ? 'bg-emerald-50 border-emerald-200' : 
                latestOutcome.outcomeType === 'FAILED' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${
                      latestOutcome.outcomeType === 'RECOVERED' ? 'text-emerald-800' : 
                      latestOutcome.outcomeType === 'FAILED' ? 'text-red-800' : 'text-gray-700'
                  }`}>
                    {latestOutcome.outcomeType}
                  </p>
                  {latestOutcome.outcomeType === 'FAILED' && latestOutcome.failureReason && (
                    <p className="text-sm text-red-700 mt-2">{latestOutcome.failureReason}</p>
                  )}
                  {latestOutcome.occurredAt && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Occurred: {new Date(latestOutcome.occurredAt).toLocaleString()}
                    </p>
                  )}
                  {latestOutcome.externalReference && (
                    <p className="text-xs font-mono text-gray-500 mt-1">Ref: {latestOutcome.externalReference}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recovered Amount</p>
                  <div className={`text-2xl font-bold ${latestOutcome.recoveredAmount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {action.currency} {latestOutcome.recoveredAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Decision */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-brand-500" />
              AI Recommendation Foundation
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
              {aiDecision ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">{aiDecision.recommendedAction}</span>
                    <span className="text-brand-600 font-semibold">{Math.round(aiDecision.confidence * 100)}% Confidence</span>
                  </div>
                  <p className="text-gray-600">{aiDecision.reasoningSummary}</p>
                  <p className="text-xs text-gray-400 mt-3 flex justify-between">
                     <span>Model: {aiDecision.modelVersion}</span>
                     <span>{new Date(aiDecision.createdAt).toLocaleString()}</span>
                  </p>
                </>
              ) : (
                <div className="text-gray-500 italic">Not available yet</div>
              )}
            </div>
          </div>

          {/* Overview Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Action Details</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Target Amount</span>
                  <span className="font-semibold text-gray-900">{action.currency} {action.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Created At</span>
                  <span className="font-medium text-gray-900">{action.createdAt}</span>
                </div>
                {action.scheduledAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Scheduled At</span>
                    <span className="font-medium text-gray-900">{action.scheduledAt}</span>
                  </div>
                )}
                {action.executedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Executed At</span>
                    <span className="font-medium text-gray-900">{action.executedAt}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Payment Ref</span>
                  <span className="font-mono text-xs text-brand-600 hover:underline cursor-pointer">{action.paymentId}</span>
                </div>
              </div>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
               <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                      Customer
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2">View <ExternalLink className="ml-1 h-3 w-3"/></Button>
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Name</span>
                        <span className="font-medium text-gray-900">{action.customerName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-900 truncate max-w-[120px]" title={action.customerEmail}>{action.customerEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                      Risk Context
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2">View Case <ExternalLink className="ml-1 h-3 w-3"/></Button>
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Risk Case ID</span>
                        <span className="font-mono text-xs text-brand-600 hover:underline cursor-pointer">RC-{action.riskCaseId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Risk Level</span>
                        <Badge variant={action.risk.level === 'Critical' || action.risk.level === 'High' ? 'error' : 'warning'} className="px-1.5 h-4 text-[10px] uppercase">{action.risk.level}</Badge>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Recovery Attempts */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-400" />
              Recovery Attempts
            </h3>
            {attempts.length === 0 ? (
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
                 No attempts have been executed for this action yet.
               </div>
            ) : (
               <div className="space-y-3">
                 {attempts.map((attempt) => (
                   <div key={attempt.id} className="bg-white border border-gray-200 rounded-lg p-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">
                           #{attempt.attemptNumber}
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">Attempt {attempt.attemptNumber}</span>
                              <Badge variant={
                                 attempt.status === 'COMPLETED' ? 'success' : 
                                 attempt.status === 'FAILED' ? 'error' : 
                                 attempt.status === 'STARTED' ? 'info' : 'default'
                              } className="h-4 px-1.5 text-[10px] uppercase tracking-wider">{attempt.status}</Badge>
                           </div>
                           {attempt.externalReference && (
                             <div className="text-xs font-mono text-gray-500">Ref: {attempt.externalReference}</div>
                           )}
                           {attempt.status === 'FAILED' && (
                             <div className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                               <AlertTriangle className="h-3 w-3" /> 
                               {attempt.errorCode ? `${attempt.errorCode}: ` : ''}{attempt.errorMessage}
                             </div>
                           )}
                        </div>
                     </div>
                     <div className="text-left md:text-right text-xs text-gray-500 space-y-1 pl-12 md:pl-0 border-l-2 md:border-l-0 border-gray-100 ml-2 md:ml-0">
                        {attempt.startedAt && <div>Started: {new Date(attempt.startedAt).toLocaleString()}</div>}
                        {attempt.completedAt && <div>Completed: {new Date(attempt.completedAt).toLocaleString()}</div>}
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* Timeline - Intentionally showing Not available yet since we don't fabricate */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Event Timeline
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm italic">
               Timeline visualization not available yet.
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
