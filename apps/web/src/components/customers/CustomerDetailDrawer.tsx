import { X } from "lucide-react"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { type MockCustomer, type MockOrder, type MockPayment, type MockRecoveryActivity } from "../../data/customer.mock"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table"

interface CustomerDetailDrawerProps {
  customer: MockCustomer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailDrawer({ customer, isOpen, onClose }: CustomerDetailDrawerProps) {
  if (!isOpen || !customer) return null;

  // Real backend does not yet return populated relations (orders, payments, recoveryActivity)
  // We use safe empty arrays to preserve the layout until they are integrated.
  const details: { orders: MockOrder[], payments: MockPayment[], recoveryActivity: MockRecoveryActivity[] } = {
    orders: [],
    payments: [],
    recoveryActivity: []
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
            <div className="h-10 w-10 rounded-full bg-landing-champagne/10 flex items-center justify-center text-landing-champagne font-bold text-lg border border-landing-champagne/20">
              {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-landing-graphite">{customer.name}</h2>
              <div className="flex items-center gap-2 text-sm text-landing-text-sec mt-0.5">
                <span className="font-mono font-semibold text-[11px] tracking-wider">{customer.externalCustomerId}</span>
                <span>•</span>
                <Badge variant={customer.status === 'Active' ? 'success' : 'default'} className="h-5 px-1.5 text-[10px] font-bold">
                  {customer.status}
                </Badge>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-landing-text-sec/60 hover:text-landing-graphite rounded-full hover:bg-landing-ivory transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 pb-20">
          {/* Overview & Contact */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-landing-text-sec mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-landing-border/20 pb-2">
                  <span className="text-landing-text-sec font-medium">Email</span>
                  <span className="font-bold text-landing-graphite">{customer.email}</span>
                </div>
                <div className="flex justify-between border-b border-landing-border/20 pb-2">
                  <span className="text-landing-text-sec font-medium">Phone</span>
                  <span className="font-bold text-landing-graphite">{customer.phone}</span>
                </div>
                <div className="flex justify-between pb-2 items-center">
                  <span className="text-landing-text-sec font-medium">Segment</span>
                  <Badge variant={customer.segment === 'At Risk' ? 'error' : customer.segment === 'VIP' ? 'warning' : 'default'} className="bg-landing-ivory text-landing-graphite font-bold border-landing-border/60">
                    {customer.segment}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-landing-text-sec mb-3">Customer Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-landing-ivory/50 p-3 rounded-lg border border-landing-border/40">
                  <div className="text-xs text-landing-text-sec font-semibold mb-1">Total Orders</div>
                  <div className="font-bold text-landing-graphite">{customer.ordersCount}</div>
                </div>
                <div className="bg-landing-ivory/50 p-3 rounded-lg border border-landing-border/40">
                  <div className="text-xs text-landing-text-sec font-semibold mb-1">Payments</div>
                  <div className="font-bold text-landing-graphite">{customer.paymentsCount}</div>
                </div>
                <div className="bg-landing-failure/10 p-3 rounded-lg border border-landing-failure/20">
                  <div className="text-xs text-landing-failure font-bold mb-1">Failed Payments</div>
                  <div className="font-bold text-landing-failure">{customer.failedPayments}</div>
                </div>
                <div className="bg-landing-success/10 p-3 rounded-lg border border-landing-success/20">
                  <div className="text-xs text-landing-success font-bold mb-1">Recovered</div>
                  <div className="font-bold text-landing-success">₹{(customer.recoveredAmount / 1000).toFixed(1)}k</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Recovery Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-landing-graphite">Recovery Activity</h3>
              <Button variant="outline" size="sm">View All Logs</Button>
            </div>
            <Card className="shadow-sm border-landing-border/40 bg-landing-surface">
              <CardContent className="p-0">
                <div className="relative border-l-2 border-landing-border/40 ml-6 my-6 space-y-6">
                  {details.recoveryActivity.map((act) => (
                    <div key={act.id} className="relative pl-6 pr-4">
                      <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-landing-surface bg-landing-champagne"></div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-landing-graphite">{act.type}</span>
                          <span className="text-xs font-semibold text-landing-text-sec/60">{new Date(act.date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-sm font-medium text-landing-text-sec mt-1">{act.description}</span>
                        <div className="mt-2">
                          <Badge variant="success" className="bg-landing-success/10 text-landing-success border-landing-success/20 text-[10px] font-bold">
                            {act.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payments */}
          <div>
            <h3 className="text-lg font-bold text-landing-graphite mb-4">Recent Payments</h3>
            <Card className="shadow-sm border-landing-border/40 bg-landing-surface">
              <Table>
                <TableHeader className="bg-landing-ivory/50 border-b border-landing-border/40">
                  <TableRow>
                    <TableHead className="text-landing-text-sec font-bold">Date</TableHead>
                    <TableHead className="text-landing-text-sec font-bold">Amount</TableHead>
                    <TableHead className="text-landing-text-sec font-bold">Method</TableHead>
                    <TableHead className="text-right text-landing-text-sec font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-landing-border/40">
                  {details.payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-landing-ivory/30 transition-colors">
                      <TableCell className="text-sm font-semibold text-landing-text-sec">{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold text-landing-graphite">₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm font-medium text-landing-text-sec">{payment.method}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={
                          payment.status === 'Successful' ? 'success' : 
                          payment.status === 'Failed' ? 'error' : 'info'
                        } className={payment.status === 'Recovered' ? 'bg-landing-champagne-light/20 text-landing-graphite border-landing-champagne-light/30' : 'font-bold'}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
