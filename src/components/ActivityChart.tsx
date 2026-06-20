import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CircleDashed,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart2 as BarChartIcon,
} from "lucide-react";
import { Agenda } from "../types";

interface ActivityChartProps {
  agendas: Agenda[];
}

const CustomDot = (props: any) => {
  const { cx, cy, value, stroke } = props;
  if (value === null || value === undefined) return null;
  if (value === 0) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      stroke={stroke}
      strokeWidth={1.5}
      fill="#fff"
    />
  );
};

const CustomActiveDot = (props: any) => {
  const { cx, cy, value, stroke } = props;
  if (value === null || value === undefined) return null;
  if (value === 0) return null;
  return (
    <circle cx={cx} cy={cy} r={5} stroke="#fff" strokeWidth={2} fill={stroke} />
  );
};

export const ActivityChart: React.FC<ActivityChartProps> = ({ agendas }) => {
  const [chartType, setChartType] = useState<"line" | "bar" | "circle">("line");

  const agendasByDate = useMemo(() => {
    return agendas.reduce(
      (acc, agenda) => {
        const dateParts = agenda.tanggal.split("-");
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[2], 10);
          if (!acc[day]) {
            acc[day] = { total: 0, terlaksana: 0, terjadwal: 0, terlewat: 0 };
          }
          acc[day].total += 1;
          if (agenda.status === "Selesai") acc[day].terlaksana += 1;
          else if (agenda.status === "Rencana") acc[day].terjadwal += 1;
          else if (agenda.status === "Terlewat") acc[day].terlewat += 1;
        }
        return acc;
      },
      {} as Record<
        number,
        {
          total: number;
          terlaksana: number;
          terjadwal: number;
          terlewat: number;
        }
      >,
    );
  }, [agendas]);

  const { chartData, maxVal } = useMemo(() => {
    const data = [];
    let maxAbs = 0;

    for (let i = 1; i <= 31; i++) {
      const t = agendasByDate[i]?.terlaksana || 0;
      const r = agendasByDate[i]?.terjadwal || 0;
      const w = agendasByDate[i]?.terlewat || 0;

      if (t > maxAbs) maxAbs = t;
      if (w > maxAbs) maxAbs = w;

      data.push({
        name: `Tgl ${i}`,
        total: agendasByDate[i]?.total || 0,
        Selesai: t > 0 ? t : 0,
        Rencana: r > 0 ? 0 : null,
        Terlewat: w > 0 ? -w : 0,
        rawRencana: r,
      });
    }
    return { chartData: data, maxVal: Math.max(maxAbs, 2) };
  }, [agendasByDate]);

  const pieData = useMemo(() => {
    const terlaksana = agendas.filter((a) => a.status === "Selesai").length;
    const rencana = agendas.filter((a) => a.status === "Rencana").length;
    const terlewat = agendas.filter((a) => a.status === "Terlewat").length;

    return [
      { name: "Selesai", value: terlaksana, color: "#10b981" },
      { name: "Rencana", value: rencana, color: "#0ea5e9" },
      { name: "Terlewat", value: terlewat, color: "#f43f5e" },
    ].filter((item) => item.value > 0);
  }, [agendas]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 w-full h-[360px] md:h-[480px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
          <CircleDashed className="w-4 h-4 text-brand-500 animate-spin-slow" />
          Aktivitas
        </h3>
        <div className="flex bg-slate-50 p-1 rounded-lg">
          <button
            onClick={() => setChartType("line")}
            className={`p-1.5 rounded-md text-xs font-medium transition-all ${chartType === "line" ? "bg-white shadow-sm text-brand-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`p-1.5 rounded-md text-xs font-medium transition-all ${chartType === "bar" ? "bg-white shadow-sm text-brand-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <BarChartIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType("circle")}
            className={`p-1.5 rounded-md text-xs font-medium transition-all ${chartType === "circle" ? "bg-white shadow-sm text-brand-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div
        className={`flex-1 w-full mt-2 relative ${chartType === "circle" ? "overflow-hidden" : "-ml-4 overflow-x-auto overflow-y-hidden no-scrollbar"}`}
      >
        <div
          className={`${chartType === "circle" ? "w-full flex items-center justify-center" : "min-w-[1200px] md:min-w-[1600px] lg:min-w-[2000px]"} h-full relative ${chartType === "circle" ? "" : "pl-2 pr-4"}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorTerlewat"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={10}
                  minTickGap={10}
                />
                <YAxis
                  hide={true}
                  domain={[
                    -maxVal - (maxVal * 0.3 + 1),
                    maxVal + (maxVal * 0.3 + 1),
                  ]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                  labelStyle={{ color: "#64748b", marginBottom: "4px" }}
                  formatter={(value: any, name: any, props: any) => {
                    if (name === "Rencana")
                      return [props.payload.rawRencana, name];
                    return [Math.abs(value), name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Selesai"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSelesai)"
                  dot={<CustomDot />}
                  activeDot={<CustomActiveDot />}
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="Rencana"
                  stroke="#0ea5e9"
                  strokeWidth={0}
                  fillOpacity={0}
                  dot={false}
                  activeDot={false}
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="Terlewat"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTerlewat)"
                  dot={<CustomDot />}
                  activeDot={<CustomActiveDot />}
                  connectNulls={false}
                />
              </AreaChart>
            ) : chartType === "bar" ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={10}
                  minTickGap={10}
                />
                <YAxis
                  hide={true}
                  domain={[
                    -maxVal - (maxVal * 0.3 + 1),
                    maxVal + (maxVal * 0.3 + 1),
                  ]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                  labelStyle={{ color: "#64748b", marginBottom: "4px" }}
                  formatter={(value: any, name: any, props: any) => {
                    if (name === "Rencana")
                      return [props.payload.rawRencana, name];
                    return [Math.abs(value), name];
                  }}
                />
                <Bar dataKey="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rencana" fill="#0ea5e9" radius={[4, 4, 4, 4]} />
                <Bar dataKey="Terlewat" fill="#f43f5e" radius={[0, 0, 4, 4]} />
              </BarChart>
            ) : (
              <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Pie
                  data={
                    pieData.length > 0
                      ? pieData
                      : [{ name: "Data Kosong", value: 1, color: "#e2e8f0" }]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(pieData.length > 0
                    ? pieData
                    : [{ name: "Data Kosong", value: 1, color: "#e2e8f0" }]
                  ).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                  formatter={(value: any, name: any) => [value, name]}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
          {chartType === "circle" && pieData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">
                Belum ada aktivitas
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
