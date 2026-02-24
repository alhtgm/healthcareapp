import React from 'react'
import { Paper, Typography } from '@mui/material'

export default function Settings() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant='h6' sx={{ fontWeight: 800, mb: 1.2 }}>設定</Typography>
      <Typography color='text.secondary'>表示設定や通知設定などの項目は今後追加予定です。</Typography>
    </Paper>
  )
}
