import { X, AlertTriangle } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import type { MockCustomer, CustomerStatus, CustomerSegment } from "../../data/customer.mock"
import { useState, useEffect } from "react"

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Partial<MockCustomer>) => void;
  initialData?: MockCustomer | null;
  isLoading?: boolean;
}

export function CustomerFormModal({ isOpen, onClose, onSubmit, initialData, isLoading }: CustomerFormModalProps) {
  const [formData, setFormData] = useState<Partial<MockCustomer>>({
    name: '',
    email: '',
    phone: '',
    externalCustomerId: '',
    status: 'Active',
    segment: 'New'
  });
  
  const [errors, setErrors] = useState<{name?: string, email?: string}>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        externalCustomerId: '',
        status: 'Active',
        segment: 'New'
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: {name?: string, email?: string} = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      <div className="fixed inset-0 bg-landing-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-landing-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-landing-border/40">
          <div className="flex items-center justify-between p-4 border-b border-landing-border/40">
            <h2 className="text-lg font-bold text-landing-graphite">
              {initialData ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <button onClick={onClose} className="p-1.5 text-landing-text-sec/60 hover:text-landing-graphite rounded-full hover:bg-landing-ivory transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto">
            <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-landing-graphite mb-1">Name <span className="text-landing-failure">*</span></label>
                <Input 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={errors.name ? "border-landing-failure focus:ring-landing-failure" : "border-landing-border/60 focus:border-landing-champagne focus:ring-landing-champagne"}
                  placeholder="e.g. John Doe"
                />
                {errors.name && <p className="text-landing-failure text-xs mt-1 font-semibold">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-landing-graphite mb-1">Email</label>
                <Input 
                  value={formData.email || ''} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={errors.email ? "border-landing-failure focus:ring-landing-failure" : "border-landing-border/60 focus:border-landing-champagne focus:ring-landing-champagne"}
                  placeholder="john@example.com"
                  type="email"
                />
                {errors.email && <p className="text-landing-failure text-xs mt-1 font-semibold">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-landing-graphite mb-1">Phone</label>
                <Input 
                  value={formData.phone || ''} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 9876543210"
                  className="border-landing-border/60 focus:border-landing-champagne focus:ring-landing-champagne"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-landing-graphite mb-1">External Customer ID</label>
                <Input 
                  value={formData.externalCustomerId || ''} 
                  onChange={(e) => setFormData({...formData, externalCustomerId: e.target.value})}
                  placeholder="cus_..."
                  className="border-landing-border/60 focus:border-landing-champagne focus:ring-landing-champagne font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Status</label>
                  <select 
                    className="w-full h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as CustomerStatus})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-landing-graphite mb-1">Segment</label>
                  <select 
                    className="w-full h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-2 text-sm font-semibold text-landing-graphite focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all"
                    value={formData.segment}
                    onChange={(e) => setFormData({...formData, segment: e.target.value as CustomerSegment})}
                  >
                    <option value="VIP">VIP</option>
                    <option value="Regular">Regular</option>
                    <option value="New">New</option>
                    <option value="At Risk">At Risk</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          
          <div className="p-4 border-t border-landing-border/40 bg-landing-ivory/50 flex justify-end gap-3 mt-auto">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-landing-border hover:bg-landing-ivory hover:text-landing-graphite">Cancel</Button>
            <Button type="submit" form="customer-form" disabled={isLoading}>
              {isLoading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Customer')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}


interface DeleteCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName?: string;
  isLoading?: boolean;
}

export function DeleteCustomerDialog({ isOpen, onClose, onConfirm, customerName, isLoading }: DeleteCustomerDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-landing-deep/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-landing-surface rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-landing-border/40">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-landing-failure/10 flex items-center justify-center mb-4 border border-landing-failure/20">
            <AlertTriangle className="h-6 w-6 text-landing-failure" />
          </div>
          <h2 className="text-lg font-bold text-landing-graphite mb-2">Delete Customer?</h2>
          <p className="text-sm font-medium text-landing-text-sec">
            Are you sure you want to delete <span className="font-bold text-landing-graphite">{customerName}</span>? 
            This action is destructive and cannot be undone.
          </p>
        </div>
        <div className="p-4 bg-landing-ivory/50 border-t border-landing-border/40 flex gap-3">
          <Button variant="outline" className="flex-1 border-landing-border hover:bg-landing-ivory hover:text-landing-graphite" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button className="flex-1 bg-landing-failure hover:bg-landing-failure/80 text-white border-transparent" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
