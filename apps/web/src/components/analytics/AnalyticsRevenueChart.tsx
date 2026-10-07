import { type RevenueChartDataPoint } from "../../data/analytics.mock"

interface AnalyticsRevenueChartProps {
  data: RevenueChartDataPoint[];
}

export function AnalyticsRevenueChart({ data }: AnalyticsRevenueChartProps) {
  if (!data || data.length === 0) return <div className="p-4 text-gray-500 text-center">No data available</div>;

  const width = 800;
  const height = 300;
  const padding = 40;
  const bottomPadding = 30;

  const maxVal = Math.max(
    ...data.map(d => Math.max(d.processed, d.failed, d.recovered))
  ) * 1.1; 

  const minVal = 0;
  const xStep = (width - padding * 2) / Math.max(1, data.length - 1);
  
  const getY = (val: number) => height - bottomPadding - ((val - minVal) / (maxVal - minVal)) * (height - padding - bottomPadding);
  const getX = (index: number) => padding + index * xStep;

  const processedPoints = data.map((d, i) => `${getX(i)},${getY(d.processed)}`).join(' ');
  const failedPoints = data.map((d, i) => `${getX(i)},${getY(d.failed)}`).join(' ');
  const recoveredPoints = data.map((d, i) => `${getX(i)},${getY(d.recovered)}`).join(' ');

  const processedAreaPath = `M ${getX(0)},${height - bottomPadding} L ${processedPoints} L ${getX(data.length - 1)},${height - bottomPadding} Z`;
  const failedAreaPath = `M ${getX(0)},${height - bottomPadding} L ${failedPoints} L ${getX(data.length - 1)},${height - bottomPadding} Z`;
  const recoveredAreaPath = `M ${getX(0)},${height - bottomPadding} L ${recoveredPoints} L ${getX(data.length - 1)},${height - bottomPadding} Z`;

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full min-w-[600px] text-landing-border" preserveAspectRatio="none">
        <defs>
          <linearGradient id="processedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E9D9A7" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#E9D9A7" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8A3F3F" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#8A3F3F" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="recoveredGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3F6B4F" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3F6B4F" stopOpacity={0}/>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const y = height - bottomPadding - ratio * (height - padding - bottomPadding);
          const val = maxVal * ratio;
          return (
            <g key={ratio}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeOpacity={0.5} strokeDasharray="4 4" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#6B6862" fontWeight="600">
                ₹{(val / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={height - 10} textAnchor="middle" fontSize="11" fill="#6B6862" fontWeight="600">
            {d.date}
          </text>
        ))}

        {/* Areas */}
        <path d={processedAreaPath} fill="url(#processedGrad)" />
        <path d={failedAreaPath} fill="url(#failedGrad)" />
        <path d={recoveredAreaPath} fill="url(#recoveredGrad)" />

        {/* Lines */}
        <polyline points={processedPoints} fill="none" stroke="#E9D9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={failedPoints} fill="none" stroke="#8A3F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={recoveredPoints} fill="none" stroke="#3F6B4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Data points */}
        {data.map((d, i) => (
          <g key={`pts-${i}`}>
            <circle cx={getX(i)} cy={getY(d.processed)} r="3" fill="#FFFCF7" stroke="#E9D9A7" strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.failed)} r="3" fill="#FFFCF7" stroke="#8A3F3F" strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.recovered)} r="3" fill="#FFFCF7" stroke="#3F6B4F" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}
