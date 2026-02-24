import React, { useEffect, useState } from 'react'
import api from '../api/client'
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Stack,
  Alert,
} from '@mui/material'

type BodyLog = {
  id: number
  date: string
  weight_kg: number
  bodyfat_pct?: number
  sleep_hours?: number
}

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  weight_kg: '',
  bodyfat_pct: '',
  sleep_hours: '',
}

export default function BodyLogs() {
  const [items, setItems] = useState<BodyLog[]>([])
  const [loading, setLoading] = useState(false)
  const [addForm, setAddForm] = useState<any>(emptyForm)
  const [editForm, setEditForm] = useState<any>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [originalDate, setOriginalDate] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const r = await api.get('/body-logs')
      setItems(r.data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  const handleAdd = async () => {
    try {
      await api.post('/body-logs/', addForm)
      window.dispatchEvent(new Event('data-updated'))
      setAddForm(emptyForm)
      fetch()
    } catch (e) {
      console.error(e)
      alert('身体ログの追加に失敗しました。')
    }
  }

  const handleEditOpen = (it: BodyLog) => {
    setEditForm({ date: it.date, weight_kg: it.weight_kg, bodyfat_pct: it.bodyfat_pct ?? '', sleep_hours: it.sleep_hours ?? '' })
    setEditingId(it.id)
    setOriginalDate(it.date)
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingId) return
    try {
      if (originalDate && originalDate !== editForm.date) {
        await api.delete(`/body-logs/${editingId}`)
        await api.post('/body-logs/', editForm)
      } else {
        await api.post('/body-logs/', editForm)
      }
      setEditOpen(false)
      setEditingId(null)
      setOriginalDate(null)
      window.dispatchEvent(new Event('data-updated'))
      fetch()
    } catch (e) {
      console.error(e)
      alert('身体ログの更新に失敗しました。')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この身体ログを削除しますか？')) return
    try {
      await api.delete(`/body-logs/${id}`)
      window.dispatchEvent(new Event('data-updated'))
      fetch()
    } catch (e) {
      console.error(e)
      alert('身体ログの削除に失敗しました。')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant='h5'>身体ログ</Typography>
        <Button variant='outlined' onClick={fetch} disabled={loading}>更新</Button>
      </Box>

      <Paper sx={{ p: 2.2, mb: 2.5, borderRadius: 3 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>新しい記録を追加</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label='日付' type='date' value={addForm.date} onChange={(e) => setAddForm((f: any) => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label='体重 (kg)' type='number' inputProps={{ step: '0.1' }} value={addForm.weight_kg} onChange={(e) => setAddForm((f: any) => ({ ...f, weight_kg: Number(e.target.value) }))} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label='体脂肪率 (%)' type='number' inputProps={{ step: '0.1' }} value={addForm.bodyfat_pct} onChange={(e) => setAddForm((f: any) => ({ ...f, bodyfat_pct: e.target.value === '' ? '' : Number(e.target.value) }))} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label='睡眠時間 (h)' type='number' inputProps={{ step: '0.5' }} value={addForm.sleep_hours} onChange={(e) => setAddForm((f: any) => ({ ...f, sleep_hours: e.target.value === '' ? '' : Number(e.target.value) }))} />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' onClick={handleAdd} sx={{ minWidth: 180 }}>追加する</Button>
          </Grid>
        </Grid>
      </Paper>

      {items.length === 0 ? (
        <Alert severity='info' sx={{ borderRadius: 2.5 }}>まだ身体ログがありません。上のフォームから追加してください。</Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((it) => (
            <Grid item xs={12} sm={6} md={4} key={it.id}>
              <Card sx={{ height: '100%', background: 'linear-gradient(160deg, #ffffff 0%, #f8fbff 100%)' }}>
                <CardContent>
                  <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 1 }}>{it.date}</Typography>
                  <Typography sx={{ mb: 0.7 }}>体重: <strong>{it.weight_kg} kg</strong></Typography>
                  <Typography sx={{ mb: 0.7 }}>体脂肪率: <strong>{it.bodyfat_pct ?? '--'} %</strong></Typography>
                  <Typography sx={{ mb: 2 }}>睡眠時間: <strong>{it.sleep_hours ?? '--'} h</strong></Typography>
                  <Stack direction='row' spacing={1}>
                    <Button size='small' variant='outlined' onClick={() => handleEditOpen(it)} sx={{ flex: 1 }}>編集</Button>
                    <Button size='small' color='error' variant='outlined' onClick={() => handleDelete(it.id)} sx={{ flex: 1 }}>削除</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle sx={{ fontWeight: 800 }}>身体ログを編集</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 1.8, pt: 1.5 }}>
          <TextField fullWidth label='日付' type='date' value={editForm.date} onChange={(e) => setEditForm((f: any) => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label='体重 (kg)' type='number' value={editForm.weight_kg} onChange={(e) => setEditForm((f: any) => ({ ...f, weight_kg: Number(e.target.value) }))} />
          <TextField fullWidth label='体脂肪率 (%)' type='number' value={editForm.bodyfat_pct} onChange={(e) => setEditForm((f: any) => ({ ...f, bodyfat_pct: e.target.value === '' ? '' : Number(e.target.value) }))} />
          <TextField fullWidth label='睡眠時間 (h)' type='number' value={editForm.sleep_hours} onChange={(e) => setEditForm((f: any) => ({ ...f, sleep_hours: e.target.value === '' ? '' : Number(e.target.value) }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>キャンセル</Button>
          <Button variant='contained' onClick={handleEditSave}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
