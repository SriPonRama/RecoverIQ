import { X, Activity, ExternalLink, Clock, CreditCard, BrainCircuit, Wallet, Smartphone, AlertCircle } from "lucide-react"
import { Badge } from "../ui/Badge"
import { useState, useEffect } from "react"
import { fetchApi } from "../../lib/api"
import type { MockPayment, MockPaymentDetail } from "../../data/payment.mock"

interface PaymentDetailDrawerProps {
  payment: MockPayment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentDetailDrawer({ payment, isOpen, onClose }: PaymentDetailDrawerProps) {
  const [details, setDetails] = useState<MockPaymentDetail | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!isOpen || !payment) return;
      try {
        const [paymentRes, attemptsRes] = await Promise.all([
          fetchApi(`/payments/${payment.id}`),
          fetchApi(`/payments/${payment.id}/attempts`)
        ]);
        
        const payData = paymentRes.data?.payment;
        const attemptsData = attemptsRes.data?.attempts || [];
        
        const mappedDetails: MockPaymentDetail = {
          ...payment,
          ...payData,
          amount: payData?.amount || payment.amount,
          currency: payData?.currency || payment.currency,
          status: payData?.status ? payData.status.charAt(0) + payData.status.slice(1).toLowerCase() : payment.status,
          method: payData?.method || payment.method,
          createdAt: payData?.createdAt ? new Date(payData.createdAt).toLocaleDateString() : payment.createdAt,
          customerPhone: "Not available yet", // Not yet provided by backend customer fetch
          attemptHistory: attemptsData.map((att: any) => ({
            id: att.id.toString(),
            attemptNumber: att.attemptNumber,
            status: att.status.charAt(0) + att.status.slice(1).toLowerCase(),
            failureCode: att.failureCode,
            failureReason: att.failureReason,
            method: att.method,
            attemptedAt: att.attemptedAt
          })),
          timeline: [], // Timeline not yet fully integrated
        };
        
        setDetails(mappedDetails);
      } catch (err) {
        console.error("Failed to load payment details:", err);
      }
    }
    
    loadData();
  }, [isOpen, payment]);

  if (!isOpen || !payment || !details) return null;

  const getMethodIcon = (method?: string | null) => {
    switch(method) {
      case 'Card': return <CreditCard className="h-4 w-4" />;
      case 'UPI': return <Smartphone className="h-4 w-4" />;
      case 'Netbanking': return <Activity className="h-4 w-4" />;
      case 'Wallet': return <Wallet className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-landing-deep/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-landing-surface shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-landing-border/60">
        <div className="sticky top-0 z-10 bg-landing-surface/90 backdrop-blur-md border-b border-landing-border/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${
              details.status === 'Failed' ? 'bg-landing-failure/10 border-landing-failure/20 text-landing-failure' :
              details.status === 'Captured' ? 'bg-landing-success/10 border-landing-success/20 text-landing-success' :
              'bg-landing-champagne/10 border-landing-champagne/20 text-landing-champagne'
            }`}>
              {getMethodIcon(details.method)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-landing-graphite">{details.id}</h2>
              <div className="flex items-center gap-2 text-sm text-landing-text-sec mt-0.5 font-semibold">
                <span>{details.currency} {details.amount.toLocaleString()}</span>
                <span>•</span>
                <Badge variant={
                  details.status === 'Captured' ? 'success' : 
                  details.status === 'Failed' ? 'error' : 
                  details.status === 'Pending' ? 'warning' : 'default'
                } className="h-5 px-1.5 text-[10px] font-bold">
                  {details.status}
                </Badge>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-landing-text-sec/60 hover:text-landing-graphite rounded-full hover:bg-landing-ivory transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 pb-20">
          
          <div className="grid grid-cols-2 gap-6">
            {/* Overview Info */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-landing-text-sec mb-3 flex items-center justify-between">
                Customer & Order
              </h3>
              <div className="bg-landing-surface border border-landing-border/40 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec font-semibold">Customer</span>
                  <span className="font-bold text-landing-graphite flex items-center gap-1 hover:text-landing-champagne transition-colors cursor-pointer">
                    {details.customerName} <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec font-semibold">Email</span>
                  <span className="font-bold text-landing-graphite truncate max-w-[150px]">{details.customerEmail}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-landing-border/40">
                  <span className="text-landing-text-sec font-semibold">Order Ref</span>
                  <span className="font-bold text-landing-graphite flex items-center gap-1 hover:text-landing-champagne transition-colors cursor-pointer">
                    {details.orderId} <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
            
            {/* Payment Info */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-landing-text-sec mb-3">Gateway Details</h3>
              <div className="bg-landing-surface border border-landing-border/40 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec font-semibold">Method</span>
                  <span className="font-bold text-landing-graphite flex items-center gap-1.5">
                    {getMethodIcon(details.method)} {details.method}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec font-semibold">Total Attempts</span>
                  <span className="font-bold text-landing-graphite">{details.attempts}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-landing-text-sec font-semibold">Gateway ID</span>
                  <span className="font-mono font-bold text-xs text-landing-text-sec text-right max-w-[150px] break-all">{details.razorpayPaymentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-landing-border/40">
                  <span className="text-landing-text-sec font-semibold">Created At</span>
                  <span className="font-bold text-landing-graphite">{details.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Risk & Recovery Information */}
          {details.status === 'Failed' && (
            <div>
              <h3 className="text-lg font-bold text-landing-graphite mb-3 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-landing-champagne" />
                Risk & Recovery Analysis
              </h3>
              <div className="bg-landing-champagne-light/10 border border-landing-champagne/30 rounded-lg p-4">
                <div className="text-sm font-medium text-landing-text-sec mb-2">
                  Risk analysis not available yet.
                </div>
                <div className="text-sm font-medium text-landing-text-sec">
                  Recovery data not available yet.
                </div>
              </div>
            </div>
          )}

          {/* Attempt History */}
          {details.attemptHistory && details.attemptHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-landing-graphite mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-landing-text-sec/60" />
                Payment Attempts
              </h3>
              <div className="space-y-3">
                {details.attemptHistory.map((attempt) => (
                  <div key={attempt.id} className="bg-landing-surface border border-landing-border/40 rounded-lg p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-landing-graphite">Attempt #{attempt.attemptNumber}</span>
                        <Badge variant={attempt.status === 'Failed' ? 'error' : 'default'} className="px-1.5 h-5 text-[10px] uppercase font-bold tracking-wider">
                          {attempt.status}
                        </Badge>
                      </div>
                      <span className="text-xs font-semibold text-landing-text-sec">{new Date(attempt.attemptedAt).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm font-semibold text-landing-graphite">
                      <span className="flex items-center gap-1.5">{getMethodIcon(attempt.method)} {attempt.method}</span>
                    </div>

                    {attempt.status === 'Failed' && (
                      <div className="bg-landing-failure/10 p-3 rounded-md border border-landing-failure/20 flex gap-3 text-sm">
                        <AlertCircle className="h-5 w-5 text-landing-failure shrink-0" />
                        <div>
                          <p className="font-bold text-landing-failure">{attempt.failureCode}</p>
                          <p className="font-semibold text-landing-text-sec mt-0.5 text-xs">{attempt.failureReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-bold text-landing-graphite mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-landing-text-sec/60" />
              Event Timeline
            </h3>
            <div className="text-sm font-semibold text-landing-text-sec p-4 border border-landing-border/40 bg-landing-surface rounded-md">
              Timeline data not available yet.
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
