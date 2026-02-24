import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import {
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Skeleton,
  Stack,
  Chip,
} from '@mui/material'
import WeightChart from '../components/WeightChart'
import NutritionChart from '../components/NutritionChart'

type Summary = {
  recommended_intake?: number
  tdee?: number
  avg_intake_7d?: number
  avg_protein_7d?: number
  weight_series?: Array<{ date: string; value: number }>
  bodyfat_series?: Array<{ date: string; value: number }>
  intake_series?: Array<{ date: string; value: number }>
  protein_series?: Array<{ date: string; value: number }>
  recommendation_text?: string
}

export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/dashboard/summary')
      setData(r.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const handler = () => fetchData()
    window.addEventListener('profile-updated', handler)
    window.addEventListener('data-updated', handler)
    const id = setInterval(fetchData, 30 * 1000)
    return () => {
      clearInterval(id)
      window.removeEventListener('profile-updated', handler)
      window.removeEventListener('data-updated', handler)
    }
  }, [fetchData])

  const StatCard = ({ title, value, unit, icon, color }: { title: string; value?: number; unit: string; icon: string; color: string }) => (
    <Card
      sx={{
        background: 'linear-gradient(160deg, #fff 0%, #fff4ec 100%)',
        border: '1px solid rgba(220, 38, 38, 0.16)',
        height: '100%',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box>
            <Typography color='text.secondary' gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
              {title}
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 800, color }}>
              {typeof value === 'number' ? Math.round(value) : '--'}
              <Typography component='span' sx={{ fontSize: '0.72rem', ml: 0.5, color: 'text.secondary' }}>
                {unit}
              </Typography>
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '1.6rem' }}>{icon}</Typography>
        </Box>
      </CardContent>
    </Card>
  )

  const hasSeriesData = Boolean(data?.weight_series?.length || data?.intake_series?.length)

  return (
    <>
      <Paper
        sx={{
          p: 2.4,
          mb: 2.5,
          borderRadius: 3,
          background: 'linear-gradient(130deg, rgba(127,29,29,0.95) 0%, rgba(220,38,38,0.92) 45%, rgba(249,115,22,0.88) 100%)',
          color: '#fff7ed',
          border: 'none',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5}>
          <Box>
            <Typography variant='h5' sx={{ color: '#fff7ed' }}>ダッシュボード</Typography>
            <Typography sx={{ opacity: 0.95, fontWeight: 600 }}>今日の積み上げを可視化して、次の一手を決める。</Typography>
          </Box>
          <Stack direction='row' spacing={1}>
            <Chip label='継続は力' sx={{ color: '#fff7ed', border: '1px solid rgba(255,247,237,0.4)' }} variant='outlined' />
            <Button variant='outlined' onClick={fetchData} disabled={loading} sx={{ color: '#fff7ed', borderColor: 'rgba(255,247,237,0.5)' }}>
              更新
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant='rounded' height={110} />
          <Skeleton variant='rounded' height={280} />
          <Skeleton variant='rounded' height={180} />
        </Stack>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title='推奨摂取カロリー' value={data?.recommended_intake} unit='kcal' icon='🔥' color='#b91c1c' />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title='TDEE' value={data?.tdee} unit='kcal' icon='⚡' color='#ea580c' />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title='7日平均カロリー' value={data?.avg_intake_7d} unit='kcal/日' icon='🍽️' color='#9a3412' />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title='7日平均タンパク質' value={data?.avg_protein_7d} unit='g/日' icon='🥩' color='#be123c' />
            </Grid>
          </Grid>

          {!hasSeriesData ? (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant='h6' sx={{ mb: 1 }}>まだ推移データがありません</Typography>
              <Typography color='text.secondary'>身体ログと食事ログを追加すると、推移グラフとおすすめが表示されます。</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    身体の推移
                  </Typography>
                  <WeightChart
                    weightData={(data?.weight_series || []).map((d) => ({ date: d.date, value: d.value }))}
                    bodyfatData={(data?.bodyfat_series || []).map((d) => ({ date: d.date, value: d.value }))}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    栄養の推移
                  </Typography>
                  <NutritionChart
                    calorieData={(data?.intake_series || []).map((d) => ({ date: d.date, calories: d.value }))}
                    proteinData={(data?.protein_series || []).map((d) => ({ date: d.date, protein: d.value }))}
                    tdee={data?.tdee}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, rgba(249,115,22,0.1) 100%)',
                  }}
                >
                  <Typography variant='h6' gutterBottom>
                    アドバイス
                  </Typography>
                  <Typography sx={{ fontSize: '0.97rem', lineHeight: 1.8 }}>
                    {data?.recommendation_text || 'プロフィールを設定して、日々の記録を追加すると個別アドバイスが表示されます。'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </>
  )
}
