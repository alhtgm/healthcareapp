import React, { useEffect, useState } from 'react'
import {
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
  Alert,
  Chip,
  Stack,
} from '@mui/material'
import api from '../api/client'

type Profile = {
  sex?: string
  age?: number
  height_cm?: number
  activity_level?: number
  current_bodyfat_pct?: number
  current_muscle_mass_kg?: number
  goal_weight_kg?: number
  goal_bodyfat_pct?: number
  goal_calories_kcal?: number
  goal_rate_kg_per_week?: number
}

type Computed = {
  bmr?: number
  tdee?: number
  recommended_intake?: number
  recommended_rate_kg_per_week?: number
}

const initialProfile: Profile = {
  sex: 'male',
  age: 30,
  height_cm: 170,
  activity_level: 1.55,
  current_bodyfat_pct: 20,
  current_muscle_mass_kg: 55,
  goal_weight_kg: 68,
  goal_bodyfat_pct: 15,
  goal_calories_kcal: undefined,
  goal_rate_kg_per_week: undefined,
}

export default function Setup() {
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [computed, setComputed] = useState<Computed | null>(null)
  const [profile, setProfile] = useState<Profile>(initialProfile)

  useEffect(() => {
    const load = async () => {
      setLoadingProfile(true)
      try {
        const r = await api.get('/profile')
        setProfile((prev) => ({ ...prev, ...r.data }))
      } catch {
        // 初回はプロフィール未作成のため何もしない
      } finally {
        setLoadingProfile(false)
      }
    }
    load()
  }, [])

  const handleChange = (key: keyof Profile, value: number | string | undefined) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.put('/profile/', profile)
      const res = await api.get('/profile/compute')
      setComputed(res.data)
      window.dispatchEvent(new Event('profile-updated'))
      alert('プロフィールを保存しました。')
    } catch (e) {
      console.error(e)
      alert('保存に失敗しました。入力内容を確認してください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant='h5'>プロフィール設定</Typography>
        <Chip label='健康指標の計算に使用' color='primary' variant='outlined' />
      </Box>

      <Stack spacing={2.2} sx={{ mb: 2.5 }}>
        <Alert severity='info' sx={{ borderRadius: 2 }}>
          年齢・身長・活動レベルを入力すると、BMR/TDEEと推奨摂取カロリーを自動計算できます。
        </Alert>
        {loadingProfile && <Alert severity='warning' sx={{ borderRadius: 2 }}>プロフィールを読み込み中です。</Alert>}
      </Stack>

      <Grid container spacing={2.2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>基本情報</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label='性別'
                    select
                    value={profile.sex ?? 'male'}
                    onChange={(e) => handleChange('sex', e.target.value)}
                  >
                    <MenuItem value='male'>男性</MenuItem>
                    <MenuItem value='female'>女性</MenuItem>
                    <MenuItem value='other'>その他</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth label='年齢' type='number' value={profile.age ?? ''} onChange={(e) => handleChange('age', Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth label='身長 (cm)' type='number' value={profile.height_cm ?? ''} onChange={(e) => handleChange('height_cm', Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label='活動レベル'
                    select
                    value={profile.activity_level ?? 1.55}
                    onChange={(e) => handleChange('activity_level', Number(e.target.value))}
                  >
                    <MenuItem value={1.2}>低い（1.2）</MenuItem>
                    <MenuItem value={1.375}>やや低い（1.375）</MenuItem>
                    <MenuItem value={1.55}>標準（1.55）</MenuItem>
                    <MenuItem value={1.725}>高い（1.725）</MenuItem>
                    <MenuItem value={1.9}>非常に高い（1.9）</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth label='現在の体脂肪率 (%)' type='number' value={profile.current_bodyfat_pct ?? ''} onChange={(e) => handleChange('current_bodyfat_pct', Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth label='現在の筋肉量 (kg)' type='number' value={profile.current_muscle_mass_kg ?? ''} onChange={(e) => handleChange('current_muscle_mass_kg', Number(e.target.value))} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>目標設定</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth label='目標体重 (kg)' type='number' value={profile.goal_weight_kg ?? ''} onChange={(e) => handleChange('goal_weight_kg', Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth label='目標体脂肪率 (%)' type='number' value={profile.goal_bodyfat_pct ?? ''} onChange={(e) => handleChange('goal_bodyfat_pct', Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label='目標摂取カロリー (kcal)'
                    type='number'
                    value={profile.goal_calories_kcal ?? ''}
                    onChange={(e) => handleChange('goal_calories_kcal', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label='目標増減ペース (kg/週)'
                    type='number'
                    inputProps={{ step: '0.1' }}
                    value={profile.goal_rate_kg_per_week ?? ''}
                    onChange={(e) => handleChange('goal_rate_kg_per_week', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {computed && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2.2, borderRadius: 3, background: 'linear-gradient(145deg, rgba(15,118,110,0.08) 0%, rgba(14,165,233,0.08) 100%)' }}>
              <Typography variant='h6' sx={{ mb: 1.5 }}>計算結果</Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6} md={3}><Metric title='基礎代謝量 (BMR)' value={computed.bmr} unit='kcal' color='#d97706' /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric title='消費カロリー (TDEE)' value={computed.tdee} unit='kcal' color='#0284c7' /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric title='推奨摂取カロリー' value={computed.recommended_intake} unit='kcal' color='#059669' /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric title='推奨増減ペース' value={computed.recommended_rate_kg_per_week} unit='kg/週' color='#be123c' isRate /></Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button variant='contained' size='large' onClick={handleSubmit} disabled={loading} sx={{ minWidth: 210 }}>
            {loading ? '保存中...' : 'プロフィールを保存する'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

function Metric({ title, value, unit, color, isRate = false }: { title: string; value?: number; unit: string; color: string; isRate?: boolean }) {
  const displayed = typeof value === 'number' ? (isRate ? `${value > 0 ? '+' : ''}${value.toFixed(2)}` : `${Math.round(value)}`) : '--'

  return (
    <Paper sx={{ p: 1.5, borderRadius: 2.2, textAlign: 'center', background: '#fff' }}>
      <Typography variant='body2' color='text.secondary'>{title}</Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 800, color }}>
        {displayed} <Box component='span' sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{unit}</Box>
      </Typography>
    </Paper>
  )
}
