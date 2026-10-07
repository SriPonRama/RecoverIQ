import { useState, useMemo, useEffect } from "react"
import { Card } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Search, Plus, Filter, Users, UserCheck, AlertTriangle, Activity, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react"
import { type MockCustomer } from "../data/customer.mock"
import { CustomerDetailDrawer } from "../components/customers/CustomerDetailDrawer"
import { CustomerFormModal, DeleteCustomerDialog } from "../components/customers/CustomerModals"
import { fetchApi } from "../lib/api"

type SortField = 'name' | 'ordersCount' | 'paymentsCount' | 'recoveredAmount' | 'lastActivity';
type SortOrder = 'asc' | 'desc';

interface ApiCustomer {
  id: number;
  merchantId: number;
  externalCustomerId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  segmentId: number | null;
}

export function Customers() {
  
  // Data State
  const [customers, setCustomers] = useState<MockCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutationLoading, setIsMutationLoading] = useState(false);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [segmentFilter, setSegmentFilter] = useState<string>("All");
  
  // Sort State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [selectedCustomer, setSelectedCustomer] = useState<MockCustomer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formCustomer, setFormCustomer] = useState<MockCustomer | null>(null); // null = Add, object = Edit
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<MockCustomer | null>(null);
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    fetchCustomers();
  }, []);

  const mapBackendCustomer = (c: ApiCustomer): MockCustomer => ({
    id: String(c.id),
    name: c.name,
    email: c.email || '',
    phone: c.phone || '',
    externalCustomerId: c.externalCustomerId || '',
    status: c.status === 'Active' || c.status === 'ACTIVE' ? 'Active' : 'Inactive',
    segment: 'New', // Safe empty state/default until segments are integrated
    ordersCount: 0,
    paymentsCount: 0,
    failedPayments: 0,
    recoveredAmount: 0,
    recoveryRate: 0,
    lastActivity: 'N/A' // Placeholder
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchApi('/customers');
      if (res.success) {
        setCustomers((res.data.customers as ApiCustomer[]).map(mapBackendCustomer));
      } else {
        setError(res.message || "Failed to load customers.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred while loading customers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = async (customer: MockCustomer) => {
    setActiveMenu(null);
    // Fetch fresh details from backend
    try {
      const res = await fetchApi(`/customers/${customer.id}`);
      if (res.success) {
        setSelectedCustomer(mapBackendCustomer(res.data.customer));
        setIsDetailOpen(true);
      }
    } catch (err) {
      console.error("Failed to load customer details", err);
      // Fallback to list data if single fetch fails
      setSelectedCustomer(customer);
      setIsDetailOpen(true);
    }
  };

  const handleAddSubmit = async (data: Partial<MockCustomer>) => {
    setIsMutationLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        externalCustomerId: data.externalCustomerId || "",
        status: data.status?.toUpperCase() || "ACTIVE"
      };

      if (formCustomer) {
        // Edit
        const res = await fetchApi(`/customers/${formCustomer.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        if (!res.success) throw new Error(res.message || "Failed to update customer");
      } else {
        // Add
        const res = await fetchApi(`/customers`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (!res.success) throw new Error(res.message || "Failed to create customer");
      }
      
      await fetchCustomers();
      setIsFormOpen(false);
      setFormCustomer(null);
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setIsMutationLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    setIsMutationLoading(true);
    try {
      const res = await fetchApi(`/customers/${customerToDelete.id}`, { method: "DELETE" });
      if (!res.success && res.status !== 204) {
         throw new Error(res.message || "Failed to delete customer");
      }
      
      setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      setIsDeleteOpen(false);
      setCustomerToDelete(null);
      if (paginatedCustomers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete customer");
    } finally {
      setIsMutationLoading(false);
    }
  };

  // Filter Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.externalCustomerId.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      // segment filtering is effectively disabled since segment is hardcoded to "New", but logic preserved
      const matchesSegment = segmentFilter === "All" || c.segment === segmentFilter;
      
      return matchesSearch && matchesStatus && matchesSegment;
    });
  }, [customers, searchQuery, statusFilter, segmentFilter]);

  // Sort Logic
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredCustomers, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setSegmentFilter("All");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 text-gray-300 ml-1 inline" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-3 w-3 text-gray-700 ml-1 inline" /> : 
      <ChevronDown className="h-3 w-3 text-gray-700 ml-1 inline" />;
  };

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-landing-champagne animate-spin mb-4" />
        <p className="text-landing-text-sec font-bold tracking-wide">Loading customers...</p>
      </div>
    );
  }

  if (error && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-10 w-10 text-landing-failure mb-4" />
        <h3 className="text-lg font-bold text-landing-graphite mb-2">Error Loading Customers</h3>
        <p className="text-landing-text-sec font-medium mb-4 text-center max-w-md">{error}</p>
        <Button onClick={fetchCustomers}>Try Again</Button>
      </div>
    );
  }

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const totalFailedPayments = customers.reduce((sum, c) => sum + (c.failedPayments || 0), 0);
  const totalRecoveryActivity = customers.filter(c => c.recoveredAmount > 0).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-landing-graphite uppercase">Customers</h1>
          <p className="text-sm font-semibold text-landing-text-sec mt-1">Manage customers and understand their payment and recovery activity.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline">Export CSV</Button>
          <Button onClick={() => { setFormCustomer(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-champagne-light/20 flex items-center justify-center text-landing-graphite border border-landing-champagne-light/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-landing-text-sec">Total Customers</p>
              <h3 className="text-xl font-bold text-landing-graphite">{totalCustomers.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-success/10 flex items-center justify-center text-landing-success border border-landing-success/30">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-landing-text-sec">Active</p>
              <h3 className="text-xl font-bold text-landing-graphite">{activeCustomers.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-failure/10 flex items-center justify-center text-landing-failure border border-landing-failure/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-landing-text-sec">Failed Payments</p>
              <h3 className="text-xl font-bold text-landing-graphite">{totalFailedPayments.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-champagne/10 flex items-center justify-center text-landing-champagne border border-landing-champagne/30">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-landing-text-sec">Recovery Activity</p>
              <h3 className="text-xl font-bold text-landing-graphite">{totalRecoveryActivity.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
        {/* Toolbar */}
        <div className="p-4 border-b border-landing-border/40 flex flex-col sm:flex-row gap-4 justify-between items-center bg-landing-ivory/30 rounded-t-xl">
          <div className="relative w-full sm:max-w-md flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-landing-text-sec/60" />
              <Input 
                placeholder="Search by name, email, phone, or ID..." 
                className="pl-9 bg-landing-surface border-landing-border/60 focus:border-landing-champagne focus:ring-1 focus:ring-landing-champagne placeholder:text-landing-text-sec/40" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-landing-text-sec" />
              <select 
                className="h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <select 
                className="h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all"
                value={segmentFilter}
                onChange={(e) => { setSegmentFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Segments</option>
                <option value="VIP">VIP</option>
                <option value="Regular">Regular</option>
                <option value="New">New</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>
            
            {(searchQuery || statusFilter !== 'All' || segmentFilter !== 'All') && (
              <Button variant="ghost" className="text-landing-text-sec font-bold px-2 hover:text-landing-graphite" onClick={resetFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
          {paginatedCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-landing-ivory rounded-full flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-landing-text-sec/60" />
              </div>
              <h3 className="text-lg font-bold text-landing-graphite mb-1">No customers found</h3>
              <p className="text-landing-text-sec font-medium text-sm max-w-sm mx-auto mb-4">
                {customers.length === 0 ? "You haven't added any customers yet." : "No customers match your current search and filters."}
              </p>
              {customers.length > 0 ? (
                <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
              ) : (
                <Button onClick={() => { setFormCustomer(null); setIsFormOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-landing-ivory/50 border-b border-landing-border/40 text-landing-text-sec font-bold">
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory transition-colors" onClick={() => handleSort('name')}>
                    Customer <SortIcon field="name" />
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory transition-colors text-right" onClick={() => handleSort('ordersCount')}>
                    Orders <SortIcon field="ordersCount" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory transition-colors text-right" onClick={() => handleSort('paymentsCount')}>
                    Payments <SortIcon field="paymentsCount" />
                  </TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory transition-colors text-right" onClick={() => handleSort('recoveredAmount')}>
                    Recovered <SortIcon field="recoveredAmount" />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory transition-colors" onClick={() => handleSort('lastActivity')}>
                    Last Activity <SortIcon field="lastActivity" />
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-landing-border/40">
                {paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-landing-ivory/50 group transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleOpenDetail(customer)}>
                        <div className="h-8 w-8 rounded-full bg-landing-champagne/10 flex items-center justify-center text-landing-graphite font-bold text-xs border border-landing-champagne/20">
                          {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-landing-graphite group-hover:text-landing-champagne transition-colors">{customer.name}</div>
                          <div className="text-[10px] text-landing-text-sec/60 font-mono font-semibold tracking-wider">{customer.externalCustomerId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-landing-text-sec">{customer.email}</span>
                        <span className="text-xs font-semibold text-landing-text-sec/60">{customer.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.segment === 'At Risk' ? 'error' : customer.segment === 'VIP' ? 'warning' : 'default'} className="bg-landing-ivory text-landing-text-sec font-bold border border-landing-border/60">
                        {customer.segment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-landing-graphite font-bold">{customer.ordersCount}</TableCell>
                    <TableCell className="text-right text-landing-graphite font-bold">{customer.paymentsCount}</TableCell>
                    <TableCell className="text-right">
                      {customer.failedPayments > 0 ? (
                        <span className="text-landing-failure font-bold bg-landing-failure/10 px-2 py-0.5 rounded-md">{customer.failedPayments}</span>
                      ) : (
                        <span className="text-landing-text-sec/40 font-semibold">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.recoveredAmount > 0 ? (
                        <span className="text-landing-success font-bold">₹{(customer.recoveredAmount / 1000).toFixed(1)}k</span>
                      ) : (
                        <span className="text-landing-text-sec/40 font-semibold">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'Active' ? 'success' : 'default'} className="font-bold">
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-landing-text-sec whitespace-nowrap">{customer.lastActivity}</TableCell>
                    <TableCell className="text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === customer.id ? null : customer.id)}
                          className="p-1.5 text-landing-text-sec/60 hover:text-landing-graphite rounded-md hover:bg-landing-ivory transition-colors focus:outline-none"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        
                        {activeMenu === customer.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                            <div className="absolute right-0 mt-1 w-36 rounded-xl shadow-lg bg-landing-surface ring-1 ring-black/5 border border-landing-border/40 z-20 overflow-hidden">
                              <div className="py-1" role="menu">
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-graphite hover:bg-landing-ivory transition-colors"
                                  onClick={() => handleOpenDetail(customer)}
                                >
                                  View Details
                                </button>
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-graphite hover:bg-landing-ivory transition-colors"
                                  onClick={() => { setFormCustomer(customer); setIsFormOpen(true); setActiveMenu(null); }}
                                >
                                  Edit Customer
                                </button>
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-bold text-landing-failure hover:bg-landing-failure/10 transition-colors"
                                  onClick={() => { setCustomerToDelete(customer); setIsDeleteOpen(true); setActiveMenu(null); }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {sortedCustomers.length > 0 && (
          <div className="p-4 border-t border-landing-border/40 bg-landing-ivory/30 rounded-b-xl flex items-center justify-between">
            <p className="text-sm font-semibold text-landing-text-sec">
              Showing <span className="font-bold text-landing-graphite">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-landing-graphite">{Math.min(currentPage * itemsPerPage, sortedCustomers.length)}</span> of <span className="font-bold text-landing-graphite">{sortedCustomers.length}</span> results
            </p>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2 border-landing-border/60 hover:bg-landing-ivory"
              >
                <ChevronLeft className="h-4 w-4 text-landing-graphite" />
              </Button>
              <div className="px-4 text-sm font-bold text-landing-graphite">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2 border-landing-border/60 hover:bg-landing-ivory"
              >
                <ChevronRight className="h-4 w-4 text-landing-graphite" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals & Drawers */}
      <CustomerDetailDrawer 
        customer={selectedCustomer} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
      
      <CustomerFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={formCustomer} 
        onSubmit={handleAddSubmit}
        isLoading={isMutationLoading}
      />
      
      <DeleteCustomerDialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm}
        customerName={customerToDelete?.name}
        isLoading={isMutationLoading}
      />
    </div>
  )
}
