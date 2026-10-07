import { useState, useMemo, useEffect } from "react"
import { Card } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Search, Plus, Filter, Download, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, CreditCard, CheckCircle2, AlertTriangle, Clock, Wallet, Activity, Smartphone } from "lucide-react"
import { type MockPayment } from "../data/payment.mock"
import { fetchApi } from "../lib/api"
import { PaymentDetailDrawer } from "../components/payments/PaymentDetailDrawer"
import { PaymentFormModal, DeletePaymentDialog } from "../components/payments/PaymentModals"

export interface ApiPayment {
  id: number;
  orderId: number | null;
  customerId: number | null;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  capturedAt: string | null;
  failedAt: string | null;
  createdAt: string;
}

export interface ApiCustomer {
  id: number;
  name: string;
  email: string | null;
}

export interface ApiOrder {
  id: number;
}

type SortField = 'id' | 'customerName' | 'amount' | 'status' | 'attempts' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function Payments() {
  // Data State
  const [payments, setPayments] = useState<MockPayment[]>([]);
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [methodFilter, setMethodFilter] = useState<string>("All");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [recoveryFilter, setRecoveryFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All time");
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  
  // Sort State
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [selectedPayment, setSelectedPayment] = useState<MockPayment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formPayment, setFormPayment] = useState<MockPayment | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<MockPayment | null>(null);
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, customersRes, ordersRes] = await Promise.all([
        fetchApi("/payments"),
        fetchApi("/customers"),
        fetchApi("/orders")
      ]);
      
      const customersData = customersRes.data?.customers || [];
      const ordersData = ordersRes.data?.orders || [];
      const paymentsData = paymentsRes.data?.payments || [];
      
      setCustomers(customersData);
      setOrders(ordersData);

      const mappedPayments = paymentsData.map((p: ApiPayment) => {
        const customer = customersData.find((c: ApiCustomer) => c.id === p.customerId);
        
        return {
          id: p.id.toString(),
          orderId: p.orderId ? p.orderId.toString() : "",
          customerId: p.customerId ? p.customerId.toString() : "",
          razorpayPaymentId: p.razorpayPaymentId,
          amount: p.amount,
          currency: p.currency,
          status: p.status.charAt(0) + p.status.slice(1).toLowerCase(),
          method: p.method,
          customerName: customer?.name || "Unknown Customer",
          customerEmail: customer?.email || "",
          createdAt: new Date(p.createdAt).toLocaleDateString(),
          capturedAt: p.capturedAt ? new Date(p.capturedAt).toLocaleDateString() : undefined,
          failedAt: p.failedAt ? new Date(p.failedAt).toLocaleDateString() : undefined,
          attempts: undefined,
          riskLevel: undefined,
          recoveryStatus: undefined,
        } as MockPayment;
      });
      
      setPayments(mappedPayments);
    } catch (err: any) {
      console.error("Failed to load payments:", err);
      setError(err.message || "Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter Logic
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.orderId && p.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesMethod = methodFilter === "All" || p.method === methodFilter;
      const matchesRisk = riskFilter === "All" || p.riskLevel === riskFilter;
      const matchesRecovery = recoveryFilter === "All" || p.recoveryStatus === recoveryFilter;
      
      // Date filter is not fully implemented for standard ISO dates in this simple frontend,
      // so we pass all dates for now or implement real parsing if needed.
      let matchesDate = true;
      if (dateFilter !== "All time") {
        matchesDate = true;
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesRisk && matchesRecovery && matchesDate;
    });
  }, [payments, searchQuery, statusFilter, methodFilter, riskFilter, recoveryFilter, dateFilter]);

  // Sort Logic
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
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
  }, [filteredPayments, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage) || 1;
  const paginatedPayments = sortedPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleOpenDetail = (payment: MockPayment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
    setActiveMenu(null);
  };

  const handleAddSubmit = async (data: Partial<MockPayment>) => {
    try {
      if (formPayment) {
        // Edit
        await fetchApi(`/payments/${formPayment.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status?.toUpperCase()
          }),
        });
      } else {
        // Add
        await fetchApi("/payments", {
          method: "POST",
          body: JSON.stringify({
            orderId: data.orderId ? parseInt(data.orderId, 10) : undefined,
            customerId: data.customerId ? parseInt(data.customerId, 10) : undefined,
            amount: data.amount,
            currency: data.currency || "INR",
            method: data.method,
            status: data.status?.toUpperCase(),
          }),
        });
      }
      await fetchAllData();
      setIsFormOpen(false);
      setFormPayment(null);
    } catch (err: any) {
      console.error("Failed to save payment:", err);
      // Let the modal handle error display, or just alert for now
      alert(err.message || "Failed to save payment");
    }
  };

  const handleDeleteConfirm = async () => {
    if (paymentToDelete) {
      try {
        await fetchApi(`/payments/${paymentToDelete.id}`, {
          method: "DELETE",
        });
        await fetchAllData();
        setIsDeleteOpen(false);
        setPaymentToDelete(null);
        if (paginatedPayments.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err: any) {
        console.error("Failed to delete payment:", err);
        alert(err.message || "Failed to delete payment");
      }
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setMethodFilter("All");
    setRiskFilter("All");
    setRecoveryFilter("All");
    setDateFilter("All time");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 text-gray-300 ml-1 inline" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-3 w-3 text-gray-700 ml-1 inline" /> : 
      <ChevronDown className="h-3 w-3 text-gray-700 ml-1 inline" />;
  };

  const getMethodIcon = (method?: string | null) => {
    switch(method) {
      case 'Card': return <CreditCard className="h-3.5 w-3.5" />;
      case 'UPI': return <Smartphone className="h-3.5 w-3.5" />;
      case 'Netbanking': return <Activity className="h-3.5 w-3.5" />;
      case 'Wallet': return <Wallet className="h-3.5 w-3.5" />;
      default: return <CreditCard className="h-3.5 w-3.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Failed to load payments: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-landing-graphite font-editorial">Payments</h1>
          <p className="text-sm font-semibold text-landing-text-sec mt-1">Monitor payment performance, investigate failures, and track recovery opportunities.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" className="border-landing-border font-bold text-landing-graphite hover:bg-landing-ivory hover:text-landing-graphite shadow-sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="bg-landing-champagne text-landing-deep font-bold hover:bg-landing-champagne/80 shadow-md" onClick={() => { setFormPayment(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card className="shadow-sm border border-landing-border/40 bg-landing-surface col-span-2 md:col-span-1 lg:col-span-1">
          <div className="p-4">
            <p className="text-[10px] font-bold text-landing-text-sec uppercase mb-1 tracking-wider">Total Payments</p>
            <h3 className="text-2xl font-bold text-landing-graphite">{payments.length.toLocaleString()}</h3>
          </div>
        </Card>
        <Card className="shadow-sm border border-landing-border/40 bg-landing-surface">
          <div className="p-4">
            <p className="text-[10px] font-bold text-landing-success uppercase mb-1 flex items-center gap-1 tracking-wider"><CheckCircle2 className="h-3.5 w-3.5"/> Successful</p>
            <h3 className="text-2xl font-bold text-landing-graphite">{payments.filter(p => p.status === 'Successful' || p.status === 'Captured').length.toLocaleString()}</h3>
          </div>
        </Card>
        <Card className="shadow-sm border border-landing-border/40 bg-landing-surface">
          <div className="p-4">
            <p className="text-[10px] font-bold text-landing-failure uppercase mb-1 flex items-center gap-1 tracking-wider"><AlertTriangle className="h-3.5 w-3.5"/> Failed</p>
            <h3 className="text-2xl font-bold text-landing-graphite">{payments.filter(p => p.status === 'Failed').length.toLocaleString()}</h3>
          </div>
        </Card>
        <Card className="shadow-sm border border-landing-border/40 bg-landing-surface">
          <div className="p-4">
            <p className="text-[10px] font-bold text-landing-champagne uppercase mb-1 flex items-center gap-1 tracking-wider"><Clock className="h-3.5 w-3.5"/> Pending</p>
            <h3 className="text-2xl font-bold text-landing-graphite">{payments.filter(p => p.status === 'Created' || p.status === 'Authorized' || p.status === 'Pending').length.toLocaleString()}</h3>
          </div>
        </Card>
        <Card className="shadow-sm border-landing-champagne/30 bg-landing-champagne-light/10">
          <div className="p-4">
            <p className="text-[10px] font-bold text-landing-champagne uppercase mb-1 tracking-wider">At-Risk Amount</p>
            <h3 className="text-xl font-bold text-landing-champagne text-sm">Unavailable</h3>
          </div>
        </Card>
        <Card className="shadow-sm border-landing-champagne/30 bg-landing-champagne-light/10">
          <div className="p-4">
            <p className="text-[10px] font-bold text-landing-champagne uppercase mb-1 tracking-wider">Recovered Amount</p>
            <h3 className="text-xl font-bold text-landing-champagne text-sm">Unavailable</h3>
          </div>
        </Card>
      </div>

      <Card className="shadow-sm border border-landing-border/40 overflow-hidden bg-landing-surface">
        {/* Toolbar */}
        <div className="p-4 border-b border-landing-border/60 flex flex-col gap-4 bg-landing-ivory/50 rounded-t-lg">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            <div className="relative w-full xl:max-w-md flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-landing-text-sec/60" />
                <Input 
                  placeholder="Search by Payment ID, Order ID, Customer..." 
                  className="pl-9 bg-landing-surface w-full border-landing-border/60 focus:border-landing-champagne focus:ring-landing-champagne font-semibold text-landing-graphite" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap w-full xl:w-auto items-center gap-2">
              <Button 
                variant="outline" 
                className="lg:hidden font-bold text-landing-graphite border-landing-border/60 w-full sm:w-auto justify-center hover:bg-landing-ivory" 
                onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              >
                <Filter className="mr-2 h-4 w-4" /> Filters {isAdvancedFiltersOpen ? <ChevronUp className="ml-1 h-4 w-4"/> : <ChevronDown className="ml-1 h-4 w-4"/>}
              </Button>
              
              <div className={`w-full lg:w-auto lg:flex flex-wrap items-center gap-2 ${isAdvancedFiltersOpen ? 'flex' : 'hidden'}`}>
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <Filter className="hidden lg:block h-4 w-4 text-landing-text-sec/60 shrink-0" />
                  <select 
                    className="h-9 w-full lg:w-auto rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none transition-colors"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Created">Created</option>
                    <option value="Pending">Pending</option>
                    <option value="Captured">Captured</option>
                    <option value="Failed">Failed</option>
                  </select>
                  <select 
                    className="h-9 w-full lg:w-auto rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none transition-colors"
                    value={methodFilter}
                    onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="All">All Methods</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Netbanking">Netbanking</option>
                    <option value="Wallet">Wallet</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <select 
                    className="h-9 w-full lg:w-auto rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none transition-colors"
                    value={riskFilter}
                    onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="All">All Risks</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <select 
                    className="h-9 w-full lg:w-auto rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none hidden sm:block transition-colors"
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="All time">All Dates</option>
                    <option value="Today">Today</option>
                    <option value="Last 7 days">Last 7 days</option>
                    <option value="Last 30 days">Last 30 days</option>
                  </select>
                </div>
              </div>
              
              {(searchQuery || statusFilter !== 'All' || methodFilter !== 'All' || riskFilter !== 'All' || dateFilter !== 'All time') && (
                <Button variant="ghost" className="text-landing-text-sec font-bold px-2 shrink-0 hover:bg-landing-ivory hover:text-landing-graphite" onClick={resetFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
          {paginatedPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-landing-ivory rounded-full flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-landing-text-sec/60" />
              </div>
              <h3 className="text-lg font-bold text-landing-graphite mb-1">No payments found</h3>
              <p className="text-landing-text-sec text-sm max-w-sm mx-auto mb-4 font-semibold">
                {payments.length === 0 ? "You haven't recorded any payments yet." : "No payments match your current search and filters."}
              </p>
              {payments.length > 0 ? (
                <Button variant="outline" className="border-landing-border hover:bg-landing-ivory font-bold" onClick={resetFilters}>Clear Filters</Button>
              ) : (
                <Button className="bg-landing-champagne hover:bg-landing-champagne/80 text-landing-deep font-bold" onClick={() => { setFormPayment(null); setIsFormOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Record Payment
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-landing-ivory/50 border-b border-landing-border/60">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-[10px] font-bold uppercase tracking-wider text-landing-text-sec" onClick={() => handleSort('id')}>
                    Payment <SortIcon field="id" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-[10px] font-bold uppercase tracking-wider text-landing-text-sec" onClick={() => handleSort('customerName')}>
                    Customer & Order <SortIcon field="customerName" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-[10px] font-bold uppercase tracking-wider text-landing-text-sec text-right" onClick={() => handleSort('amount')}>
                    Amount <SortIcon field="amount" />
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Method</TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-[10px] font-bold uppercase tracking-wider text-landing-text-sec" onClick={() => handleSort('status')}>
                    Status <SortIcon field="status" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-right hidden xl:table-cell text-[10px] font-bold uppercase tracking-wider text-landing-text-sec" onClick={() => handleSort('attempts')}>
                    Attempts <SortIcon field="attempts" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Risk & Recovery</TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-right hidden sm:table-cell text-[10px] font-bold uppercase tracking-wider text-landing-text-sec" onClick={() => handleSort('createdAt')}>
                    Created <SortIcon field="createdAt" />
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id} className={`group border-b border-landing-border/40 ${payment.status === 'Failed' ? 'bg-landing-failure/5' : 'hover:bg-landing-ivory/50'} transition-colors`}>
                    <TableCell>
                      <div className="font-bold text-landing-graphite group-hover:text-landing-champagne transition-colors cursor-pointer flex flex-col" onClick={() => handleOpenDetail(payment)}>
                        <span>{payment.id}</span>
                        {payment.status === 'Failed' && <span className="text-[10px] text-landing-failure font-bold uppercase mt-0.5 tracking-wider">Action Required</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-landing-graphite">{payment.customerName}</span>
                        <span className="text-xs font-semibold text-landing-text-sec">{payment.orderId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-landing-graphite">
                      {payment.currency === 'INR' ? '₹' : '$'}{payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-landing-graphite font-semibold text-sm">
                        {getMethodIcon(payment.method)}
                        <span>{payment.method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        payment.status === 'Captured' ? 'success' : 
                        payment.status === 'Failed' ? 'error' : 'warning'
                      } className="font-bold">
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-landing-graphite hidden xl:table-cell">
                      {payment.attempts}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        {payment.riskLevel !== 'Low' && (
                          <div className={`text-xs font-bold uppercase tracking-wider ${payment.riskLevel === 'Critical' || payment.riskLevel === 'High' ? 'text-landing-failure' : 'text-landing-champagne'}`}>
                            {payment.riskLevel} Risk
                          </div>
                        )}
                        {payment.recoveryStatus !== 'Not Eligible' && (
                          <div className={`text-xs font-bold uppercase tracking-wider ${payment.recoveryStatus === 'In Progress' ? 'text-landing-champagne' : payment.recoveryStatus === 'Recovered' ? 'text-landing-success' : 'text-landing-text-sec'}`}>
                            {payment.recoveryStatus}
                          </div>
                        )}
                        {payment.riskLevel === 'Low' && payment.recoveryStatus === 'Not Eligible' && (
                          <span className="text-xs text-landing-text-sec/60">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-landing-text-sec hidden sm:table-cell">
                      {payment.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === payment.id ? null : payment.id)}
                          className="p-1.5 text-landing-text-sec/60 hover:text-landing-graphite rounded-md hover:bg-landing-ivory transition-colors focus:outline-none"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        
                        {activeMenu === payment.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                            <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-landing-surface border border-landing-border/60 ring-1 ring-black ring-opacity-5 z-20">
                              <div className="py-1" role="menu">
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-graphite hover:bg-landing-ivory transition-colors"
                                  onClick={() => handleOpenDetail(payment)}
                                >
                                  View Details
                                </button>
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-graphite hover:bg-landing-ivory transition-colors"
                                  onClick={() => { setFormPayment(payment); setIsFormOpen(true); setActiveMenu(null); }}
                                >
                                  Edit Status
                                </button>
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-failure hover:bg-landing-failure/10 transition-colors"
                                  onClick={() => { setPaymentToDelete(payment); setIsDeleteOpen(true); setActiveMenu(null); }}
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
        {sortedPayments.length > 0 && (
          <div className="p-4 border-t border-landing-border/60 bg-landing-ivory/50 rounded-b-lg flex items-center justify-between">
            <p className="text-sm font-semibold text-landing-text-sec">
              Showing <span className="font-bold text-landing-graphite">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-landing-graphite">{Math.min(currentPage * itemsPerPage, sortedPayments.length)}</span> of <span className="font-bold text-landing-graphite">{sortedPayments.length}</span> results
            </p>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2 border-landing-border/60 hover:bg-landing-ivory text-landing-graphite"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 text-sm font-bold text-landing-graphite">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2 border-landing-border/60 hover:bg-landing-ivory text-landing-graphite"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals & Drawers */}
      <PaymentDetailDrawer 
        payment={selectedPayment} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
      
      <PaymentFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={formPayment} 
        onSubmit={handleAddSubmit}
        customers={customers}
        orders={orders}
      />
      
      <DeletePaymentDialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm}
        paymentId={paymentToDelete?.id}
      />
    </div>
  )
}
