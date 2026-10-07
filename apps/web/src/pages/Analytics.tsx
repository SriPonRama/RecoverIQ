import { useState, useEffect } from "react"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, 
  Activity, CheckCircle2, DollarSign, PieChart, Users, Zap, 
  ShieldAlert, Lightbulb, Target, ArrowRight, ArrowDown,
  Loader2
} from "lucide-react"
import { fetchApi } from "../lib/api"
import { AnalyticsRevenueChart } from "../components/analytics/AnalyticsRevenueChart"
import { AnalyticsTrendChart } from "../components/analytics/AnalyticsTrendChart"

export function Analytics() {
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi(`/analytics?range=${encodeURIComponent(dateRange)}`);
        if (isMounted) {
          setAnalyticsData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load analytics data. Please try again.");
          console.error("Analytics fetch error:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAnalytics();
    
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

  const data = analyticsData;

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-landing-ivory/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl min-h-[500px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-landing-champagne animate-spin mb-2" />
            <p className="text-landing-text-sec font-semibold tracking-wide">Loading analytics...</p>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-landing-graphite uppercase">Analytics</h1>
          <p className="text-sm text-landing-text-sec mt-1">Understand payment performance, recovery trends, and the revenue impact of RecoverIQ.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-landing-text-sec font-semibold cursor-pointer">
            <input 
              type="checkbox" 
              checked={compareEnabled}
              onChange={(e) => setCompareEnabled(e.target.checked)}
              className="rounded border-landing-border/60 text-landing-champagne focus:ring-landing-champagne"
            />
            Compare with previous period
          </label>
          <select 
             className="h-10 rounded-md border border-landing-border/60 bg-landing-surface px-4 py-1 text-sm font-semibold text-landing-graphite shadow-sm focus:border-landing-champagne focus:outline-none focus:ring-1 focus:ring-landing-champagne transition-all"
             value={dateRange}
             onChange={(e) => setDateRange(e.target.value)}
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
          {/* SECTION 1 — EXECUTIVE METRICS */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <MetricCard 
               title="Total Processed" 
               value={data.summary.totalProcessed}
               trend={data.summary.totalProcessedTrend}
               isPositive={data.summary.totalProcessedPositive}
               compareEnabled={compareEnabled}
            />
            <MetricCard 
               title="Failed Revenue" 
               value={data.summary.failedRevenue}
               trend={data.summary.failedRevenueTrend}
               isPositive={data.summary.failedRevenuePositive}
               compareEnabled={compareEnabled}
            />
            <MetricCard 
               title="At-Risk Revenue" 
               value={data.summary.atRiskRevenue}
               trend={data.summary.atRiskRevenueTrend}
               isPositive={data.summary.atRiskRevenuePositive}
               compareEnabled={compareEnabled}
               highlight="amber"
            />
            <MetricCard 
               title="Recoverable Revenue" 
               value={data.summary.recoverableRevenue}
               trend={data.summary.recoverableRevenueTrend}
               isPositive={data.summary.recoverableRevenuePositive}
               compareEnabled={compareEnabled}
               highlight="blue"
            />
            <MetricCard 
               title="Recovered Revenue" 
               value={data.summary.recoveredRevenue}
               trend={data.summary.recoveredRevenueTrend}
               isPositive={data.summary.recoveredRevenuePositive}
               compareEnabled={compareEnabled}
               highlight="emerald"
            />
            <MetricCard 
               title="Recovery Rate" 
               value={data.summary.recoveryRate}
               trend={data.summary.recoveryRateTrend}
               isPositive={data.summary.recoveryRatePositive}
               compareEnabled={compareEnabled}
               highlight="emerald"
            />
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* SECTION 2 — REVENUE PERFORMANCE */}
            <Card className="lg:col-span-2 shadow-sm flex flex-col">
              <div className="p-4 border-b border-landing-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-landing-champagne" />
                  Revenue Performance
                </h3>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-landing-champagne-light"></div>Processed</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-landing-failure"></div>Failed</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-landing-success"></div>Recovered</div>
                </div>
              </div>
              <div className="p-4 flex-1 min-h-[280px] flex items-center justify-center">
                {(!data.revenueTrend || data.revenueTrend.length === 0) ? (
                   <div className="flex justify-center items-center h-40 w-full text-landing-text-sec text-sm italic border border-dashed border-landing-border/50 rounded-xl m-4">
                     Not available yet
                   </div>
                ) : (
                   <AnalyticsRevenueChart data={data.revenueTrend} />
                )}
              </div>
            </Card>

            {/* SECTION 3 — RECOVERY IMPACT */}
            <Card className="shadow-sm">
               <div className="p-4 border-b border-landing-border/40">
                 <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                   <Zap className="h-4 w-4 text-landing-champagne" />
                   Recovery Impact
                 </h3>
               </div>
               <div className="p-5 flex flex-col items-center justify-center h-[calc(100%-53px)] space-y-4">
                  <div className="w-full bg-landing-ivory border border-landing-border/50 rounded-xl p-4 text-center">
                     <p className="text-xs font-semibold text-landing-text-sec uppercase tracking-wider mb-1">At Risk Revenue</p>
                     <p className="text-xl font-bold text-landing-graphite">{data.summary.atRiskRevenue}</p>
                  </div>
                  <ArrowDown className="h-5 w-5 text-landing-border" />
                  <div className="w-full bg-landing-champagne/10 border border-landing-champagne/30 rounded-xl p-4 text-center">
                     <p className="text-xs font-semibold text-landing-champagne uppercase tracking-wider mb-1">Recoverable Revenue</p>
                     <p className="text-xl font-bold text-landing-deep">{data.summary.recoverableRevenue}</p>
                  </div>
                  <ArrowDown className="h-5 w-5 text-landing-border" />
                  <div className="w-full bg-landing-success/10 border border-landing-success/30 rounded-xl p-4 text-center">
                     <p className="text-xs font-semibold text-landing-success uppercase tracking-wider mb-1">Recovered Revenue</p>
                     <p className="text-2xl font-bold text-landing-success">{data.summary.recoveredRevenue}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full pt-4 mt-2 border-t border-landing-border/40">
                     <div className="text-center">
                        <p className="text-xs font-semibold text-landing-text-sec mb-0.5">Recovery Rate</p>
                        <p className="text-lg font-bold text-landing-success">{data.summary.recoveryRate}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-xs font-semibold text-landing-text-sec mb-0.5">% of At-Risk</p>
                        <p className="text-lg font-bold text-landing-champagne">
                           {/* Calculate this for display based on backend strings roughly */}
                           {Math.round(parseFloat(data.summary.recoveredRevenue.replace(/[^0-9.]/g, '')) / parseFloat(data.summary.atRiskRevenue.replace(/[^0-9.]/g, '')) * 100) || 0}%
                        </p>
                     </div>
                  </div>
               </div>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* SECTION 4 — PAYMENT PERFORMANCE */}
            <Card className="shadow-sm">
               <div className="p-4 border-b border-landing-border/40">
                 <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                   <DollarSign className="h-4 w-4 text-landing-text-sec" />
                   Payment Performance
                 </h3>
               </div>
               <div className="p-4">
                  <div className="flex w-full h-4 rounded-full overflow-hidden mb-6 bg-landing-ivory">
                    {data.paymentPerformance.map((p: any) => {
                       let color = 'bg-landing-border';
                       if (p.status === 'Successful') color = 'bg-landing-success';
                       if (p.status === 'Failed') color = 'bg-landing-failure';
                       if (p.status === 'Pending') color = 'bg-landing-champagne';
                       if (p.status === 'Recovered') color = 'bg-landing-champagne-light';
                       return <div key={p.status} className={`${color}`} style={{ width: `${p.percentage}%` }}></div>
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {data.paymentPerformance.map((p: any) => (
                       <div key={p.status} className="flex justify-between items-center p-3 rounded-xl bg-landing-surface border border-landing-border/30">
                          <div>
                             <p className="text-sm font-bold text-landing-graphite flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                   p.status === 'Successful' ? 'bg-landing-success' :
                                   p.status === 'Failed' ? 'bg-landing-failure' :
                                   p.status === 'Pending' ? 'bg-landing-champagne' : 'bg-landing-champagne-light'
                                }`}></span>
                                {p.status}
                             </p>
                             <p className="text-xs text-landing-text-sec mt-0.5 font-medium">{p.count} transactions</p>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-bold text-landing-graphite">{p.amount}</p>
                             <p className="text-xs font-semibold text-landing-text-sec">{p.percentage.toFixed(1)}%</p>
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
            </Card>

            {/* SECTION 5 — FAILURE ANALYSIS */}
            <Card className="shadow-sm">
               <div className="p-4 border-b border-landing-border/40">
                 <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                   <AlertTriangle className="h-4 w-4 text-landing-failure" />
                   Payment Failure Analysis
                 </h3>
               </div>
               <div className="p-4 space-y-4">
                  {(!data.failureAnalysis || data.failureAnalysis.length === 0) ? (
                    <div className="flex justify-center items-center h-40 text-landing-text-sec text-sm italic border border-dashed border-landing-border/50 rounded-xl">
                      Not available yet
                    </div>
                  ) : (
                    data.failureAnalysis.map((f: any, i: number) => (
                       <div key={i} className="flex items-center gap-4">
                          <div className="w-10 text-right text-sm font-bold text-landing-text-sec">{f.percentage.toFixed(0)}%</div>
                          <div className="flex-1">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-landing-graphite">{f.reason}</span>
                                <span className="text-xs font-bold text-landing-failure">{f.amount} ({f.count})</span>
                             </div>
                             <div className="w-full h-1.5 rounded-full bg-landing-ivory overflow-hidden">
                                <div className="h-full bg-landing-failure rounded-full" style={{ width: `${f.percentage}%` }}></div>
                             </div>
                          </div>
                       </div>
                    ))
                  )}
               </div>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
             {/* SECTION 6 — PAYMENT METHOD PERFORMANCE */}
             <Card className="shadow-sm">
                <div className="p-4 border-b border-landing-border/40">
                   <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                     <PieChart className="h-4 w-4 text-landing-text-sec" />
                     Payment Method Performance
                   </h3>
                </div>
                <div className="p-0 overflow-x-auto">
                   {(!data.paymentMethods || data.paymentMethods.length === 0) ? (
                     <div className="flex justify-center items-center h-40 text-landing-text-sec text-sm italic border border-dashed border-landing-border/50 rounded-xl m-4">
                       Not available yet
                     </div>
                   ) : (
                     <table className="w-full text-sm text-left">
                        <thead className="bg-landing-surface border-b border-landing-border/40 text-landing-text-sec uppercase text-[10px] tracking-wider">
                           <tr>
                              <th className="px-4 py-3 font-bold rounded-tl-xl">Method</th>
                              <th className="px-4 py-3 font-bold text-right">Transactions</th>
                              <th className="px-4 py-3 font-bold text-right">Success Rate</th>
                              <th className="px-4 py-3 font-bold text-right">Failed Amount</th>
                              <th className="px-4 py-3 font-bold text-right">Recovery Rate</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-landing-border/40">
                           {data.paymentMethods.map((m: any) => (
                              <tr key={m.method} className="hover:bg-landing-ivory/50 transition-colors">
                                 <td className="px-4 py-3 font-bold text-landing-graphite">{m.method}</td>
                                 <td className="px-4 py-3 text-right font-medium text-landing-text-sec">{m.transactions}</td>
                                 <td className="px-4 py-3 text-right">
                                    <span className={`font-bold ${m.successRate > 85 ? 'text-landing-success' : 'text-landing-graphite'}`}>{m.successRate}%</span>
                                 </td>
                                 <td className="px-4 py-3 text-right text-landing-failure font-bold">{m.failedAmount}</td>
                                 <td className="px-4 py-3 text-right">
                                    <span className={`font-bold ${m.recoveryRate > 40 ? 'text-landing-champagne' : 'text-landing-graphite'}`}>{m.recoveryRate}%</span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   )}
                </div>
             </Card>

             {/* SECTION 7 — RISK ANALYTICS */}
             <Card className="shadow-sm">
                <div className="p-4 border-b border-landing-border/40">
                   <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                     <ShieldAlert className="h-4 w-4 text-landing-champagne" />
                     Risk Distribution
                   </h3>
                </div>
                <div className="p-0 overflow-x-auto">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-landing-surface border-b border-landing-border/40 text-landing-text-sec uppercase text-[10px] tracking-wider">
                         <tr>
                            <th className="px-4 py-3 font-bold rounded-tl-xl">Risk Level</th>
                            <th className="px-4 py-3 font-bold text-right">Cases</th>
                            <th className="px-4 py-3 font-bold text-right">Amount at Risk</th>
                            <th className="px-4 py-3 font-bold text-right">Avg Recovery Prob.</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-landing-border/40">
                         {data.riskDistribution.map((r: any) => (
                            <tr key={r.level} className="hover:bg-landing-ivory/50 transition-colors">
                               <td className="px-4 py-3">
                                  <Badge variant={
                                     r.level === 'Critical' ? 'error' : 
                                     r.level === 'High' ? 'warning' : 'default'
                                  } className={r.level === 'High' ? 'bg-landing-champagne/10 text-landing-champagne border border-landing-champagne/40' : r.level === 'Critical' ? 'bg-landing-failure/10 text-landing-failure border border-landing-failure/40' : 'bg-landing-ivory text-landing-text-sec border border-landing-border'}>
                                     {r.level}
                                  </Badge>
                               </td>
                               <td className="px-4 py-3 text-right font-medium text-landing-text-sec">{r.cases}</td>
                               <td className="px-4 py-3 text-right font-bold text-landing-graphite">{r.amount}</td>
                               <td className="px-4 py-3 text-right">
                                  <span className={`font-bold ${r.probability > 70 ? 'text-landing-success' : 'text-landing-graphite'}`}>{r.probability}%</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </Card>
          </div>

          {/* SECTION 12 — INSIGHTS */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
             <div className="col-span-1 sm:col-span-2 lg:col-span-4 mb-2">
                <h3 className="text-xl font-bold text-landing-graphite flex items-center gap-2 uppercase tracking-tight">
                   <Lightbulb className="h-5 w-5 text-landing-champagne" /> Intelligence Insights
                </h3>
             </div>
             {(!data.insights || data.insights.length === 0) ? (
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-center items-center h-24 text-landing-text-sec text-sm italic border border-dashed border-landing-border/50 rounded-xl">
                  No insights available yet
                </div>
             ) : (
                data.insights.map((insight: any) => (
                   <div key={insight.id} className={`p-4 rounded-xl border ${
                      insight.type === 'positive' || insight.type === 'success' ? 'bg-landing-success/10 border-landing-success/30' :
                      insight.type === 'negative' || insight.type === 'error' ? 'bg-landing-failure/10 border-landing-failure/30' :
                      insight.type === 'warning' ? 'bg-landing-champagne/10 border-landing-champagne/30' :
                      'bg-landing-surface border-landing-border'
                   }`}>
                      <p className={`text-sm font-bold ${
                         insight.type === 'positive' || insight.type === 'success' ? 'text-landing-success' :
                         insight.type === 'negative' || insight.type === 'error' ? 'text-landing-failure' :
                         insight.type === 'warning' ? 'text-landing-champagne' :
                         'text-landing-graphite'
                      }`}>{insight.text}</p>
                   </div>
                ))
             )}
          </div>

          {/* SECTION 9 — RECOVERY FUNNEL */}
          <Card className="shadow-sm">
             <div className="p-4 border-b border-landing-border/40">
                <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                  <Activity className="h-4 w-4 text-landing-text-sec" />
                  Recovery Funnel
                </h3>
             </div>
             <div className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                   {data.recoveryFunnel.map((stage: any, i: number) => (
                      <div key={stage.stage} className="flex items-center w-full md:w-auto">
                         <div className="flex flex-col items-center p-3 w-full md:w-36 bg-landing-ivory rounded-xl border border-landing-border/40 shadow-sm">
                            <span className="text-[10px] font-bold text-landing-text-sec uppercase tracking-wider mb-1 text-center h-8 flex items-center justify-center leading-tight">{stage.stage}</span>
                            <span className={`text-xl font-bold ${i === data.recoveryFunnel.length -1 ? 'text-landing-champagne' : 'text-landing-graphite'}`}>{stage.count}</span>
                            <span className="text-xs font-semibold text-landing-text-sec">{stage.amount}</span>
                         </div>
                         {i < data.recoveryFunnel.length - 1 && (
                            <ArrowRight className="hidden md:block h-5 w-5 text-landing-border mx-2" />
                         )}
                         {i < data.recoveryFunnel.length - 1 && (
                            <ArrowDown className="md:hidden h-5 w-5 text-landing-border my-2" />
                         )}
                      </div>
                   ))}
                </div>
             </div>
          </Card>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
             {/* SECTION 8 — RECOVERY STRATEGY PERFORMANCE */}
             <Card className="shadow-sm">
                <div className="p-4 border-b border-landing-border/40">
                   <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                     <Target className="h-4 w-4 text-landing-champagne" />
                     Recovery Strategy Performance
                   </h3>
                </div>
                <div className="p-4 space-y-5">
                   {(!data.recoveryStrategies || data.recoveryStrategies.length === 0) ? (
                     <div className="flex justify-center items-center h-40 text-landing-text-sec text-sm italic border border-dashed border-landing-border/50 rounded-xl">
                       Not available yet
                     </div>
                   ) : (
                     data.recoveryStrategies.map((strat: any, i: number) => (
                        <div key={i}>
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-bold text-landing-graphite">{strat.strategy}</span>
                              <span className="text-sm font-bold text-landing-champagne">{strat.recoveryRate.toFixed(1)}% Rate</span>
                           </div>
                           <div className="w-full h-1.5 rounded-full bg-landing-ivory overflow-hidden mb-1.5">
                              <div className="h-full bg-landing-champagne rounded-full" style={{ width: `${strat.recoveryRate}%` }}></div>
                           </div>
                           <div className="flex justify-between items-center text-xs font-semibold text-landing-text-sec">
                              <span>{strat.recoveredCount} / {strat.attempts} Successful Attempts</span>
                              <span className="text-landing-success">{strat.recoveredAmount} Recovered</span>
                           </div>
                        </div>
                     ))
                   )}
                </div>
             </Card>

             {/* SECTION 11 — TREND ANALYSIS */}
             <Card className="shadow-sm flex flex-col">
                <div className="p-4 border-b border-landing-border/40 flex justify-between items-center">
                   <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                     <TrendingUp className="h-4 w-4 text-landing-text-sec" />
                     Recovery Trend
                   </h3>
                   <div className="flex items-center gap-4 text-xs font-semibold">
                     <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-landing-success"></div>Recovery Rate</div>
                     <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-landing-failure"></div>Failed Rate</div>
                   </div>
                </div>
                <div className="p-4 flex-1 min-h-[250px] flex items-center justify-center">
                   {(!data.recoveryTrend || data.recoveryTrend.length === 0) ? (
                     <div className="flex justify-center items-center h-40 w-full text-landing-text-sec text-sm italic border border-dashed border-landing-border/50 rounded-xl m-4">
                       Not available yet
                     </div>
                   ) : (
                     <AnalyticsTrendChart data={data.recoveryTrend} />
                   )}
                </div>
             </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
             {/* SECTION 10 — CUSTOMER / SEGMENT ANALYTICS */}
             <Card className="shadow-sm">
                <div className="p-4 border-b border-landing-border/40">
                   <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                     <Users className="h-4 w-4 text-landing-text-sec" />
                     Customer Segment Performance
                   </h3>
                </div>
                <div className="p-0 overflow-x-auto">
                   {(!data.customerSegments || data.customerSegments.length === 0) ? (
                     <div className="flex justify-center items-center h-40 text-landing-text-sec text-sm italic border border-dashed border-landing-border/50 rounded-xl m-4">
                       Not available yet
                     </div>
                   ) : (
                     <table className="w-full text-sm text-left">
                        <thead className="bg-landing-surface border-b border-landing-border/40 text-landing-text-sec uppercase text-[10px] tracking-wider">
                           <tr>
                              <th className="px-4 py-3 font-bold rounded-tl-xl">Segment</th>
                              <th className="px-4 py-3 font-bold text-right">Customers</th>
                              <th className="px-4 py-3 font-bold text-right">At-Risk</th>
                              <th className="px-4 py-3 font-bold text-right">Recovered</th>
                              <th className="px-4 py-3 font-bold text-right">Rec. Rate</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-landing-border/40">
                           {data.customerSegments.map((c: any) => (
                              <tr key={c.segment} className="hover:bg-landing-ivory/50 transition-colors">
                                 <td className="px-4 py-3 font-bold text-landing-graphite">{c.segment}</td>
                                 <td className="px-4 py-3 text-right font-medium text-landing-text-sec">{c.customers}</td>
                                 <td className="px-4 py-3 text-right text-landing-champagne font-bold">{c.atRiskRevenue}</td>
                                 <td className="px-4 py-3 text-right text-landing-success font-bold">{c.recoveredRevenue}</td>
                                 <td className="px-4 py-3 text-right">
                                    <span className={`font-bold ${c.recoveryRate > 40 ? 'text-landing-champagne' : 'text-landing-graphite'}`}>{c.recoveryRate.toFixed(1)}%</span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   )}
                </div>
             </Card>

             {/* SECTION 13 — TOP RECOVERY CONTRIBUTORS */}
             <Card className="shadow-sm">
                <div className="p-4 border-b border-landing-border/40">
                   <h3 className="text-base font-bold text-landing-graphite flex items-center gap-2">
                     <CheckCircle2 className="h-4 w-4 text-landing-success" />
                     Top Recovery Contributors
                   </h3>
                </div>
                <div className="p-0 overflow-x-auto">
                   {(!data.topContributors || data.topContributors.length === 0) ? (
                     <div className="flex justify-center items-center h-40 text-landing-text-sec text-sm italic border border-dashed border-landing-border/50 rounded-xl m-4">
                       Not available yet
                     </div>
                   ) : (
                     <table className="w-full text-sm text-left">
                        <thead className="bg-landing-surface border-b border-landing-border/40 text-landing-text-sec uppercase text-[10px] tracking-wider">
                           <tr>
                              <th className="px-4 py-3 font-bold rounded-tl-xl">Customer</th>
                              <th className="px-4 py-3 font-bold text-right">Recovered</th>
                              <th className="px-4 py-3 font-bold text-right">Rate</th>
                              <th className="px-4 py-3 font-bold text-right">Last Recovery</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-landing-border/40">
                           {data.topContributors.map((t: any) => (
                              <tr key={t.id} className="hover:bg-landing-ivory/50 transition-colors">
                                 <td className="px-4 py-3 font-bold text-landing-graphite">{t.customer}</td>
                                 <td className="px-4 py-3 text-right font-bold text-landing-success">{t.recoveredAmount}</td>
                                 <td className="px-4 py-3 text-right font-bold text-landing-graphite">{t.recoveryRate}%</td>
                                 <td className="px-4 py-3 text-right text-xs font-semibold text-landing-text-sec">{t.lastRecovery}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   )}
                </div>
             </Card>
          </div>
        </>
      )}

    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  trend, 
  isPositive, 
  compareEnabled,
  highlight = "default" 
}: { 
  title: string, 
  value: string, 
  trend: string, 
  isPositive: boolean,
  compareEnabled: boolean,
  highlight?: "default" | "emerald" | "amber" | "blue"
}) {
  
  let bgClass = "bg-landing-surface";
  let borderClass = "border-landing-border/30";
  let titleClass = "text-landing-text-sec";
  let valueClass = "text-landing-graphite";

  if (highlight === 'emerald') {
    bgClass = "bg-landing-success/5";
    borderClass = "border-landing-success/40";
    titleClass = "text-landing-success";
    valueClass = "text-landing-success";
  } else if (highlight === 'amber') {
    bgClass = "bg-landing-champagne/5";
    borderClass = "border-landing-champagne/40";
    titleClass = "text-landing-champagne";
    valueClass = "text-landing-champagne";
  } else if (highlight === 'blue') {
    bgClass = "bg-landing-champagne-light/5";
    borderClass = "border-landing-champagne-light/40";
    titleClass = "text-landing-deep";
    valueClass = "text-landing-graphite";
  }

  return (
    <Card className={`shadow-sm ${borderClass} ${bgClass}`}>
      <div className="p-4">
        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${titleClass}`}>{title}</p>
        <h3 className={`text-xl font-bold ${valueClass}`}>{value}</h3>
        {compareEnabled && (
          <p className={`text-[10px] font-semibold flex items-center mt-1.5 ${isPositive ? 'text-landing-success' : 'text-landing-failure'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {trend} <span className="text-landing-text-sec/60 font-medium ml-1">vs prev</span>
          </p>
        )}
      </div>
    </Card>
  )
}
