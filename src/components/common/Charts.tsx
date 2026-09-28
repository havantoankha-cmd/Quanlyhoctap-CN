import React, { useState } from 'react';

// Reusable SVG Bar Chart
interface BarChartProps {
  data: { label: string; value: number; color?: string; secondaryValue?: number }[];
  height?: number;
  maxValue?: number;
  unit?: string;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 240,
  maxValue,
  unit = '',
  showValues = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 10);
  const paddingBottom = 40;
  const chartHeight = height - paddingBottom;

  return (
    <div className="w-full relative select-none">
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: `${chartHeight}px` }}>
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
            <div key={ratio} className="w-full flex items-center gap-2">
              <span className="text-[11px] text-slate-400 w-7 text-right font-medium">
                {Math.round(ratio * max * 10) / 10}
              </span>
              <div className="flex-1 border-b border-slate-100" />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="absolute left-9 right-2 bottom-10 top-2 flex items-end justify-around gap-2">
          {data.map((item, idx) => {
            const barHeightPct = Math.min(100, Math.max(4, (item.value / max) * 100));
            const isHovered = hoveredIdx === idx;
            const barBg = item.color || '#2563eb';

            return (
              <div
                key={idx}
                className="flex-1 h-full flex flex-col items-center justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 z-20 bg-slate-900 text-white text-xs px-2.5 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none animate-fadeIn">
                    <span className="font-semibold">{item.label}</span>: {item.value} {unit}
                  </div>
                )}

                {/* Score value on top of bar */}
                {showValues && (
                  <span
                    className={`text-[11px] font-semibold mb-1 transition-colors ${
                      isHovered ? 'text-blue-600' : 'text-slate-600'
                    }`}
                  >
                    {item.value}
                  </span>
                )}

                {/* Bar element */}
                <div className="w-full max-w-[48px] bg-slate-100 rounded-t-md overflow-hidden relative" style={{ height: '100%' }}>
                  <div
                    className="w-full rounded-t-md transition-all duration-500 ease-out"
                    style={{
                      height: `${barHeightPct}%`,
                      position: 'absolute',
                      bottom: 0,
                      backgroundColor: barBg,
                      opacity: isHovered ? 1 : 0.88,
                      transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                      transformOrigin: 'bottom',
                    }}
                  />
                </div>

                {/* X Axis Label */}
                <span className="absolute -bottom-8 text-[11px] text-slate-600 font-medium text-center truncate max-w-full px-1">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Reusable SVG Line Chart
interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  min?: number;
  max?: number;
  lineColor?: string;
  fillColor?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 180,
  min = 0,
  max = 10,
  lineColor = '#2563eb',
  fillColor = 'rgba(37, 99, 235, 0.08)',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const width = 500;
  const paddingX = 40;
  const paddingY = 24;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  if (data.length === 0) return <div className="text-center py-6 text-slate-400">Không có dữ liệu biểu đồ</div>;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * plotWidth;
    const y = paddingY + plotHeight - ((d.value - min) / (max - min)) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = paddingY + plotHeight * (1 - r);
          const val = Math.round((min + r * (max - min)) * 10) / 10;
          return (
            <g key={r}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <text x={paddingX - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-slate-400 font-sans">
                {val}
              </text>
            </g>
          );
        })}

        {/* Fill Area */}
        <path d={areaD} fill={fillColor} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points & Labels */}
        {points.map((p, i) => (
          <g
            key={i}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 6 : 4}
              fill="#ffffff"
              stroke={lineColor}
              strokeWidth="2.5"
              className="transition-all duration-200"
            />
            {/* Score label badge */}
            <rect
              x={p.x - 14}
              y={p.y - 24}
              width="28"
              height="16"
              rx="4"
              fill={hoveredIdx === i ? '#1e293b' : '#3b82f6'}
              className="transition-colors"
            />
            <text x={p.x} y={p.y - 13} textAnchor="middle" className="text-[10px] fill-white font-bold font-sans">
              {p.value}
            </text>

            {/* X axis label */}
            <text x={p.x} y={height - 6} textAnchor="middle" className="text-[11px] fill-slate-600 font-medium font-sans">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Reusable SVG Donut Chart
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  centerText?: string;
  centerSubtext?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
  centerText,
  centerSubtext,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {data.map((item, idx) => {
            const strokeDashoffset = circumference - (item.value / total) * circumference;
            const rotate = currentAngle;
            currentAngle += (item.value / total) * 360;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        {(centerText || centerSubtext) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {centerText && <span className="text-xl font-bold text-slate-800 leading-tight">{centerText}</span>}
            {centerSubtext && <span className="text-[11px] text-slate-500 font-medium">{centerSubtext}</span>}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((item, idx) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 px-2 py-1 rounded transition-colors cursor-pointer ${
                hoveredIdx === idx ? 'bg-slate-100' : ''
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600 font-medium">{item.label}</span>
              <span className="text-xs font-bold text-slate-800 ml-auto pl-3">
                {item.value} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
