import { X, AlertTriangle } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import type { MockOrder, OrderStatus } from "../../data/order.mock"
import { useState, useEffect } from "react"

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Partial<MockOrder>) => void;
  initialData?: MockOrder | null;
  customers?: { id: number; name: string; email: string | null }[];
}

export function OrderFormModal({ isOpen, onClose, onSubmit, initialData, customers = [] }: OrderFormModalProps) {
  const [formData, setFormData] = useState<Partial<MockOrder>>({
    customerId: '',
    amount: 0,
    currency: 'INR',
    razorpayOrderId: '',
    status: 'Created'
  });
  
  const [errors, setErrors] = useState<{customerId?: string, amount?: string}>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        customerId: '',
        amount: 0,
        currency: 'INR',
        razorpayOrderId: '',
        status: 'Created'
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: {customerId?: string, amount?: string} = {};
    if (!formData.customerId?.trim()) {
      newErrors.customerId = "Customer selection is required";
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Attach customer details if it's a new order
    if (!initialData) {
       const cus = customers.find(c => c.id.toString() === formData.customerId);
       if (cus) {
         formData.customerName = cus.name;
         formData.customerEmail = cus.email || "N/A";
       }
    }

    onSubmit(formData);
  };

  return (
    <>
      <div className="fixed inset-0 bg-landing-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-landing-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-landing-border/40">
          <div className="flex items-center justify-between p-4 border-b border-landing-border/40">
            <h2 className="text-lg font-bold text-landing-graphite">
              {initialData ? 'Edit Order' : 'Create Order'}
            </h2>
            <button onClick={onClose} className="p-1.5 text-landing-text-sec/60 hover:text-landing-graphite rounded-full hover:bg-landing-ivory transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto">
            <form id="order-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Customer selection (disabled in edit mode) */}
              <div>
                <label className="block text-sm font-bold text-landing-graphite mb-1">Customer <span className="text-landing-failure">*</span></label>
                <select 
                    className={`w-full h-10 rounded-md border ${errors.customerId ? 'border-landing-failure focus:ring-landing-failure' : 'border-landing-border/60 focus:border-landing-champagne focus:ring-landing-champagne'} bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:outline-none focus:ring-1 transition-all ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    disabled={!!initialData}
                  >
                    <option value="" disabled>Select a customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email || 'N/A'})</option>
                    ))}
                </select>
                {errors.customerId && <p className="text-landing-failure text-xs mt-1 font-semibold">{errors.customerId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Amount <span className="text-landing-failure">*</span></label>
                  <Input 
                    type="number"
                    value={formData.amount || ''} 
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    className={errors.amount ? "border-landing-failure focus:ring-landing-failure" : "border-landing-border/60 focus:border-landing-champagne focus:ring-landing-champagne"}
                    placeholder="0.00"
                  />
                  {errors.amount && <p className="text-landing-failure text-xs mt-1 font-semibold">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Currency</label>
                  <select 
                    className="w-full h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-landing-graphite mb-1">Status</label>
                <select 
                  className="w-full h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as OrderStatus})}
                >
                  <option value="Created">Created</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Only show Razorpay ID input if creating, otherwise hide/read-only */}
              {!initialData && (
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Razorpay Order ID (Optional)</label>
                  <Input 
                    value={formData.razorpayOrderId || ''} 
                    onChange={(e) => setFormData({...formData, razorpayOrderId: e.target.value})}
                    placeholder="order_..."
                    className="border-landing-border/60 focus:border-landing-champagne focus:ring-landing-champagne font-mono text-sm"
                  />
                </div>
              )}
            </form>
          </div>
          
          <div className="p-4 border-t border-landing-border/40 bg-landing-ivory/50 flex justify-end gap-3 mt-auto">
            <Button variant="outline" onClick={onClose} className="border-landing-border hover:bg-landing-ivory hover:text-landing-graphite">Cancel</Button>
            <Button type="submit" form="order-form">{initialData ? 'Save Changes' : 'Create Order'}</Button>
          </div>
        </div>
      </div>
    </>
  );
}


interface DeleteOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderId?: string;
}

export function DeleteOrderDialog({ isOpen, onClose, onConfirm, orderId }: DeleteOrderDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-landing-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-landing-surface rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-landing-border/40">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-landing-failure/10 flex items-center justify-center mb-4 border border-landing-failure/20">
            <AlertTriangle className="h-6 w-6 text-landing-failure" />
          </div>
          <h2 className="text-lg font-bold text-landing-graphite mb-2">Delete Order?</h2>
          <p className="text-sm font-medium text-landing-text-sec">
            Are you sure you want to delete order <span className="font-bold text-landing-graphite">{orderId}</span>? 
            This action is destructive and will remove it from the system.
          </p>
        </div>
        <div className="p-4 bg-landing-ivory/50 border-t border-landing-border/40 flex gap-3">
          <Button variant="outline" className="flex-1 border-landing-border hover:bg-landing-ivory hover:text-landing-graphite" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-landing-failure hover:bg-landing-failure/80 text-white border-transparent" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
