import { X, Activity, ExternalLink, Clock, CreditCard, BrainCircuit, Info } from "lucide-react"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { type MockOrder, type MockOrderDetail } from "../../data/order.mock"
import { useState, useEffect } from "react"
import { fetchApi } from "../../lib/api"
import type { ApiCustomer } from "../../pages/Orders"
import { useRazorpay } from "../../hooks/useRazorpay"

interface OrderDetailDrawerProps {
  order: MockOrder | null;
  isOpen: boolean;
  onClose: () => void;
  customers?: ApiCustomer[];
}

export function OrderDetailDrawer({ order, isOpen, onClose, customers = [] }: OrderDetailDrawerProps) {
  const [details, setDetails] = useState<MockOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRazorpayLoaded = useRazorpay();
  const [checkoutStatus, setCheckoutStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  // Reset checkout state when order changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      setCheckoutStatus('IDLE');
      setCheckoutMessage(null);
    }
  }, [isOpen, order?.id]);

  useEffect(() => {
    if (isOpen && order?.id) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetchApi(`/orders/${order.id}`);
          if (!res.success) throw new Error(res.message || "Failed to load order details");
          
          const backendOrder = res.data.order;
          const customer = customers.find(c => c.id.toString() === backendOrder.customerId?.toString());
          
          setDetails({
            id: backendOrder.id.toString(),
            customerId: backendOrder.customerId?.toString() || "",
            customerName: customer ? customer.name : "Unknown Customer",
            customerEmail: customer?.email || "N/A",
            customerPhone: customer?.phone || "N/A",
            amount: backendOrder.amount,
            currency: backendOrder.currency || "INR",
            status: backendOrder.status,
            createdAt: new Date(backendOrder.createdAt).toLocaleDateString(),
            razorpayOrderId: backendOrder.razorpayOrderId || "N/A",
            paymentStatus: "Unavailable",
            paymentAttempts: 0,
            paymentMethod: "Unavailable",
            recoveryStatus: "Unavailable",
            timeline: []
          });
        } catch (err: any) {
          setError(err.message || "Failed to load order details");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDetails();
    }
  }, [isOpen, order?.id, customers]);

  if (!isOpen) return null;

  const displayDetails = details || (order as MockOrderDetail);

  const handlePayWithRazorpay = async () => {
    if (!isRazorpayLoaded) {
      setCheckoutStatus('ERROR');
      setCheckoutMessage("Razorpay script not loaded yet. Please try again.");
      return;
    }

    setCheckoutStatus('LOADING');
    setCheckoutMessage("Creating payment...");

    try {
      const res = await fetchApi(`/orders/${order!.id}/razorpay`, {
        method: 'POST'
      });

      if (!res.success) {
        setCheckoutStatus('ERROR');
        setCheckoutMessage(res.message || "Failed to initiate payment");
        return;
      }

      const { razorpayOrderId, amount, currency, razorpayKeyId } = res.data;

      // The backend returns the base amount (e.g. 100 for ₹100).
      // Razorpay Checkout UI expects subunits (e.g. 10000 paise).
      const amountInSubunits = currency === 'INR' ? amount * 100 : amount * 100;

      const options = {
        key: razorpayKeyId,
        amount: amountInSubunits,
        currency: currency,
        name: "RecoverIQ",
        description: `Payment for Order #${order!.id}`,
        order_id: razorpayOrderId,
        prefill: {
          name: displayDetails.customerName !== "Unknown Customer" ? displayDetails.customerName : undefined,
          email: displayDetails.customerEmail !== "N/A" ? displayDetails.customerEmail : undefined,
          contact: displayDetails.customerPhone !== "N/A" ? displayDetails.customerPhone : undefined,
        },
        theme: {
          color: "#4f46e5"
        },
        handler: function (_response: any) {
          setCheckoutStatus('SUCCESS');
          setCheckoutMessage("Payment submitted — awaiting confirmation");
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setCheckoutStatus('ERROR');
        setCheckoutMessage("Payment was not completed: " + (response.error?.description || "Failed"));
      });

      // Show modal
      rzp.open();
      // Set state back to IDLE so the button isn't stuck on "Creating..."
      setCheckoutStatus('IDLE');
      
    } catch (err: any) {
      setCheckoutStatus('ERROR');
      setCheckoutMessage(err.message || "Failed to initiate payment");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-landing-deep/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-landing-surface shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-landing-border/60">
        <div className="sticky top-0 z-10 bg-landing-surface/90 backdrop-blur-md border-b border-landing-border/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-landing-champagne/10 border border-landing-champagne/20 flex items-center justify-center text-landing-champagne">
              <PackageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-landing-graphite">{displayDetails?.id}</h2>
              <div className="flex items-center gap-2 text-sm text-landing-text-sec mt-0.5 font-semibold">
                <span>{displayDetails?.currency} {displayDetails?.amount?.toLocaleString()}</span>
                <span>•</span>
                <Badge variant={
                  displayDetails?.status === 'Paid' ? 'success' : 
                  displayDetails?.status === 'Failed' ? 'error' : 
                  displayDetails?.status === 'Pending' ? 'warning' : 'default'
                } className="h-5 px-1.5 text-[10px] font-bold">
                  {displayDetails?.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {displayDetails?.status !== 'Paid' && (
              <Button 
                onClick={handlePayWithRazorpay} 
                disabled={checkoutStatus === 'LOADING'}
                size="sm"
                className="bg-landing-champagne hover:bg-landing-champagne/80 text-landing-deep font-bold"
              >
                {checkoutStatus === 'LOADING' ? "Creating payment..." : "Pay with Razorpay"}
              </Button>
            )}
            <button onClick={onClose} className="p-2 text-landing-text-sec/60 hover:text-landing-graphite rounded-full hover:bg-landing-ivory transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 pb-20">
          
          {isLoading && (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-landing-champagne border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="bg-landing-failure/10 text-landing-failure border border-landing-failure/20 font-bold p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {checkoutMessage && (
            <div className={`p-4 rounded-md mb-6 font-bold border ${
              checkoutStatus === 'SUCCESS' ? 'bg-landing-success/10 text-landing-success border-landing-success/20' :
              checkoutStatus === 'ERROR' ? 'bg-landing-failure/10 text-landing-failure border-landing-failure/20' :
              'bg-landing-champagne-light/10 text-landing-champagne border-landing-champagne-light/20'
            }`}>
              {checkoutMessage}
            </div>
          )}

          {!isLoading && displayDetails && (
            <>
          {/* Business Flow Representation */}
          <div className="flex items-center justify-between bg-landing-ivory/50 p-4 rounded-xl border border-landing-border/40 overflow-x-auto">
             <div className="flex items-center gap-4 min-w-max px-2">
                <FlowStep label="Order" status={displayDetails.status} />
                <Arrow />
                <FlowStep label="Payment" status={displayDetails.paymentStatus || 'Unavailable'} isFailed={displayDetails.paymentStatus === 'Failed'} />
                <Arrow />
                <FlowStep label="Risk" status={displayDetails.riskLevel || 'Unavailable'} isAlert={displayDetails.riskLevel === 'High' || displayDetails.riskLevel === 'Critical'} />
                <Arrow />
                <FlowStep label="Recovery" status={displayDetails.recoveryStatus || 'Unavailable'} isActive={displayDetails.recoveryStatus === 'In Progress'} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-landing-text-sec mb-3 flex items-center justify-between">
                Customer Information
                <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase font-bold text-landing-champagne hover:text-landing-champagne hover:bg-landing-champagne/10 px-2">View Customer <ExternalLink className="ml-1 h-3 w-3"/></Button>
              </h3>
              <div className="bg-landing-surface border border-landing-border/40 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec font-semibold">Name</span>
                  <span className="font-bold text-landing-graphite">{displayDetails.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec font-semibold">Email</span>
                  <span className="font-bold text-landing-graphite truncate max-w-[150px]">{displayDetails.customerEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec font-semibold">ID</span>
                  <span className="font-mono font-semibold text-xs text-landing-text-sec">{displayDetails.customerId}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Info */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-landing-text-sec mb-3">Payment Details</h3>
              <div className="bg-landing-surface border border-landing-border/40 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec font-semibold">Method</span>
                  <span className="font-bold text-landing-graphite flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-landing-text-sec/60" />
                    {displayDetails.paymentMethod || 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-landing-text-sec font-semibold">Attempts</span>
                  <span className="font-bold text-landing-graphite">{displayDetails.paymentAttempts || 0}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-landing-text-sec font-semibold">Gateway ID</span>
                  <span className="font-mono font-bold text-xs text-landing-text-sec text-right max-w-[150px] break-all">{displayDetails.razorpayOrderId || 'N/A'}</span>
                </div>
                {displayDetails.failureReason && (
                  <div className="mt-2 pt-2 border-t border-landing-border/40 text-xs">
                    <span className="text-landing-failure font-bold uppercase tracking-wider">Failure Reason:</span> <span className="font-semibold text-landing-text-sec">{displayDetails.failureReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recovery Information */}
          <div>
            <h3 className="text-lg font-bold text-landing-graphite mb-3 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-landing-champagne" />
              AI Recovery Insights
            </h3>
            {displayDetails.recoveryStatus === 'Unavailable' ? (
              <div className="bg-landing-ivory/50 border border-landing-border/40 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <Info className="h-6 w-6 text-landing-text-sec/60 mb-2" />
                <p className="text-sm text-landing-text-sec font-bold">Recovery data not yet available</p>
                <p className="text-xs text-landing-text-sec/80 mt-1 font-medium">The recovery integration module is not active for this order.</p>
              </div>
            ) : (
              <div className="bg-landing-champagne-light/10 border border-landing-champagne/30 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-landing-text-sec mb-1">Risk Level</div>
                    <Badge variant={displayDetails.riskLevel === 'High' || displayDetails.riskLevel === 'Critical' ? 'error' : 'warning'} className="font-bold">
                      {displayDetails.riskLevel}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-landing-text-sec mb-1">Recovery Probability</div>
                    <div className="font-bold text-landing-graphite flex items-center gap-2">
                      {displayDetails.recoveryProbability}%
                      <div className="w-12 h-1.5 rounded-full bg-landing-ivory overflow-hidden border border-landing-border/40">
                        <div className="h-full bg-landing-champagne" style={{ width: `${displayDetails.recoveryProbability}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-landing-text-sec mb-1">Recovery Status</div>
                    <Badge variant={displayDetails.recoveryStatus === 'In Progress' ? 'info' : displayDetails.recoveryStatus === 'Recovered' ? 'success' : 'default'} className="font-bold">
                      {displayDetails.recoveryStatus}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-landing-champagne/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-landing-champagne" />
                    <span className="text-sm font-semibold text-landing-text-sec">Recommended Action: <span className="font-bold text-landing-champagne">{displayDetails.recommendedAction}</span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-bold text-landing-graphite mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-landing-text-sec/60" />
              Event Timeline
            </h3>
            <div className="relative border-l-2 border-landing-border/40 ml-3 space-y-6 mt-6">
              {!displayDetails.timeline || displayDetails.timeline.length === 0 ? (
                <div className="pl-6 text-sm font-semibold text-landing-text-sec italic">No timeline events available yet.</div>
              ) : (
                displayDetails.timeline.map((event) => {
                  let iconColor = "bg-landing-text-sec/40";
                  let badgeVariant: any = "default";
                  
                  if (event.status === 'success') { iconColor = "bg-landing-success"; badgeVariant = "success"; }
                  if (event.status === 'failed') { iconColor = "bg-landing-failure"; badgeVariant = "error"; }
                  if (event.status === 'pending') { iconColor = "bg-landing-champagne"; badgeVariant = "warning"; }
                  if (event.status === 'info') { iconColor = "bg-landing-text-sec"; badgeVariant = "info"; }

                  return (
                    <div key={event.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-landing-surface ${iconColor}`}></div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-bold text-landing-graphite">{event.title}</span>
                          <Badge variant={badgeVariant} className="px-1.5 h-4 text-[10px] uppercase font-bold tracking-wider">{event.type}</Badge>
                        </div>
                        <span className="text-sm font-medium text-landing-text-sec">{event.description}</span>
                        <span className="text-xs font-semibold text-landing-text-sec/60 mt-1">{new Date(event.date).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          </>
          )}

        </div>
      </div>
    </>
  );
}

// Helpers
function PackageIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function FlowStep({ label, status, isFailed, isAlert, isActive }: { label: string, status: string, isFailed?: boolean, isAlert?: boolean, isActive?: boolean }) {
  let color = "text-landing-graphite";
  if (isFailed) color = "text-landing-failure";
  if (isAlert) color = "text-landing-failure"; // Amber mapped to failure color or champagne
  if (isActive) color = "text-landing-champagne";
  
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-[10px] font-bold text-landing-text-sec uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{status}</span>
    </div>
  )
}

function Arrow() {
  return <div className="w-8 h-px bg-landing-border/60 relative mx-2"><div className="absolute right-0 -top-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-landing-border/60"></div></div>
}
