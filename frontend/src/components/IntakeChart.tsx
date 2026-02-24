import React from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function IntakeChart({ data, tdee }: { data: any[]; tdee?: number }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#82ca9d" />
        {tdee && <Line type="monotone" data={data.map(d => ({ ...d, tdee }))} dataKey="tdee" stroke="#ff7300" dot={false} />}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
