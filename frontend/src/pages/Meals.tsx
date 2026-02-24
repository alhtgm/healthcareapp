import React, { useEffect, useState } from 'react'
import api from '../api/client'
import {
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
} from '@mui/material'

type MealLog = {
  id: number
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  calories_kcal: number
  protein_g?: number
}

const emptyForm = { date: new Date().toISOString().slice(0, 10), meal_type: 'breakfast', calories_kcal: 0, protein_g: 0 }

export default function Meals() {
  const [items, setItems] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(false)
  const [addForm, setAddForm] = useState<any>(emptyForm)
  const [editForm, setEditForm] = useState<any>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const r = await api.get('/meal-logs')
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
      await api.post('/meal-logs/', addForm)
      window.dispatchEvent(new Event('data-updated'))
      setAddForm(emptyForm)
      fetch()
    } catch (e) {
      console.error(e)
      alert('食事ログの追加に失敗しました。')
    }
  }

  const handleEditOpen = (it: MealLog) => {
    setEditForm({ date: it.date, meal_type: it.meal_type, calories_kcal: it.calories_kcal, protein_g: it.protein_g ?? 0 })
    setEditingId(it.id)
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingId) return
    try {
      await api.put(`/meal-logs/${editingId}`, editForm)
      setEditOpen(false)
      setEditingId(null)
      window.dispatchEvent(new Event('data-updated'))
      fetch()
    } catch (e) {
      console.error(e)
      alert('食事ログの更新に失敗しました。')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この食事ログを削除しますか？')) return
    try {
      await api.delete(`/meal-logs/${id}`)
      window.dispatchEvent(new Event('data-updated'))
      fetch()
    } catch (e) {
      console.error(e)
      alert('食事ログの削除に失敗しました。')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant='h5'>食事ログ</Typography>
        <Button variant='outlined' onClick={fetch} disabled={loading}>更新</Button>
      </Box>

      <Paper sx={{ p: 2.2, mb: 2.5, borderRadius: 3 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>新しい記録を追加</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label='日付' type='date' value={addForm.date} onChange={(e) => setAddForm((f: any) => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth select label='食事タイプ' value={addForm.meal_type} onChange={(e) => setAddForm((f: any) => ({ ...f, meal_type: e.target.value }))}>
              <MenuItem value='breakfast'>朝食</MenuItem>
              <MenuItem value='lunch'>昼食</MenuItem>
              <MenuItem value='dinner'>夕食</MenuItem>
              <MenuItem value='snack'>間食</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label='カロリー (kcal)' type='number' inputProps={{ step: '10', min: 0 }} value={addForm.calories_kcal} onChange={(e) => setAddForm((f: any) => ({ ...f, calories_kcal: Number(e.target.value) }))} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label='タンパク質 (g)' type='number' inputProps={{ step: '1', min: 0 }} value={addForm.protein_g} onChange={(e) => setAddForm((f: any) => ({ ...f, protein_g: Number(e.target.value) }))} />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' onClick={handleAdd} sx={{ minWidth: 180 }}>追加する</Button>
          </Grid>
        </Grid>
      </Paper>

      {items.length === 0 ? (
        <Alert severity='info' sx={{ borderRadius: 2.5 }}>まだ食事ログがありません。上のフォームから追加してください。</Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((it) => (
            <Grid item xs={12} sm={6} md={4} key={it.id}>
              <Card sx={{ height: '100%', background: 'linear-gradient(160deg, #ffffff 0%, #f7fffc 100%)' }}>
                <CardContent>
                  <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1.3 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>{it.date}</Typography>
                    <Chip label={mealLabel(it.meal_type)} size='small' color='primary' variant='outlined' />
                  </Stack>
                  <Typography sx={{ mb: 0.7 }}>カロリー: <strong>{it.calories_kcal} kcal</strong></Typography>
                  <Typography sx={{ mb: 2 }}>タンパク質: <strong>{it.protein_g ?? 0} g</strong></Typography>
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
        <DialogTitle sx={{ fontWeight: 800 }}>食事ログを編集</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 1.8, pt: 1.5 }}>
          <TextField fullWidth label='日付' type='date' value={editForm.date} onChange={(e) => setEditForm((f: any) => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth select label='食事タイプ' value={editForm.meal_type} onChange={(e) => setEditForm((f: any) => ({ ...f, meal_type: e.target.value }))}>
            <MenuItem value='breakfast'>朝食</MenuItem>
            <MenuItem value='lunch'>昼食</MenuItem>
            <MenuItem value='dinner'>夕食</MenuItem>
            <MenuItem value='snack'>間食</MenuItem>
          </TextField>
          <TextField fullWidth label='カロリー (kcal)' type='number' value={editForm.calories_kcal} onChange={(e) => setEditForm((f: any) => ({ ...f, calories_kcal: Number(e.target.value) }))} />
          <TextField fullWidth label='タンパク質 (g)' type='number' value={editForm.protein_g} onChange={(e) => setEditForm((f: any) => ({ ...f, protein_g: Number(e.target.value) }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>キャンセル</Button>
          <Button variant='contained' onClick={handleEditSave}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function mealLabel(type: MealLog['meal_type']) {
  if (type === 'breakfast') return '朝食'
  if (type === 'lunch') return '昼食'
  if (type === 'dinner') return '夕食'
  return '間食'
}
