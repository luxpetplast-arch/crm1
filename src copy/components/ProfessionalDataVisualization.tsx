import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Chart data interfaces
export interface ChartData {
  name: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// Color palette
const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Bar Chart Component
export function ProfessionalBarChart({ 
  data, 
  title, 
  height = 300,
  showTrend = false 
}: { 
  data: ChartData[]; 
  title?: string; 
  height?: number;
  showTrend?: boolean;
}) {
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showTrend && data[0]?.trend && (
            <div className="flex items-center gap-2">
              {getTrendIcon(data[0].trend)}
              <span className={`text-sm font-medium ${
                data[0].trend === 'up' ? 'text-green-600' :
                data[0].trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {data[0].change ? `${data[0].change}%` : ''}
              </span>
            </div>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#3B82F6"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Line Chart Component
export function ProfessionalLineChart({ 
  data, 
  title, 
  height = 300,
  showArea = false 
}: { 
  data: TimeSeriesData[]; 
  title?: string; 
  height?: number;
  showArea?: boolean;
}) {
  const ChartComponent = showArea ? AreaChart : LineChart;
  const DataComponent = showArea ? Area : Line;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <DataComponent
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            fill={showArea ? "#3B82F6" : undefined}
            fillOpacity={showArea ? 0.3 : undefined}
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

// Pie Chart Component
export function ProfessionalPieChart({ 
  data, 
  title, 
  height = 300,
  showLabels = true 
}: { 
  data: PieChartData[]; 
  title?: string; 
  height?: number;
  showLabels?: boolean;
}) {
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (!showLabels) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLabels && <Legend />}
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Multi-series Line Chart
export function ProfessionalMultiLineChart({ 
  data, 
  title, 
  height = 300,
  series 
}: { 
  data: any[]; 
  title?: string; 
  height?: number;
  series: { key: string; name: string; color: string }[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {series.map((s, index) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={{ fill: s.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name={s.name}
              animationDuration={1000}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Stacked Bar Chart
export function ProfessionalStackedBarChart({ 
  data, 
  title, 
  height = 300,
  stacks 
}: { 
  data: any[]; 
  title?: string; 
  height?: number;
  stacks: { key: string; name: string; color: string }[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {stacks.map((s, index) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="stack"
              fill={s.color}
              name={s.name}
              animationDuration={1000}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// KPI Card with mini chart
export function ProfessionalKPIChart({ 
  data, 
  title, 
  value, 
  change, 
  trend = 'up',
  height = 100 
}: { 
  data: TimeSeriesData[]; 
  title: string; 
  value: string; 
  change?: number; 
  trend?: 'up' | 'down' | 'stable';
  height?: number;
}) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mb-4">{value}</div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Heatmap Component (simplified version)
export function ProfessionalHeatmap({ 
  data, 
  title, 
  height = 300 
}: { 
  data: any[]; 
  title?: string; 
  height?: number;
}) {
  const getHeatmapColor = (value: number, min: number, max: number) => {
    const normalized = (value - min) / (max - min);
    const intensity = Math.floor(normalized * 255);
    return `rgb(${255 - intensity}, ${intensity}, 100)`;
  };

  const flatData = data.flat();
  const minValue = Math.min(...flatData.map((d: any) => d.value));
  const maxValue = Math.max(...flatData.map((d: any) => d.value));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="grid gap-1" style={{ height }}>
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
            {row.map((cell: any, cellIndex: number) => (
              <div
                key={cellIndex}
                className="flex items-center justify-center text-xs font-medium rounded"
                style={{
                  backgroundColor: getHeatmapColor(cell.value, minValue, maxValue),
                  color: cell.value > (minValue + maxValue) / 2 ? 'white' : 'black',
                  minHeight: '40px'
                }}
              >
                {cell.value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  ProfessionalBarChart,
  ProfessionalLineChart,
  ProfessionalPieChart,
  ProfessionalMultiLineChart,
  ProfessionalStackedBarChart,
  ProfessionalKPIChart,
  ProfessionalHeatmap,
};
