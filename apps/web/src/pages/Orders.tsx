import { useState, useMemo, useEffect } from "react"
import { Card } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Search, Plus, Filter, Download, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, ShoppingCart, CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { fetchApi } from "../lib/api"
import { type MockOrder } from "../data/order.mock"

export interface ApiCustomer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
}
import { OrderDetailDrawer } from "../components/orders/OrderDetailDrawer"
import { OrderFormModal, DeleteOrderDialog } from "../components/orders/OrderModals"

type SortField = 'id' | 'customerName' | 'amount' | 'status' | 'paymentAttempts' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function Orders() {
  // Data State
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [customerFilter, setCustomerFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All time");
  
  // Sort State
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formOrder, setFormOrder] = useState<MockOrder | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<MockOrder | null>(null);
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Derive unique customers for the filter dropdown
  const uniqueCustomers = useMemo(() => {
    return customers.map(c => ({ id: c.id.toString(), name: c.name }));
  }, [customers]);

  const mapBackendOrder = (apiOrder: any, apiCustomers: ApiCustomer[]): MockOrder => {
    const customer = apiCustomers.find(c => c.id === apiOrder.customerId);
    return {
      id: apiOrder.id.toString(),
      razorpayOrderId: apiOrder.razorpayOrderId || undefined,
      customerId: apiOrder.customerId?.toString() || "",
      customerName: customer ? customer.name : "Unknown Customer",
      customerEmail: customer && customer.email ? customer.email : "N/A",
      amount: apiOrder.amount,
      currency: apiOrder.currency || "INR",
      status: apiOrder.status,
      paymentStatus: "Unavailable",
      paymentAttempts: 0,
      recoveryStatus: "Unavailable",
      createdAt: new Date(apiOrder.createdAt).toLocaleDateString()
    };
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, customersRes] = await Promise.all([
        fetchApi('/orders'),
        fetchApi('/customers')
      ]);

      if (!ordersRes.success) throw new Error(ordersRes.message || "Failed to load orders");
      if (!customersRes.success) throw new Error(customersRes.message || "Failed to load customers");

      const custs = customersRes.data.customers;
      setCustomers(custs);
      
      const mappedOrders = ordersRes.data.orders.map((o: any) => mapBackendOrder(o, custs));
      setOrders(mappedOrders);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (o.razorpayOrderId && o.razorpayOrderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      const matchesCustomer = customerFilter === "All" || o.customerId === customerFilter;
      
      // Date filter is not fully implemented for standard ISO dates in this simple frontend,
      // so we pass all dates for now or implement real parsing if needed.
      let matchesDate = true;
      if (dateFilter !== "All time") {
        // Not implemented for real dates in this basic filter
        matchesDate = true;
      }

      return matchesSearch && matchesStatus && matchesCustomer && matchesDate;
    });
  }, [orders, searchQuery, statusFilter, customerFilter, dateFilter]);

  // Sort Logic
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Basic string parsing for amount sorting since it might just be the number
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredOrders, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage) || 1;
  const paginatedOrders = sortedOrders.slice(
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

  const handleOpenDetail = (order: MockOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    setActiveMenu(null);
  };

  const handleAddSubmit = async (data: Partial<MockOrder>) => {
    try {
      const payload = {
        customerId: data.customerId ? parseInt(data.customerId) : undefined,
        amount: data.amount,
        currency: data.currency,
        razorpayOrderId: data.razorpayOrderId || undefined,
        status: data.status
      };

      if (formOrder) {
        // Edit
        const res = await fetchApi(`/orders/${formOrder.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (!res.success) throw new Error(res.message || "Failed to update order");
      } else {
        // Add
        const res = await fetchApi('/orders', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (!res.success) throw new Error(res.message || "Failed to create order");
      }
      setIsFormOpen(false);
      setFormOrder(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save order");
    }
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        const res = await fetchApi(`/orders/${orderToDelete.id}`, { method: 'DELETE' });
        if (!res.success) throw new Error(res.message || "Failed to delete order");
        setIsDeleteOpen(false);
        setOrderToDelete(null);
        if (paginatedOrders.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        await loadData();
      } catch (err: any) {
        alert(err.message || "Failed to delete order");
      }
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setCustomerFilter("All");
    setDateFilter("All time");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 text-landing-text-sec/40 ml-1 inline" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-3 w-3 text-landing-graphite ml-1 inline" /> : 
      <ChevronDown className="h-3 w-3 text-landing-graphite ml-1 inline" />;
  };

  const totalOrders = orders.length;
  const successfulOrders = orders.filter(o => o.paymentStatus === 'Paid').length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const failedOrders = orders.filter(o => o.paymentStatus === 'Failed').length;
  const orderValue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-landing-graphite uppercase">Orders</h1>
          <p className="text-sm font-semibold text-landing-text-sec mt-1">Track customer orders, payment status, and recovery activity.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => { setFormOrder(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Create Order
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-landing-failure/10 text-landing-failure p-4 rounded-md mb-6 flex items-center justify-between border border-landing-failure/20">
          <span className="font-bold">{error}</span>
          <Button variant="outline" size="sm" onClick={loadData} className="border-landing-failure/40 text-landing-failure hover:bg-landing-failure hover:text-white">Retry</Button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-champagne-light/20 flex items-center justify-center text-landing-graphite border border-landing-champagne-light/30">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-landing-text-sec">Total Orders</p>
              <h3 className="text-xl font-bold text-landing-graphite">{totalOrders.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-success/10 flex items-center justify-center text-landing-success border border-landing-success/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-landing-text-sec">Successful</p>
              <h3 className="text-xl font-bold text-landing-graphite">{successfulOrders.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-champagne/10 flex items-center justify-center text-landing-champagne border border-landing-champagne/30">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-landing-text-sec">Pending</p>
              <h3 className="text-xl font-bold text-landing-graphite">{pendingOrders.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-failure/10 flex items-center justify-center text-landing-failure border border-landing-failure/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-landing-text-sec">Failed</p>
              <h3 className="text-xl font-bold text-landing-graphite">{failedOrders.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-ivory flex items-center justify-center text-landing-graphite border border-landing-border/60">
              <span className="text-lg font-bold">₹</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-landing-text-sec">Order Value</p>
              <h3 className="text-xl font-bold text-landing-graphite">{orderValue.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="shadow-sm border-landing-border/30 bg-landing-surface">
        {/* Toolbar */}
        <div className="p-4 border-b border-landing-border/40 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-landing-ivory/30 rounded-t-xl">
          <div className="relative w-full xl:max-w-md flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-landing-text-sec/60" />
              <Input 
                placeholder="Search by Order ID, Razorpay ID, Customer..." 
                className="pl-9 bg-landing-surface w-full border-landing-border/60 focus:border-landing-champagne focus:ring-1 focus:ring-landing-champagne placeholder:text-landing-text-sec/40" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="flex flex-wrap w-full xl:w-auto items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="hidden sm:block h-4 w-4 text-landing-text-sec" />
              <select 
                className="h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Statuses</option>
                <option value="Created">Created</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select 
                className="h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all max-w-[150px] truncate"
                value={customerFilter}
                onChange={(e) => { setCustomerFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Customers</option>
                {uniqueCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select 
                className="h-10 rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all hidden sm:block"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All time">All time</option>
                <option value="Today">Today</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
              </select>
            </div>
            
            {(searchQuery || statusFilter !== 'All' || customerFilter !== 'All' || dateFilter !== 'All time') && (
              <Button variant="ghost" className="text-landing-text-sec font-bold px-2 hover:text-landing-graphite" onClick={resetFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-landing-champagne border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-landing-text-sec font-medium">Loading orders...</p>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-landing-ivory rounded-full flex items-center justify-center mb-4 border border-landing-border/60">
                <Inbox className="h-8 w-8 text-landing-text-sec/60" />
              </div>
              <h3 className="text-lg font-bold text-landing-graphite mb-1">No orders found</h3>
              <p className="text-landing-text-sec font-medium text-sm max-w-sm mx-auto mb-4">
                {orders.length === 0 ? "You haven't received any orders yet." : "No orders match your current search and filters."}
              </p>
              {orders.length > 0 ? (
                <Button variant="outline" onClick={resetFilters} className="border-landing-border hover:bg-landing-ivory hover:text-landing-graphite">Clear Filters</Button>
              ) : (
                <Button onClick={() => { setFormOrder(null); setIsFormOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Create Order
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-landing-ivory/50 border-b border-landing-border/40">
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 text-landing-text-sec font-bold" onClick={() => handleSort('id')}>
                    Order <SortIcon field="id" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 text-landing-text-sec font-bold" onClick={() => handleSort('customerName')}>
                    Customer <SortIcon field="customerName" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 text-right text-landing-text-sec font-bold" onClick={() => handleSort('amount')}>
                    Amount <SortIcon field="amount" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 text-landing-text-sec font-bold" onClick={() => handleSort('status')}>
                    Payment Status <SortIcon field="status" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 text-right hidden lg:table-cell text-landing-text-sec font-bold" onClick={() => handleSort('paymentAttempts')}>
                    Attempts <SortIcon field="paymentAttempts" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-landing-text-sec font-bold">Recovery Status</TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 text-right hidden sm:table-cell text-landing-text-sec font-bold" onClick={() => handleSort('createdAt')}>
                    Created <SortIcon field="createdAt" />
                  </TableHead>
                  <TableHead className="text-right text-landing-text-sec font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-landing-border/40">
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-landing-ivory/30 transition-colors group">
                    <TableCell>
                      <div className="font-bold text-landing-graphite group-hover:text-landing-champagne transition-colors cursor-pointer" onClick={() => handleOpenDetail(order)}>
                        {order.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-landing-graphite">{order.customerName}</span>
                        <span className="text-xs font-semibold text-landing-text-sec">{order.customerEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-landing-graphite">
                      {order.currency === 'INR' ? '₹' : '$'}{order.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        order.paymentStatus === 'Paid' ? 'success' : 
                        order.paymentStatus === 'Failed' ? 'error' : 
                        order.paymentStatus === 'Unavailable' ? 'default' : 'warning'
                      } className={order.paymentStatus === 'Unavailable' ? 'text-landing-text-sec font-bold border-landing-border/60' : 'font-bold'}>
                        {order.paymentStatus || 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-landing-text-sec hidden lg:table-cell">
                      {order.paymentAttempts}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.recoveryStatus === 'In Progress' ? (
                        <span className="flex items-center gap-1.5 text-landing-champagne text-sm font-bold">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-landing-champagne opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-landing-champagne"></span>
                          </span>
                          {order.recoveryStatus}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-landing-text-sec">{order.recoveryStatus}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-landing-text-sec hidden sm:table-cell">
                      {order.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                          className="p-1.5 text-landing-text-sec/60 hover:text-landing-graphite rounded-md hover:bg-landing-ivory transition-colors focus:outline-none"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        
                        {activeMenu === order.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                            <div className="absolute right-0 mt-1 w-36 rounded-xl shadow-xl bg-landing-surface border border-landing-border/40 z-20">
                              <div className="py-1" role="menu">
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-graphite hover:bg-landing-ivory transition-colors"
                                  onClick={() => handleOpenDetail(order)}
                                >
                                  View Details
                                </button>
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-graphite hover:bg-landing-ivory transition-colors"
                                  onClick={() => { setFormOrder(order); setIsFormOpen(true); setActiveMenu(null); }}
                                >
                                  Edit Order
                                </button>
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-bold text-landing-failure hover:bg-landing-failure/10 transition-colors"
                                  onClick={() => { setOrderToDelete(order); setIsDeleteOpen(true); setActiveMenu(null); }}
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
        {sortedOrders.length > 0 && (
          <div className="p-4 border-t border-landing-border/40 bg-landing-ivory/50 rounded-b-xl flex items-center justify-between">
            <p className="text-sm font-semibold text-landing-text-sec">
              Showing <span className="font-bold text-landing-graphite">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-landing-graphite">{Math.min(currentPage * itemsPerPage, sortedOrders.length)}</span> of <span className="font-bold text-landing-graphite">{sortedOrders.length}</span> results
            </p>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2 border-landing-border hover:bg-landing-ivory hover:text-landing-graphite"
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
                className="px-2 border-landing-border hover:bg-landing-ivory hover:text-landing-graphite"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals & Drawers */}
      <OrderDetailDrawer 
        order={selectedOrder} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)}
        customers={customers}
      />
      
      <OrderFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={formOrder} 
        onSubmit={handleAddSubmit}
        customers={customers}
      />
      
      <DeleteOrderDialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm}
        orderId={orderToDelete?.id}
      />
    </div>
  )
}
