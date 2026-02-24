import React from 'react'
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function WeightChart({ weightData, bodyfatData }: { weightData: any[]; bodyfatData?: any[] }) {
  // Merge weight and bodyfat data by date
  const dataMap = new Map<string, any>()
  
  weightData.forEach(d => {
    dataMap.set(d.date, { ...dataMap.get(d.date), date: d.date, weight: d.value })
  })
  
  bodyfatData?.forEach(d => {
    dataMap.set(d.date, { ...dataMap.get(d.date), date: d.date, bodyfat: d.value })
  })
  
  const mergedData = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <ComposedChart data={mergedData} margin={{ top: 20, right: 60, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" stroke="#9e9e9e" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="left" stroke="#1e88e5" label={{ value: '体重 (kg)', angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#1e88e5', fontWeight: 600 } }} />
          {bodyfatData && bodyfatData.length > 0 && (
            <YAxis yAxisId="right" orientation="right" stroke="#ff6f00" label={{ value: '体脂肪率 (%)', angle: 90, position: 'insideRight', offset: 10, style: { fill: '#ff6f00', fontWeight: 600 } }} />
          )}
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
            formatter={(val: any, name: string | undefined) => {
              if (name === 'weight') return [`${parseFloat(val).toFixed(1)} kg`, '⚖️ 体重']
              if (name === 'bodyfat') return [`${parseFloat(val).toFixed(1)} %`, '🔥 体脂肪率']
              return [val, name]
            }}
            labelFormatter={(label: any) => `📅 ${label}`}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
          <Area yAxisId="left" type="monotone" dataKey="weight" stroke="#1e88e5" strokeWidth={2.5} fillOpacity={0.3} fill="#1e88e5" dot={{ fill: '#1e88e5', r: 4 }} activeDot={{ r: 6 }} name="📊 体重" />
          {bodyfatData && bodyfatData.length > 0 && (
            <Line yAxisId="right" type="monotone" dataKey="bodyfat" stroke="#ff6f00" strokeWidth={2.5} dot={{ fill: '#ff6f00', r: 4 }} activeDot={{ r: 6 }} name="🔥 体脂肪率" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
