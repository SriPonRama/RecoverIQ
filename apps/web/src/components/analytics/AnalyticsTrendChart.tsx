import { type RecoveryTrendDataPoint } from "../../data/analytics.mock"

interface AnalyticsTrendChartProps {
  data: RecoveryTrendDataPoint[];
}

export function AnalyticsTrendChart({ data }: AnalyticsTrendChartProps) {
  if (!data || data.length === 0) return <div className="p-4 text-gray-500 text-center">No data available</div>;

  const width = 800;
  const height = 250;
  const padding = 40;
  const bottomPadding = 30;

  const maxVal = Math.max(
    ...data.map(d => Math.max(d.recoveryRate, d.failedRate))
  ) * 1.2; 

  const minVal = 0;
  const xStep = (width - padding * 2) / Math.max(1, data.length - 1);
  
  const getY = (val: number) => height - bottomPadding - ((val - minVal) / (maxVal - minVal)) * (height - padding - bottomPadding);
  const getX = (index: number) => padding + index * xStep;

  const recoveryPoints = data.map((d, i) => `${getX(i)},${getY(d.recoveryRate)}`).join(' ');
  const failedPoints = data.map((d, i) => `${getX(i)},${getY(d.failedRate)}`).join(' ');

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full min-w-[500px] text-landing-border" preserveAspectRatio="none">
        
        {/* Grid lines */}
        {[0, 0.5, 1].map(ratio => {
          const y = height - bottomPadding - ratio * (height - padding - bottomPadding);
          const val = maxVal * ratio;
          return (
            <g key={ratio}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeOpacity={0.5} strokeDasharray="4 4" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#6B6862" fontWeight="600">
                {val.toFixed(0)}%
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

        {/* Lines */}
        <polyline points={recoveryPoints} fill="none" stroke="#3F6B4F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={failedPoints} fill="none" stroke="#8A3F3F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />
        
        {/* Data points */}
        {data.map((d, i) => (
          <g key={`pts-${i}`}>
            <circle cx={getX(i)} cy={getY(d.recoveryRate)} r="4" fill="#FFFCF7" stroke="#3F6B4F" strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.failedRate)} r="4" fill="#FFFCF7" stroke="#8A3F3F" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}
