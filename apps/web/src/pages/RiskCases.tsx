import { useState, useMemo, useEffect } from "react"
import { Card } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Search, Filter, Download, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, ShieldAlert, Activity, AlertTriangle, CheckCircle2, SearchIcon, RefreshCw, AlertCircle } from "lucide-react"
import { RiskCaseDetailDrawer } from "../components/risk/RiskCaseDetailDrawer"
import { RiskStatusModal } from "../components/risk/RiskCaseModals"
import { fetchApi } from "../lib/api"

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type RiskCaseStatus = 'Open' | 'Investigating' | 'Action Planned' | 'Resolved';

export interface RiskPredictionUI {
  riskScore: number;
  recoveryProbability: number;
  confidence: number;
  featuresSnapshot: {
    paymentAmount: number;
    attemptCount: number;
    customerSuccessHistory: number;
    customerFailureHistory: number;
    flagReasons: string[];
  };
  predictedAt: string;
}

export interface RiskCaseUI {
  id: string;
  paymentId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amountAtRisk: number;
  currency: string;
  status: RiskCaseStatus;
  riskType: string;
  riskLevel: RiskLevel;
  detectedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  prediction: RiskPredictionUI;
}

type SortField = 'id' | 'amountAtRisk' | 'riskScore' | 'recoveryProbability' | 'confidence' | 'detectedAt';
type SortOrder = 'asc' | 'desc';

export function RiskCases() {
  // Data State
  const [cases, setCases] = useState<RiskCaseUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [recoveryFilter, setRecoveryFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All time");
  
  // Sort State
  const [sortField, setSortField] = useState<SortField>('detectedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [selectedCase, setSelectedCase] = useState<RiskCaseUI | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusCase, setStatusCase] = useState<RiskCaseUI | null>(null);
  const [targetStatus, setTargetStatus] = useState<RiskCaseStatus | undefined>(undefined);
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [casesRes, paymentsRes, ordersRes, customersRes] = await Promise.all([
        fetchApi("/risk-cases").catch(() => ({ data: { riskCases: [] } })),
        fetchApi("/payments").catch(() => ({ data: { payments: [] } })),
        fetchApi("/orders").catch(() => ({ data: { orders: [] } })),
        fetchApi("/customers").catch(() => ({ data: { customers: [] } }))
      ]);

      const rawCases = casesRes.data?.riskCases || [];
      const payments = paymentsRes.data?.payments || [];
      const orders = ordersRes.data?.orders || [];
      const customers = customersRes.data?.customers || [];

      const mappedCases: RiskCaseUI[] = rawCases.map((rc: any) => {
        const payment = payments.find((p: any) => p.id === rc.paymentId);
        const order = payment?.orderId ? orders.find((o: any) => o.id === payment.orderId) : null;
        const customer = payment?.customerId ? customers.find((c: any) => c.id === payment.customerId) : null;

        const uiStatusMap: Record<string, RiskCaseStatus> = {
          "OPEN": "Open",
          "INVESTIGATING": "Investigating",
          "ACTION PLANNED": "Action Planned",
          "RESOLVED": "Resolved"
        };
        
        const uiRiskLevelMap: Record<string, RiskLevel> = {
          "LOW": "Low",
          "MEDIUM": "Medium",
          "HIGH": "High",
          "CRITICAL": "Critical"
        };

        const prediction = rc.prediction || {
          riskScore: 0,
          recoveryProbability: 0,
          confidence: 0,
          featuresSnapshot: { paymentAmount: 0, attemptCount: 0, customerSuccessHistory: 0, customerFailureHistory: 0, flagReasons: [] },
          predictedAt: rc.detectedAt,
          riskLevel: "LOW"
        };

        return {
          id: `RC-${rc.id}`,
          paymentId: payment ? (payment.razorpayPaymentId || `pay_${payment.id}`) : `pay_${rc.paymentId}`,
          orderId: order ? (order.razorpayOrderId || `ORD-${order.id}`) : "Unknown Order",
          customerId: customer ? (customer.externalCustomerId || `cus_${customer.id}`) : "Unknown",
          customerName: customer ? customer.name : "Unknown Customer",
          customerEmail: customer && customer.email ? customer.email : "Unknown Email",
          amountAtRisk: rc.amountAtRisk,
          currency: payment ? payment.currency : "INR",
          status: uiStatusMap[rc.status] || "Open",
          riskType: rc.riskType,
          riskLevel: uiRiskLevelMap[prediction.riskLevel] || "Low",
          detectedAt: new Date(rc.detectedAt).toLocaleString(),
          resolvedAt: rc.resolvedAt ? new Date(rc.resolvedAt).toLocaleString() : undefined,
          resolutionNote: rc.resolutionNote,
          prediction: {
            riskScore: prediction.riskScore,
            recoveryProbability: Math.round(prediction.recoveryProbability * 100),
            confidence: Math.round(prediction.confidence * 100),
            featuresSnapshot: prediction.featuresSnapshot || { paymentAmount: 0, attemptCount: 0, customerSuccessHistory: 0, customerFailureHistory: 0, flagReasons: [] },
            predictedAt: new Date(prediction.predictedAt).toLocaleString()
          }
        };
      });

      setCases(mappedCases);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load risk cases.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter Logic
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesRisk = riskFilter === "All" || c.riskLevel === riskFilter;
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      
      let matchesRecovery = true;
      if (recoveryFilter !== "All") {
         if (recoveryFilter === "High") matchesRecovery = c.prediction.recoveryProbability >= 80;
         if (recoveryFilter === "Medium") matchesRecovery = c.prediction.recoveryProbability >= 50 && c.prediction.recoveryProbability < 80;
         if (recoveryFilter === "Low") matchesRecovery = c.prediction.recoveryProbability < 50;
      }
      
      let matchesDate = true;
      if (dateFilter !== "All time") {
        const d = new Date(c.detectedAt);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        
        if (dateFilter === "Today") matchesDate = diffDays < 1;
        if (dateFilter === "Last 7 days") matchesDate = diffDays <= 7;
        if (dateFilter === "Last 30 days") matchesDate = diffDays <= 30;
      }

      return matchesSearch && matchesRisk && matchesStatus && matchesRecovery && matchesDate;
    });
  }, [cases, searchQuery, riskFilter, statusFilter, recoveryFilter, dateFilter]);

  // Sort Logic
  const sortedCases = useMemo(() => {
    return [...filteredCases].sort((a, b) => {
      let aVal: any = (a as any)[sortField];
      let bVal: any = (b as any)[sortField];
      
      if (sortField === 'riskScore') { aVal = a.prediction.riskScore; bVal = b.prediction.riskScore; }
      if (sortField === 'recoveryProbability') { aVal = a.prediction.recoveryProbability; bVal = b.prediction.recoveryProbability; }
      if (sortField === 'confidence') { aVal = a.prediction.confidence; bVal = b.prediction.confidence; }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredCases, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedCases.length / itemsPerPage) || 1;
  const paginatedCases = sortedCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Derived Metrics
  const summaryMetrics = useMemo(() => {
    const openCases = cases.filter(c => c.status !== 'Resolved').length;
    const critical = cases.filter(c => c.riskLevel === 'Critical' && c.status !== 'Resolved').length;
    const highRisk = cases.filter(c => c.riskLevel === 'High' && c.status !== 'Resolved').length;
    
    const amountAtRiskRaw = cases.filter(c => c.status !== 'Resolved').reduce((sum, c) => sum + c.amountAtRisk, 0);
    const recoveryOpRaw = cases.filter(c => c.status !== 'Resolved').reduce((sum, c) => sum + (c.amountAtRisk * (c.prediction.recoveryProbability/100)), 0);
    
    const formatCurrency = (val: number) => {
      if (val >= 100000) return `₹${(val/100000).toFixed(2)}L`;
      if (val >= 1000) return `₹${(val/1000).toFixed(1)}K`;
      return `₹${val.toLocaleString()}`;
    };

    return {
      openCases,
      critical,
      highRisk,
      amountAtRisk: formatCurrency(amountAtRiskRaw),
      recoveryOpportunity: formatCurrency(recoveryOpRaw)
    };
  }, [cases]);

  const riskDistribution = useMemo(() => {
    const active = cases.filter(c => c.status !== 'Resolved');
    const getDist = (level: RiskLevel, color: string) => {
      const filtered = active.filter(c => c.riskLevel === level);
      const totalAmt = filtered.reduce((sum, c) => sum + c.amountAtRisk, 0);
      let formattedAmt = `₹${totalAmt}`;
      if (totalAmt >= 100000) formattedAmt = `₹${(totalAmt/100000).toFixed(2)}L`;
      else if (totalAmt >= 1000) formattedAmt = `₹${(totalAmt/1000).toFixed(1)}K`;
      return { level, cases: filtered.length, amount: formattedAmt, color };
    };
    return [
      getDist('Critical', 'bg-landing-failure'),
      getDist('High', 'bg-landing-champagne'),
      getDist('Medium', 'bg-landing-text-sec'),
      getDist('Low', 'bg-landing-success')
    ];
  }, [cases]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleOpenDetail = (riskCase: RiskCaseUI) => {
    setSelectedCase(riskCase);
    setIsDetailOpen(true);
    setActiveMenu(null);
  };

  const handleStatusSubmit = async (status: RiskCaseStatus, note?: string) => {
    if (!statusCase) return;
    
    const backendStatusMap: Record<RiskCaseStatus, string> = {
      "Open": "OPEN",
      "Investigating": "INVESTIGATING",
      "Action Planned": "ACTION PLANNED",
      "Resolved": "RESOLVED"
    };

    try {
      const dbId = parseInt(statusCase.id.replace("RC-", ""), 10);
      await fetchApi(`/risk-cases/${dbId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: backendStatusMap[status],
          resolutionNote: note
        })
      });
      // Refresh cases to get updated data from backend
      fetchAllData();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update case status. Please try again.");
    } finally {
      setIsStatusOpen(false);
      setStatusCase(null);
      setTargetStatus(undefined);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRiskFilter("All");
    setStatusFilter("All");
    setRecoveryFilter("All");
    setDateFilter("All time");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 text-landing-text-sec/40 ml-1 inline" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-3 w-3 text-landing-graphite ml-1 inline" /> : 
      <ChevronDown className="h-3 w-3 text-landing-graphite ml-1 inline" />;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-landing-graphite font-editorial">Risk Cases</h1>
          <p className="text-sm font-semibold text-landing-text-sec mt-1">Identify high-risk payment failures and prioritize the opportunities most likely to recover.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" className="border-landing-border font-bold text-landing-graphite hover:bg-landing-ivory shadow-sm" onClick={fetchAllData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" className="border-landing-border font-bold text-landing-graphite hover:bg-landing-ivory shadow-sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Card className="shadow-sm border border-landing-border/40 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-ivory flex items-center justify-center text-landing-graphite">
              <SearchIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-1">Open Cases</p>
              <h3 className="text-2xl font-bold text-landing-graphite">{summaryMetrics.openCases}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border border-landing-failure/20 bg-landing-failure/5">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-failure/10 flex items-center justify-center text-landing-failure">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-landing-failure uppercase tracking-wider mb-1">Critical</p>
              <h3 className="text-2xl font-bold text-landing-failure">{summaryMetrics.critical}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border border-landing-champagne/30 bg-landing-champagne-light/10">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-champagne/10 flex items-center justify-center text-landing-champagne">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-landing-champagne uppercase tracking-wider mb-1">High Risk</p>
              <h3 className="text-2xl font-bold text-landing-champagne">{summaryMetrics.highRisk}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border border-landing-border/40 bg-landing-surface">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-ivory flex items-center justify-center text-landing-graphite">
              <span className="text-lg font-bold">₹</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-1">Amount at Risk</p>
              <h3 className="text-2xl font-bold text-landing-graphite">{summaryMetrics.amountAtRisk}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border border-landing-champagne/30 bg-landing-champagne-light/10">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-landing-champagne/10 flex items-center justify-center text-landing-champagne">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-landing-champagne uppercase tracking-wider mb-1">Recovery Opp.</p>
              <h3 className="text-2xl font-bold text-landing-champagne">{summaryMetrics.recoveryOpportunity}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Risk Distribution Compact Visual */}
      <Card className="shadow-sm p-4 border border-landing-border/40 bg-landing-surface">
        <h3 className="text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-3">Risk Distribution (Active)</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex h-4 rounded-full overflow-hidden border border-landing-border/60 bg-landing-ivory">
            {summaryMetrics.openCases > 0 ? riskDistribution.map((dist, idx) => (
               <div 
                 key={idx} 
                 title={`${dist.level}: ${dist.cases} cases`}
                 className={`${dist.color} h-full`} 
                 style={{ width: `${(dist.cases / summaryMetrics.openCases) * 100}%` }}
               />
            )) : <div className="h-full w-full bg-landing-ivory/50"></div>}
          </div>
          <div className="flex flex-wrap gap-4 md:w-auto w-full text-xs shrink-0 font-semibold">
             {riskDistribution.map((dist, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                   <div className={`w-2 h-2 rounded-full ${dist.color}`}></div>
                   <span className="font-bold text-landing-graphite">{dist.level}</span>
                   <span className="text-landing-text-sec">({dist.cases})</span>
                   <span className="text-landing-graphite font-bold">{dist.amount}</span>
                </div>
             ))}
          </div>
        </div>
      </Card>

      <Card className="shadow-sm border border-landing-border/40 overflow-hidden bg-landing-surface">
        {/* Toolbar */}
        <div className="p-4 border-b border-landing-border/60 flex flex-col gap-4 bg-landing-ivory/50 rounded-t-lg">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            <div className="relative w-full xl:max-w-md flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-landing-text-sec/60" />
                <Input 
                  placeholder="Search by Case ID, Payment ID, Order ID, Customer..." 
                  className="pl-9 bg-landing-surface w-full border-landing-border/60 focus:border-landing-champagne focus:ring-landing-champagne font-semibold text-landing-graphite" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap w-full xl:w-auto items-center gap-2">
              <Filter className="hidden sm:block h-4 w-4 text-landing-text-sec/60 shrink-0" />
              
              <select 
                className="h-9 w-full sm:w-auto rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none transition-colors"
                value={riskFilter}
                onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Risk Levels</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select 
                className="h-9 w-full sm:w-auto rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none transition-colors"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Investigating">Investigating</option>
                <option value="Action Planned">Action Planned</option>
                <option value="Resolved">Resolved</option>
              </select>
              
              <select 
                className="h-9 w-full sm:w-auto rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none hidden lg:block transition-colors"
                value={recoveryFilter}
                onChange={(e) => { setRecoveryFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Recovery Potential</option>
                <option value="High">High (&ge; 80%)</option>
                <option value="Medium">Medium (50-79%)</option>
                <option value="Low">Low (&lt; 50%)</option>
              </select>

              <select 
                className="h-9 w-full sm:w-auto rounded-md border border-landing-border/60 bg-landing-surface px-3 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none hidden lg:block transition-colors"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All time">All Dates</option>
                <option value="Today">Today</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
              </select>
              
              {(searchQuery || riskFilter !== 'All' || statusFilter !== 'All' || recoveryFilter !== 'All' || dateFilter !== 'All time') && (
                <Button variant="ghost" className="text-landing-text-sec font-bold px-2 shrink-0 hover:bg-landing-ivory hover:text-landing-graphite" onClick={resetFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-16 text-center">
                <RefreshCw className="h-8 w-8 text-landing-text-sec/60 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-landing-graphite">Loading cases...</h3>
             </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-8 w-8 text-landing-failure mb-4" />
                <h3 className="text-lg font-bold text-landing-graphite mb-1">Failed to load risk cases</h3>
                <p className="text-sm font-semibold text-landing-text-sec">{error}</p>
                <Button variant="outline" className="mt-4 border-landing-border font-bold hover:bg-landing-ivory" onClick={fetchAllData}>Try Again</Button>
            </div>
          ) : paginatedCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-landing-ivory rounded-full flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-landing-text-sec/60" />
              </div>
              <h3 className="text-lg font-bold text-landing-graphite mb-1">No risk cases found</h3>
              <p className="text-landing-text-sec text-sm max-w-sm mx-auto mb-4 font-semibold">
                {cases.length === 0 ? "You have no active risk cases." : "No cases match your current search and filters."}
              </p>
              {cases.length > 0 && (
                <Button variant="outline" className="border-landing-border hover:bg-landing-ivory font-bold text-landing-graphite" onClick={resetFilters}>Clear Filters</Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-landing-ivory/50 border-b border-landing-border/60">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-[10px] font-bold uppercase tracking-wider text-landing-text-sec" onClick={() => handleSort('id')}>
                    Case & Payment <SortIcon field="id" />
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Customer</TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-[10px] font-bold uppercase tracking-wider text-landing-text-sec text-right" onClick={() => handleSort('amountAtRisk')}>
                    Amount <SortIcon field="amountAtRisk" />
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Risk</TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-right hidden xl:table-cell text-[10px] font-bold uppercase tracking-wider text-landing-text-sec" onClick={() => handleSort('riskScore')}>
                    Score <SortIcon field="riskScore" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-right hidden lg:table-cell text-[10px] font-bold uppercase tracking-wider text-landing-text-sec" onClick={() => handleSort('recoveryProbability')}>
                    Recovery Prob. <SortIcon field="recoveryProbability" />
                  </TableHead>
                  <TableHead className="hidden 2xl:table-cell text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Recommended Action</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Status</TableHead>
                  <TableHead className="cursor-pointer hover:bg-landing-ivory/80 transition-colors text-right hidden md:table-cell text-[10px] font-bold uppercase tracking-wider text-landing-text-sec" onClick={() => handleSort('detectedAt')}>
                    Detected <SortIcon field="detectedAt" />
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCases.map((rc) => (
                  <TableRow key={rc.id} className={`group border-b border-landing-border/40 ${rc.riskLevel === 'Critical' && rc.status !== 'Resolved' ? 'bg-landing-failure/5' : 'hover:bg-landing-ivory/50'} transition-colors`}>
                    <TableCell>
                      <div className="font-bold text-landing-graphite group-hover:text-landing-champagne transition-colors cursor-pointer flex flex-col" onClick={() => handleOpenDetail(rc)}>
                        <span>{rc.id}</span>
                        <span className="text-[10px] text-landing-text-sec/80 font-mono mt-0.5">{rc.paymentId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm font-bold text-landing-graphite">{rc.customerName}</span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-landing-graphite">
                      {rc.currency === 'INR' ? '₹' : '$'}{rc.amountAtRisk.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rc.riskLevel === 'Critical' || rc.riskLevel === 'High' ? 'error' : rc.riskLevel === 'Medium' ? 'warning' : 'success'} className="font-bold">
                        {rc.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-landing-graphite hidden xl:table-cell">
                      {Math.round(rc.prediction.riskScore)}
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                       <div className="flex items-center justify-end gap-2">
                         <span className="text-sm font-bold text-landing-graphite">{rc.prediction.recoveryProbability}%</span>
                         <div className="w-8 h-1.5 rounded-full bg-landing-border/40 overflow-hidden">
                           <div className="h-full bg-landing-champagne" style={{ width: `${rc.prediction.recoveryProbability}%` }}></div>
                         </div>
                       </div>
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell max-w-[200px] truncate text-sm text-landing-text-sec/80">
                       <span className="font-semibold italic">Not available yet</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        rc.status === 'Resolved' ? 'success' : 
                        rc.status === 'Action Planned' ? 'info' : 
                        rc.status === 'Investigating' ? 'warning' : 'default'
                      } className="uppercase text-[10px] tracking-wider px-1.5 font-bold">
                        {rc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-landing-text-sec hidden md:table-cell">
                      {rc.detectedAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === rc.id ? null : rc.id)}
                          className="p-1.5 text-landing-text-sec/60 hover:text-landing-graphite rounded-md hover:bg-landing-ivory transition-colors focus:outline-none"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        
                        {activeMenu === rc.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                            <div className="absolute right-0 mt-1 w-44 rounded-md shadow-lg bg-landing-surface border border-landing-border/60 ring-1 ring-black ring-opacity-5 z-20">
                              <div className="py-1" role="menu">
                                <button 
                                  className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-graphite hover:bg-landing-ivory transition-colors"
                                  onClick={() => handleOpenDetail(rc)}
                                >
                                  View Details
                                </button>
                                {rc.status !== 'Resolved' && (
                                  <>
                                    <button 
                                      className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-champagne hover:bg-landing-champagne-light/10 transition-colors"
                                      onClick={() => { setStatusCase(rc); setTargetStatus('Investigating'); setIsStatusOpen(true); setActiveMenu(null); }}
                                    >
                                      Mark Investigating
                                    </button>
                                    <button 
                                      className="w-full text-left block px-4 py-2 text-sm font-semibold text-landing-graphite hover:bg-landing-ivory transition-colors"
                                      onClick={() => { setStatusCase(rc); setTargetStatus('Action Planned'); setIsStatusOpen(true); setActiveMenu(null); }}
                                    >
                                      Mark Action Planned
                                    </button>
                                    <button 
                                      className="w-full text-left block px-4 py-2 text-sm font-bold text-landing-success hover:bg-landing-success/10 border-t border-landing-border/40 mt-1 flex items-center justify-between transition-colors"
                                      onClick={() => { setStatusCase(rc); setTargetStatus('Resolved'); setIsStatusOpen(true); setActiveMenu(null); }}
                                    >
                                      Resolve <CheckCircle2 className="h-3.5 w-3.5" />
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
        {sortedCases.length > 0 && (
          <div className="p-4 border-t border-landing-border/60 bg-landing-ivory/50 rounded-b-lg flex items-center justify-between">
            <p className="text-sm font-semibold text-landing-text-sec">
              Showing <span className="font-bold text-landing-graphite">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-landing-graphite">{Math.min(currentPage * itemsPerPage, sortedCases.length)}</span> of <span className="font-bold text-landing-graphite">{sortedCases.length}</span> results
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
      <RiskCaseDetailDrawer 
        riskCase={selectedCase} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
      
      <RiskStatusModal 
        isOpen={isStatusOpen} 
        onClose={() => setIsStatusOpen(false)} 
        riskCase={statusCase}
        targetStatus={targetStatus}
        onSubmit={handleStatusSubmit} 
      />
      
    </div>
  )
}
