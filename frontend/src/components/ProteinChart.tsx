import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

type Point = { date: string; value: number }

export default function ProteinChart({ data }: { data: Point[] }) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis unit="g" />
          <Tooltip formatter={(val: any, name: string | undefined) => [`${val} g`, 'タンパク質']} />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} name="タンパク質 (g)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
