import { X, AlertTriangle } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import type { MockPayment, PaymentStatus, PaymentMethod } from "../../data/payment.mock"
import { useState, useEffect } from "react"
import type { ApiCustomer, ApiOrder } from "../../pages/Payments"

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: Partial<MockPayment>) => void;
  initialData?: MockPayment | null;
  customers?: ApiCustomer[];
  orders?: ApiOrder[];
}

export function PaymentFormModal({ isOpen, onClose, onSubmit, initialData, orders = [] }: PaymentFormModalProps) {
  const [formData, setFormData] = useState<Partial<MockPayment>>({
    orderId: '',
    amount: 0,
    currency: 'INR',
    razorpayPaymentId: '',
    status: 'Created',
    method: 'Unknown'
  });
  
  const [errors, setErrors] = useState<{orderId?: string, amount?: string}>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        orderId: '',
        amount: 0,
        currency: 'INR',
        razorpayPaymentId: '',
        status: 'Created',
        method: 'Unknown'
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {orderId?: string, amount?: string} = {};
    if (!initialData && !formData.orderId?.trim()) {
      newErrors.orderId = "Order selection is required";
    }
    
    if (!initialData && (!formData.amount || formData.amount <= 0)) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!initialData) {
       const ord = orders.find(o => o.id.toString() === formData.orderId);
       if (ord) {
         // API doesn't require setting customerName and email directly if they are hydrated by Payments page later
       }
    }

    onSubmit(formData);
  };

  return (
    <>
      <div className="fixed inset-0 bg-landing-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-landing-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-landing-border/60">
          <div className="flex items-center justify-between p-4 border-b border-landing-border/60">
            <h2 className="text-lg font-bold text-landing-graphite">
              {initialData ? 'Edit Payment' : 'Record Payment'}
            </h2>
            <button onClick={onClose} className="p-1.5 text-landing-text-sec/60 hover:text-landing-graphite rounded-full hover:bg-landing-ivory transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto">
            <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
              
              {!initialData && (
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Order <span className="text-landing-failure">*</span></label>
                  <select 
                      className={`w-full h-10 rounded-md border ${errors.orderId ? 'border-landing-failure' : 'border-landing-border/60'} bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-colors`}
                      value={formData.orderId || ''}
                      onChange={(e) => {
                        const ordId = e.target.value;
                        setFormData({...formData, orderId: ordId});
                      }}
                    >
                      <option value="" disabled>Select an order...</option>
                      {orders.map(o => (
                        <option key={o.id} value={o.id.toString()}>{o.id}</option>
                      ))}
                  </select>
                  {errors.orderId && <p className="text-landing-failure text-xs mt-1 font-bold">{errors.orderId}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Amount {initialData ? '' : <span className="text-landing-failure">*</span>}</label>
                  <Input 
                    type="number"
                    value={formData.amount || ''} 
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    className={`${errors.amount ? "border-landing-failure" : "border-landing-border/60"} bg-landing-surface font-semibold text-landing-graphite focus:border-landing-champagne focus:ring-landing-champagne`}
                    placeholder="0.00"
                    disabled={!!initialData}
                  />
                  {errors.amount && <p className="text-landing-failure text-xs mt-1 font-bold">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Currency</label>
                  <select 
                    className="w-full h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none disabled:opacity-50 transition-colors"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    disabled={!!initialData}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Status</label>
                  <select 
                    className="w-full h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-colors"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as PaymentStatus})}
                  >
                    <option value="Created">Created</option>
                    <option value="Pending">Pending</option>
                    <option value="Captured">Captured</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Method</label>
                  <select 
                    className="w-full h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-colors"
                    value={formData.method || 'Unknown'}
                    onChange={(e) => setFormData({...formData, method: e.target.value as PaymentMethod})}
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Netbanking">Netbanking</option>
                    <option value="Wallet">Wallet</option>
                  </select>
                </div>
              </div>

              {!initialData && (
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Razorpay Payment ID (Optional)</label>
                  <Input 
                    value={formData.razorpayPaymentId || ''} 
                    onChange={(e) => setFormData({...formData, razorpayPaymentId: e.target.value})}
                    placeholder="pay_..."
                    className="bg-landing-surface border-landing-border/60 font-semibold text-landing-graphite focus:border-landing-champagne focus:ring-landing-champagne"
                  />
                </div>
              )}
            </form>
          </div>
          
          <div className="p-4 border-t border-landing-border/60 bg-landing-ivory/50 flex justify-end gap-3 mt-auto">
            <Button variant="outline" className="border-landing-border font-bold text-landing-graphite hover:bg-landing-ivory" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="payment-form" className="bg-landing-champagne text-landing-deep font-bold hover:bg-landing-champagne/80 shadow-md">
              {initialData ? 'Save Changes' : 'Record Payment'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}


interface DeletePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentId?: string;
}

export function DeletePaymentDialog({ isOpen, onClose, onConfirm, paymentId }: DeletePaymentDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-landing-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-landing-surface rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-landing-border/60">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-landing-failure/10 flex items-center justify-center mb-4 border border-landing-failure/20">
            <AlertTriangle className="h-6 w-6 text-landing-failure" />
          </div>
          <h2 className="text-lg font-bold text-landing-graphite mb-2">Delete Payment?</h2>
          <p className="text-sm font-semibold text-landing-text-sec">
            Are you sure you want to delete payment <span className="font-bold text-landing-graphite">{paymentId}</span>? 
            This action is destructive and will remove it from the system.
          </p>
        </div>
        <div className="p-4 bg-landing-ivory/50 border-t border-landing-border/60 flex gap-3">
          <Button variant="outline" className="flex-1 border-landing-border font-bold text-landing-graphite hover:bg-landing-ivory" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-landing-failure hover:bg-landing-failure/90 text-white font-bold border-transparent shadow-md" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
