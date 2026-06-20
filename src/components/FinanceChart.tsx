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
import { Keuangan } from "../types";

interface FinanceChartProps {
  data: Keuangan[];
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

export const FinanceChart: React.FC<FinanceChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<"line" | "bar" | "circle">("line");

  const dataByDate = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        const dateParts = item.tanggal.split("-");
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[2], 10);
          if (!acc[day]) {
            acc[day] = { pemasukan: 0, pengeluaran: 0 };
          }
          if (item.jenis === "Pemasukan") acc[day].pemasukan += item.jumlah;
          else if (item.jenis === "Pengeluaran")
            acc[day].pengeluaran += item.jumlah;
        }
        return acc;
      },
      {} as Record<number, { pemasukan: number; pengeluaran: number }>,
    );
  }, [data]);

  const { chartData, maxVal } = useMemo(() => {
    const chartData = [];
    let maxAbs = 0;

    for (let i = 1; i <= 31; i++) {
      const p = dataByDate[i]?.pemasukan || 0;
      const e = dataByDate[i]?.pengeluaran || 0;

      if (p > maxAbs) maxAbs = p;
      if (e > maxAbs) maxAbs = e;

      chartData.push({
        name: `Tgl ${i}`,
        Pemasukan: p > 0 ? p : 0,
        Pengeluaran: e > 0 ? -e : 0,
        rawPengeluaran: e,
      });
    }
    return { chartData, maxVal: Math.max(maxAbs, 1000) };
  }, [dataByDate]);

  const pieData = useMemo(() => {
    let pemasukan = 0;
    let pengeluaran = 0;
    data.forEach((item) => {
      if (item.jenis === "Pemasukan") pemasukan += item.jumlah;
      if (item.jenis === "Pengeluaran") pengeluaran += item.jumlah;
    });

    return [
      { name: "Pemasukan", value: pemasukan, color: "#10b981" },
      { name: "Pengeluaran", value: pengeluaran, color: "#f43f5e" },
    ].filter((item) => item.value > 0);
  }, [data]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 w-full h-[240px] md:h-[280px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
          <CircleDashed className="w-4 h-4 text-brand-500 animate-spin-slow" />
          Aktivitas Keuangan
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
        className={`flex-1 w-full mt-2 relative ${chartType === "circle" ? "overflow-hidden" : "-ml-4 overflow-x-auto no-scrollbar"}`}
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
                  <linearGradient
                    id="colorPemasukan"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorPengeluaran"
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
                    -maxVal - (maxVal * 0.2 + 1000),
                    maxVal + (maxVal * 0.2 + 1000),
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
                    if (name === "Pengeluaran")
                      return [formatRupiah(props.payload.rawPengeluaran), name];
                    return [formatRupiah(Math.abs(value)), name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Pemasukan"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPemasukan)"
                  dot={<CustomDot />}
                  activeDot={<CustomActiveDot />}
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="Pengeluaran"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPengeluaran)"
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
                    -maxVal - (maxVal * 0.2 + 1000),
                    maxVal + (maxVal * 0.2 + 1000),
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
                    if (name === "Pengeluaran")
                      return [formatRupiah(props.payload.rawPengeluaran), name];
                    return [formatRupiah(Math.abs(value)), name];
                  }}
                />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="Pengeluaran"
                  fill="#f43f5e"
                  radius={[0, 0, 4, 4]}
                />
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
                  formatter={(value: any, name: any) => [
                    name === "Data Kosong" ? value : formatRupiah(value),
                    name,
                  ]}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
          {chartType === "circle" && pieData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">
                Belum ada transaksi
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
