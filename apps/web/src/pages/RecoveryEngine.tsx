import { useState, useMemo, useEffect } from "react"
import { Card } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Search, Filter, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, Plus, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { RecoveryActionDetailDrawer } from "../components/recovery/RecoveryActionDetailDrawer"
import { RecoveryActionFormModal, CancelActionDialog } from "../components/recovery/RecoveryActionModals"
import { fetchApi } from "../lib/api"

type SortField = 'id' | 'amount' | 'status' | 'scheduledAt' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function RecoveryEngine() {
  // Data State
  const [actions, setActions] = useState<any[]>([]);
  // const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  // const [dateFilter, setDateFilter] = useState<string>("Today");
  
  // Sort State
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [actionToCancel, setActionToCancel] = useState<any | null>(null);
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [actionsRes, paymentsRes, customersRes, riskCasesRes] = await Promise.all([
        fetchApi("/recovery/actions"),
        fetchApi("/payments").catch(() => ({ data: { payments: [] } })),
        fetchApi("/customers").catch(() => ({ data: { customers: [] } })),
        fetchApi("/risk-cases").catch(() => ({ data: { riskCases: [] } }))
      ]);

      const rawActions = actionsRes.data?.actions || [];
      const rawPayments = paymentsRes.data?.payments || [];
      const rawCustomers = customersRes.data?.customers || [];
      const rawRiskCases = riskCasesRes.data?.riskCases || [];

      // setPayments(rawPayments);

      // Build lookup maps
      const paymentById = new Map(rawPayments.map((p: any) => [p.id, p]));
      const customerById = new Map(rawCustomers.map((c: any) => [c.id, c]));
      const riskCaseById = new Map(rawRiskCases.map((rc: any) => [rc.id, rc]));

      // Map actions
      const mappedActions = rawActions.map((a: any) => {
        const rc: any = riskCaseById.get(a.riskCaseId);
        const p: any = rc ? paymentById.get(rc.paymentId) : null;
        const c: any = p && p.customerId ? customerById.get(p.customerId) : null;

        return {
          ...a,
          id: `RA-${a.id}`, // Format for display
          rawId: a.id,
          paymentId: p ? `pay_${p.id}` : 'Not available yet',
          customerName: c ? c.name : 'Not available yet',
          customerEmail: c ? c.email : 'Not available yet',
          amount: p ? p.amount : 0,
          currency: p ? p.currency : 'INR',
          risk: rc ? {
            level: rc.riskType === 'FRAUD' ? 'Critical' : 'High',
            score: 0.5,
            recoveryProbability: 50
          } : { level: 'Medium', score: 0.5, recoveryProbability: 50 },
          createdAt: new Date(a.createdAt).toLocaleString(),
          scheduledAt: a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : null,
          executedAt: a.executedAt ? new Date(a.executedAt).toLocaleString() : null,
        };
      });

      setActions(mappedActions);
    } catch (err: any) {
      console.error("Failed to load recovery actions:", err);
      setError("Failed to load recovery data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const filteredActions = useMemo(() => {
    return actions.filter(a => {
      const matchesSearch = 
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (a.paymentId && a.paymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.customerName && a.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesStatus = statusFilter === "All" || (a.status || "PENDING").toUpperCase() === statusFilter.toUpperCase();
      const matchesType = typeFilter === "All" || a.actionType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [actions, searchQuery, statusFilter, typeFilter]);

  // Sort Logic
  const sortedActions = useMemo(() => {
    return [...filteredActions].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredActions, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedActions.length / itemsPerPage) || 1;
  const paginatedActions = sortedActions.slice(
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

  const handleOpenDetail = (action: any) => {
    setSelectedAction(action);
    setIsDetailOpen(true);
    setActiveMenu(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await fetchApi("/recovery/actions", {
        method: "POST",
        body: JSON.stringify({
          aiDecisionId: data.aiDecisionId,
          actionType: data.actionType
        })
      });
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to create action", err);
      alert("Failed to create recovery action. Ensure an AI Decision exists.");
    }
  };

  const handleCancelConfirm = async () => {
    if (actionToCancel) {
      try {
        await fetchApi(`/recovery/actions/${actionToCancel.rawId}/cancel`, {
          method: "PATCH"
        });
        setIsCancelOpen(false);
        setActionToCancel(null);
        fetchData();
      } catch (err) {
        console.error("Failed to cancel action", err);
        alert("Failed to cancel recovery action");
      }
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setTypeFilter("All");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 text-gray-300 ml-1 inline" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-3 w-3 text-gray-700 ml-1 inline" /> : 
      <ChevronDown className="h-3 w-3 text-gray-700 ml-1 inline" />;
  };

  // KPIs
  const totalActions = actions.length;
  const pendingActions = actions.filter(a => a.status === 'PENDING').length;
  const completedActions = actions.filter(a => a.status === 'COMPLETED').length;
  const failedActions = actions.filter(a => a.status === 'FAILED').length;
  const recoverableRev = actions.filter(a => a.status === 'PENDING' || a.status === 'IN_PROGRESS').reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Recovery Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Turn high-risk payment failures into recovered revenue with intelligent recovery actions.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Action
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading recovery actions...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg flex items-center justify-center flex-col">
          <AlertCircle className="h-10 w-10 mb-2" />
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchData}>Try Again</Button>
        </div>
      ) : (
        <>
          {/* SECTION 1 — RECOVERY KPI CARDS */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <Card className="shadow-sm">
              <div className="p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Actions</p>
                <h3 className="text-xl font-bold text-gray-900">{totalActions}</h3>
              </div>
            </Card>
            <Card className="shadow-sm">
              <div className="p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Pending / Active</p>
                <h3 className="text-xl font-bold text-amber-600">{pendingActions}</h3>
              </div>
            </Card>
            <Card className="shadow-sm">
              <div className="p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Completed</p>
                <h3 className="text-xl font-bold text-emerald-600">{completedActions}</h3>
              </div>
            </Card>
            <Card className="shadow-sm">
              <div className="p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Failed</p>
                <h3 className="text-xl font-bold text-red-600">{failedActions}</h3>
              </div>
            </Card>
            <Card className="shadow-sm border-brand-200 bg-brand-50/50 shadow-brand-100/50">
              <div className="p-4">
                <p className="text-xs font-medium text-brand-700 uppercase mb-1 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Recoverable</p>
                <h3 className="text-2xl font-bold text-brand-900">₹{recoverableRev.toLocaleString()}</h3>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Operational Table */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="shadow-sm">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-t-lg">
                  <div className="relative w-full sm:max-w-md flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search Actions..." 
                        className="pl-9 bg-white" 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Filter className="hidden sm:block h-4 w-4 text-gray-400 shrink-0" />
                      
                      <select 
                        className="h-9 w-full sm:w-auto rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      >
                        <option value="All">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>

                      <select 
                        className="h-9 w-full sm:w-auto rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                      >
                        <option value="All">All Types</option>
                        <option value="Retry Payment">Retry Payment</option>
                        <option value="Alternate Method">Alternate Method</option>
                        <option value="Customer Action">Customer Action</option>
                        <option value="Manual Review">Manual Review</option>
                      </select>
                    </div>
                    
                    {(searchQuery || statusFilter !== 'All' || typeFilter !== 'All') && (
                      <Button variant="ghost" className="text-gray-500 px-2 shrink-0" onClick={resetFilters}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* ACTIVE RECOVERY ACTIONS */}
                <div className="overflow-x-auto min-h-[400px]">
                  {paginatedActions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Inbox className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No actions found</h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
                        No active recovery actions match your filters.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow>
                          <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>
                            Action ID <SortIcon field="id" />
                          </TableHead>
                          <TableHead>Payment & Customer</TableHead>
                          <TableHead className="cursor-pointer hover:bg-gray-100 text-right" onClick={() => handleSort('amount')}>
                            Amount <SortIcon field="amount" />
                          </TableHead>
                          <TableHead>Action Type</TableHead>
                          <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                            Status <SortIcon field="status" />
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-gray-100 text-right hidden sm:table-cell" onClick={() => handleSort('createdAt')}>
                            Created <SortIcon field="createdAt" />
                          </TableHead>
                          <TableHead className="text-right">Manage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedActions.map((ra) => (
                          <TableRow key={ra.id} className="hover:bg-gray-50 group">
                            <TableCell>
                              <div className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors cursor-pointer" onClick={() => handleOpenDetail(ra)}>
                                {ra.id}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{ra.customerName}</span>
                                <span className="text-[10px] text-gray-500 font-mono mt-0.5">{ra.paymentId}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-900">
                              {ra.currency === 'INR' ? '₹' : '$'}{ra.amount ? ra.amount.toLocaleString() : 0}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 truncate max-w-[150px]">
                               {ra.actionType}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                ra.status === 'COMPLETED' ? 'success' : 
                                ra.status === 'FAILED' ? 'error' : 
                                ra.status === 'IN_PROGRESS' ? 'info' : 
                                ra.status === 'CANCELLED' ? 'default' : 'warning'
                              } className="uppercase text-[10px] tracking-wider px-1.5">
                                {ra.status || 'PENDING'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm text-gray-500 hidden sm:table-cell">
                              {ra.createdAt || '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="relative inline-block text-left">
                                <button 
                                  onClick={() => setActiveMenu(activeMenu === ra.id ? null : ra.id)}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors focus:outline-none"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                                
                                {activeMenu === ra.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                                    <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                      <div className="py-1" role="menu">
                                        <button 
                                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          onClick={() => handleOpenDetail(ra)}
                                        >
                                          View Details
                                        </button>
                                        {(ra.status === 'PENDING') && (
                                          <>
                                            <button 
                                              className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                                              onClick={() => { setActionToCancel(ra); setIsCancelOpen(true); setActiveMenu(null); }}
                                            >
                                              Cancel Action
                                            </button>
                                          </>
                                        )}
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
                {sortedActions.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50/50 rounded-b-lg flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedActions.length)}</span> of <span className="font-medium">{sortedActions.length}</span> results
                    </p>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="px-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="px-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Modals & Drawers */}
      <RecoveryActionDetailDrawer 
        action={selectedAction} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        onRefresh={fetchData}
      />
      
      <RecoveryActionFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit} 
      />
      
      <CancelActionDialog 
        isOpen={isCancelOpen} 
        onClose={() => setIsCancelOpen(false)} 
        onConfirm={handleCancelConfirm}
        actionId={actionToCancel?.id}
      />
      
    </div>
  )
}
