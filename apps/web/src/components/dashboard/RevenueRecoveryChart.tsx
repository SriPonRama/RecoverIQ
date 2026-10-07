interface ChartDataPoint {
  date: string;
  recovered: number;
  atRisk: number;
}

interface RevenueRecoveryChartProps {
  data: ChartDataPoint[];
}

export function RevenueRecoveryChart({ data }: RevenueRecoveryChartProps) {
  // Simple SVG charting logic
  if (!data || data.length === 0) return <div className="flex justify-center items-center h-[300px] text-landing-text-sec text-sm italic">No data available yet</div>;

  const width = 800;
  const height = 300;
  const padding = 40;

  const maxVal = Math.max(
    ...data.map(d => Math.max(d.recovered, d.atRisk))
  ) * 1.1; // Add 10% padding to top

  const minVal = 0;
  const xStep = (width - padding * 2) / (data.length - 1);
  
  const getY = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
  const getX = (index: number) => padding + index * xStep;

  const recoveredPoints = data.map((d, i) => `${getX(i)},${getY(d.recovered)}`).join(' ');
  const atRiskPoints = data.map((d, i) => `${getX(i)},${getY(d.atRisk)}`).join(' ');

  // SVG Area path for recovered (gradient fill)
  const recoveredAreaPath = `M ${getX(0)},${height - padding} L ${recoveredPoints} L ${getX(data.length - 1)},${height - padding} Z`;
  const atRiskAreaPath = `M ${getX(0)},${height - padding} L ${atRiskPoints} L ${getX(data.length - 1)},${height - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full min-w-[600px] text-landing-text-sec">
        {/* Gradients */}
        <defs>
          <linearGradient id="recoveredGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3F6B4F" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3F6B4F" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="atRiskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8A3F3F" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8A3F3F" stopOpacity={0}/>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const y = height - padding - ratio * (height - padding * 2);
          const val = maxVal * ratio;
          return (
            <g key={ratio}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeOpacity={0.1} strokeDasharray="4 4" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="currentColor">
                ₹{(val / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="currentColor">
            {d.date}
          </text>
        ))}

        {/* Areas */}
        <path d={recoveredAreaPath} fill="url(#recoveredGradient)" />
        <path d={atRiskAreaPath} fill="url(#atRiskGradient)" />

        {/* Lines */}
        <polyline points={recoveredPoints} fill="none" stroke="#3F6B4F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={atRiskPoints} fill="none" stroke="#8A3F3F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Data points */}
        {data.map((d, i) => (
          <g key={`pts-${i}`}>
            <circle cx={getX(i)} cy={getY(d.recovered)} r="4" fill="#FFFCF7" stroke="#3F6B4F" strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.atRisk)} r="4" fill="#FFFCF7" stroke="#8A3F3F" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}
