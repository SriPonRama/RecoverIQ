import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  PieChart, 
  TrendingDown,
  Info,
  BrainCircuit,
  Loader2
} from "lucide-react"
import { RevenueRecoveryChart } from "../components/dashboard/RevenueRecoveryChart"
import { RecoveryPipeline } from "../components/dashboard/RecoveryPipeline"
import { useState, useEffect } from "react"
import { fetchApi } from "../lib/api"

export function Dashboard() {
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi(`/analytics?range=${encodeURIComponent(dateRange)}`);
        if (isMounted) {
          setDashboardData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load dashboard data. Please try again.");
          console.error("Dashboard fetch error:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboard();
    
    return () => { isMounted = false; };
  }, [dateRange]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-landing-failure/10 rounded-xl text-landing-failure border border-landing-failure/20">
        <AlertTriangle className="h-10 w-10 mb-4" />
        <p className="font-semibold">{error}</p>
        <button 
          onClick={() => setDateRange(dateRange)}
          className="mt-4 px-4 py-2 bg-landing-failure text-landing-surface rounded-md font-bold transition-all hover:bg-landing-failure/90 shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const data = dashboardData;

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-landing-ivory/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl min-h-[500px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-landing-champagne animate-spin mb-2" />
            <p className="text-landing-text-sec font-semibold tracking-wide">Loading intelligence...</p>
          </div>
        </div>
      )}

      {/* SECTION 1 - PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-landing-graphite font-editorial">Intelligence Dashboard</h1>
          <p className="text-sm font-semibold text-landing-text-sec mt-1">Monitor risk parameters, identify recovery opportunities, and track deterministic outcomes.</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-10 rounded-md border border-landing-border/60 bg-landing-surface px-4 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all"
          >
            <option value="Today">Today</option>
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last 90 days">Last 90 days</option>
          </select>
        </div>
      </div>

      {data && (
        <>
          {/* SECTION 2 - KPI CARDS */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {/* Total Processed */}
            <Card className="border border-landing-border/40 shadow-sm bg-landing-surface">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Total Processed</CardTitle>
                <DollarSign className="h-4 w-4 text-landing-graphite" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-landing-graphite">{data.summary.totalProcessed}</div>
                <p className={`text-xs font-bold flex items-center mt-1 ${data.summary.totalProcessedPositive ? 'text-landing-success' : 'text-landing-failure'}`}>
                  {data.summary.totalProcessedPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {data.summary.totalProcessedTrend} vs previous
                </p>
              </CardContent>
            </Card>

            {/* Failed Payments */}
            <Card className="border border-landing-failure/20 bg-landing-failure/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-landing-failure">Failed Payments</CardTitle>
                <TrendingDown className="h-4 w-4 text-landing-failure" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-landing-failure">{data.summary.failedRevenue}</div>
                <p className={`text-xs font-bold flex items-center mt-1 ${data.summary.failedRevenuePositive ? 'text-landing-success' : 'text-landing-failure'}`}>
                   {data.summary.failedRevenuePositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                   {data.summary.failedRevenueTrend} vs previous
                </p>
              </CardContent>
            </Card>

            {/* At-Risk Revenue */}
            <Card className="border border-landing-champagne/30 bg-landing-champagne-light/10 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-landing-champagne">At-Risk Revenue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-landing-champagne" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-landing-champagne">{data.summary.atRiskRevenue}</div>
                <p className={`text-xs font-bold flex items-center mt-1 ${data.summary.atRiskRevenuePositive ? 'text-landing-success' : 'text-landing-failure'}`}>
                  {data.summary.atRiskRevenuePositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {data.summary.atRiskRevenueTrend} vs previous
                </p>
              </CardContent>
            </Card>

            {/* Recovered Revenue */}
            <Card className="border border-landing-success/40 bg-landing-success/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-landing-success">Recovered Revenue</CardTitle>
                <Activity className="h-4 w-4 text-landing-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-landing-success">{data.summary.recoveredRevenue}</div>
                <p className={`text-xs font-bold flex items-center mt-1 ${data.summary.recoveredRevenuePositive ? 'text-landing-success' : 'text-landing-failure'}`}>
                  {data.summary.recoveredRevenuePositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {data.summary.recoveredRevenueTrend} vs previous
                </p>
              </CardContent>
            </Card>

            {/* Recovery Rate */}
            <Card className="border border-landing-border/40 shadow-sm bg-landing-surface">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">Recovery Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-landing-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-landing-graphite">{data.summary.recoveryRate}</div>
                <p className={`text-xs font-bold flex items-center mt-1 ${data.summary.recoveryRatePositive ? 'text-landing-success' : 'text-landing-failure'}`}>
                  {data.summary.recoveryRatePositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {data.summary.recoveryRateTrend} vs previous
                </p>
              </CardContent>
            </Card>
          </div>

          {/* SECTION 3, 4, 5 - CHART & OVERVIEWS */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Revenue Recovery Chart */}
            <Card className="md:col-span-2 border border-landing-border/40 shadow-sm bg-landing-surface">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-landing-border/60">
                <CardTitle className="text-lg font-bold text-landing-graphite">Revenue Recovery</CardTitle>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-landing-text-sec">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-landing-success"></div>
                    <span>Recovered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-landing-failure"></div>
                    <span>At-Risk</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <RevenueRecoveryChart data={data.revenueTrend} />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              {/* Payment Health */}
              <Card className="border border-landing-border/40 shadow-sm bg-landing-surface">
                <CardHeader className="pb-4 border-b border-landing-border/60">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-landing-graphite uppercase tracking-wider">
                    <PieChart className="h-4 w-4 text-landing-text-sec/60" />
                    Payment Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Visual Bar */}
                    <div className="flex w-full h-3 rounded-full overflow-hidden">
                      {data.paymentPerformance.map((item: any) => {
                        let colorClass = 'bg-landing-border';
                        if (item.status === 'Successful') colorClass = 'bg-landing-success';
                        if (item.status === 'Recovered') colorClass = 'bg-landing-champagne-light';
                        if (item.status === 'Pending') colorClass = 'bg-landing-champagne';
                        if (item.status === 'Failed') colorClass = 'bg-landing-failure';
                        return <div key={item.status} className={colorClass} style={{ width: `${item.percentage}%` }}></div>
                      })}
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                      {data.paymentPerformance.map((item: any) => {
                        let colorClass = 'bg-landing-border';
                        if (item.status === 'Successful') colorClass = 'bg-landing-success';
                        if (item.status === 'Recovered') colorClass = 'bg-landing-champagne-light';
                        if (item.status === 'Pending') colorClass = 'bg-landing-champagne';
                        if (item.status === 'Failed') colorClass = 'bg-landing-failure';

                        return (
                          <div key={item.status} className="flex justify-between items-center">
                            <span className="flex items-center gap-2 text-landing-text-sec font-semibold">
                              <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>{item.status}
                            </span>
                            <span className={`font-bold ${item.status === 'Failed' ? 'text-landing-failure' : 'text-landing-graphite'}`}>
                              {item.percentage.toFixed(0)}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Overview */}
              <Card className="border border-landing-border/40 shadow-sm bg-landing-surface">
                <CardHeader className="pb-4 border-b border-landing-border/60">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-landing-graphite uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-landing-text-sec/60" />
                    Risk Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.riskDistribution.map((item: any) => {
                      const level = item.level;
                      if (level === 'Critical') {
                        return (
                          <div key={level} className="flex items-center justify-between p-2 rounded-md bg-landing-failure/10 border border-landing-failure/20">
                            <span className="text-sm font-semibold text-landing-failure flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-landing-failure"></div>Critical
                            </span>
                            <Badge variant="error" className="bg-landing-failure text-landing-surface hover:bg-landing-failure/90 border border-landing-failure/80">{item.cases}</Badge>
                          </div>
                        )
                      }
                      if (level === 'High') {
                        return (
                          <div key={level} className="flex items-center justify-between p-2 rounded-md bg-landing-champagne/10 border border-landing-champagne/20">
                            <span className="text-sm font-semibold text-landing-champagne flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-landing-champagne"></div>High
                            </span>
                            <Badge className="bg-landing-champagne text-landing-deep hover:bg-landing-champagne-light border border-landing-champagne/80">{item.cases}</Badge>
                          </div>
                        )
                      }
                      if (level === 'Medium') {
                        return (
                          <div key={level} className="flex items-center justify-between p-2 rounded-md bg-landing-surface border border-landing-border">
                            <span className="text-sm font-semibold text-landing-text-sec flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-landing-text-sec"></div>Medium
                            </span>
                            <Badge variant="warning">{item.cases}</Badge>
                          </div>
                        )
                      }
                      return (
                        <div key={level} className="flex items-center justify-between p-2 rounded-md bg-transparent border border-landing-border/50">
                          <span className="text-sm font-semibold text-landing-text-sec flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-landing-border"></div>Low
                          </span>
                          <Badge variant="default" className="bg-landing-border/30 text-landing-graphite hover:bg-landing-border/50">{item.cases}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* SECTION 6 - RECOVERY PIPELINE */}
          <RecoveryPipeline data={data.recoveryFunnel} />

          {/* SECTION 7, 8, 9 - TABLES AND ACTIVITY */}
          <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-12">
            {/* Top Recovery Opportunities */}
            <Card className="md:col-span-3 xl:col-span-8 border border-landing-border/40 shadow-sm bg-landing-surface">
              <CardHeader className="border-b border-landing-border/60 pb-4">
                <CardTitle className="text-lg font-bold text-landing-graphite">Top Recovery Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {(!data.topContributors || data.topContributors.length === 0) ? (
                  <div className="flex justify-center items-center h-40 text-landing-text-sec font-semibold text-sm italic border border-dashed border-landing-border/50 rounded-xl bg-landing-ivory/30">
                    Not available yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead>Probability</TableHead>
                          <TableHead>Recommended Action</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                         {/* Rows will render here when backend supports topContributors */}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SIDEBAR COLUMNS */}
            <div className="md:col-span-3 xl:col-span-4 flex flex-col gap-6">
              {/* Recent Failed Payments */}
              <Card className="border border-landing-border/40 shadow-sm bg-landing-surface">
                <CardHeader className="border-b border-landing-border/60 pb-4">
                  <CardTitle className="text-sm font-bold text-landing-graphite uppercase tracking-wider">Recent Failed Payments</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-center items-center h-40 text-landing-text-sec font-semibold text-sm italic border border-dashed border-landing-border/50 rounded-xl bg-landing-ivory/30">
                    Not available yet
                  </div>
                </CardContent>
              </Card>

              {/* Recent Recovery Activity / Insights */}
              <Card className="border border-landing-border/40 shadow-sm bg-landing-surface">
                <CardHeader className="border-b border-landing-border/60 pb-4">
                  <CardTitle className="text-sm font-bold text-landing-graphite uppercase tracking-wider">Recent Activity Feed</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {(!data.insights || data.insights.length === 0) ? (
                    <div className="flex justify-center items-center h-40 text-landing-text-sec font-semibold text-sm italic border border-dashed border-landing-border/50 rounded-xl bg-landing-ivory/30">
                      No activity available yet
                    </div>
                  ) : (
                    <div className="relative border-l border-landing-border/50 ml-3 space-y-6">
                      {data.insights.map((act: any) => {
                        let Icon = Info;
                        let colorClass = "bg-landing-surface text-landing-text-sec border-landing-border";
                        
                        if (act.type === 'positive' || act.type === 'success') {
                          Icon = CheckCircle2;
                          colorClass = "bg-landing-success/10 text-landing-success border-landing-success/20";
                        } else if (act.type === 'warning') {
                          Icon = BrainCircuit;
                          colorClass = "bg-landing-champagne/10 text-landing-champagne border-landing-champagne/20";
                        } else if (act.type === 'error') {
                          Icon = AlertTriangle;
                          colorClass = "bg-landing-failure/10 text-landing-failure border-landing-failure/20";
                        } else if (act.type === 'neutral') {
                          Icon = Info;
                          colorClass = "bg-landing-deep/5 text-landing-graphite border-landing-border/50";
                        }

                        return (
                          <div key={act.id} className="relative pl-6">
                            <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border flex items-center justify-center bg-landing-ivory ${colorClass.split(' ')[2]}`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${colorClass}`}>
                                <Icon className="w-3 h-3" />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-landing-graphite">{act.text}</span>
                              <span className="text-xs font-semibold text-landing-text-sec mt-1 uppercase tracking-wide">Analytics Insight</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
