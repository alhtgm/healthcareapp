import React from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'

type Point = { date: string; calories?: number; protein?: number }

export default function NutritionChart({ calorieData, proteinData, tdee }: { calorieData: Point[]; proteinData: Point[]; tdee?: number }) {
  // Merge calorie and protein data by date
  const mergedData: { [key: string]: any } = {}
  calorieData.forEach((item) => {
    mergedData[item.date] = { date: item.date, calories: item.calories || 0 }
  })
  proteinData.forEach((item) => {
    if (mergedData[item.date]) {
      mergedData[item.date].protein = item.protein || 0
    } else {
      mergedData[item.date] = { date: item.date, protein: item.protein || 0 }
    }
  })

  const data = Object.values(mergedData).sort((a, b) => a.date.localeCompare(b.date))

  // Add TDEE reference line if provided
  if (tdee) {
    data.forEach((d) => {
      d.tdee = tdee
    })
  }

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 20, right: 60, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" stroke="#9e9e9e" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="left" stroke="#66bb6a" label={{ value: 'カロリー (kcal)', angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#66bb6a', fontWeight: 600 } }} />
          <YAxis yAxisId="right" orientation="right" stroke="#1e88e5" label={{ value: 'タンパク質 (g)', angle: 90, position: 'insideRight', offset: 10, style: { fill: '#1e88e5', fontWeight: 600 } }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
            formatter={(val: any, name: string | undefined) => {
              if (name === 'calories') return [`${Math.round(val)} kcal`, '摂取カロリー']
              if (name === 'tdee') return [`${Math.round(val)} kcal`, 'TDEE']
              if (name === 'protein') return [`${Math.round(val)} g`, 'タンパク質']
              return [val, name]
            }}
            labelFormatter={(label: any) => `📅 ${label}`}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
          <Bar yAxisId="left" dataKey="calories" fill="#66bb6a" name="📊 摂取カロリー" radius={[8, 8, 0, 0]} />
          {tdee && <Line yAxisId="left" type="monotone" dataKey="tdee" stroke="#ff9800" strokeDasharray="5 5" strokeWidth={2} dot={false} name="🎯 TDEE参考" />}
          <Line yAxisId="right" type="monotone" dataKey="protein" stroke="#1e88e5" strokeWidth={2.5} dot={{ fill: '#1e88e5', r: 4 }} activeDot={{ r: 6 }} name="🥩 タンパク質" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
