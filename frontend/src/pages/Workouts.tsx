import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'

// ...existing types and logic preserved below

type TemplateItem = {
  id?: number
  exercise_name: string
  target_sets?: number
  target_reps?: string
  target_weight_kg?: number
  order_index?: number
}

type WorkoutTemplate = {
  id: number
  name: string
  description?: string
  items?: TemplateItem[]
}

type WorkoutSet = {
  id?: number
  exercise_name: string
  set_no: number
  reps?: number
  weight_kg?: number
  note?: string
}

type WorkoutSession = {
  id: number
  date: string
  template_id?: number
  note?: string
  sets?: WorkoutSet[]
}

type TemplateDraftItem = {
  exercise_name: string
  target_sets: number
  target_reps: string
  target_weight_kg: string
}

type SessionDraftSet = {
  exercise_name: string
  set_no: number
  reps: string
  weight_kg: string
  note: string
}

const today = new Date().toISOString().slice(0, 10)

const emptyTemplateItem: TemplateDraftItem = {
  exercise_name: '',
  target_sets: 3,
  target_reps: '8-12',
  target_weight_kg: '',
}

const emptySessionSet: SessionDraftSet = {
  exercise_name: '',
  set_no: 1,
  reps: '',
  weight_kg: '',
  note: '',
}

export default function Workouts() {
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [confirmTemplateOpen, setConfirmTemplateOpen] = useState(false)

  const [templateDraft, setTemplateDraft] = useState({
    name: '',
    description: '',
    items: [{ ...emptyTemplateItem }],
  })

  const [sessionDraft, setSessionDraft] = useState({
    date: today,
    template_id: '',
    note: '',
    sets: [{ ...emptySessionSet }],
  })

  const templateNameMap = useMemo(() => {
    return new Map(templates.map((t) => [t.id, t.name]))
  }, [templates])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [tplRes, sessRes] = await Promise.all([
        api.get('/workouts/templates'),
        api.get('/workouts/sessions'),
      ])

      const baseTemplates = tplRes.data as WorkoutTemplate[]
      const enrichedTemplates = await Promise.all(
        baseTemplates.map(async (tpl) => {
          try {
            const itemsRes = await api.get(`/workouts/templates/${tpl.id}/items`)
            return { ...tpl, items: itemsRes.data || [] }
          } catch {
            return { ...tpl, items: tpl.items || [] }
          }
        }),
      )

      setTemplates(enrichedTemplates)
      setSessions(sessRes.data)
    } catch {
      setTemplates([])
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const addTemplateItem = () => {
    setTemplateDraft((prev) => ({ ...prev, items: [...prev.items, { ...emptyTemplateItem }] }))
  }

  const updateTemplateItem = (index: number, key: keyof TemplateDraftItem, value: string | number) => {
    setTemplateDraft((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [key]: value }
      return { ...prev, items }
    })
  }

  const removeTemplateItem = (index: number) => {
    setTemplateDraft((prev) => {
      const items = prev.items.filter((_, i) => i !== index)
      return { ...prev, items: items.length > 0 ? items : [{ ...emptyTemplateItem }] }
    })
  }

  const openTemplateConfirm = () => {
    if (!templateDraft.name.trim()) {
      alert('メニュー名を入力してください。')
      return
    }
    if (!templateDraft.items.some((i) => i.exercise_name.trim())) {
      alert('種目を1つ以上入力してください。')
      return
    }
    setConfirmTemplateOpen(true)
  }

  const createTemplate = async () => {
    const items = templateDraft.items
      .filter((i) => i.exercise_name.trim())
      .map((i, idx) => ({
        exercise_name: i.exercise_name.trim(),
        target_sets: Number(i.target_sets) || undefined,
        target_reps: i.target_reps || undefined,
        target_weight_kg: i.target_weight_kg === '' ? undefined : Number(i.target_weight_kg),
        order_index: idx,
      }))

    try {
      await api.post('/workouts/templates', {
        name: templateDraft.name.trim(),
        description: templateDraft.description.trim() || undefined,
        items,
      })
      setConfirmTemplateOpen(false)
      setTemplateDraft({ name: '', description: '', items: [{ ...emptyTemplateItem }] })
      await fetchAll()
    } catch (e) {
      console.error(e)
      alert('メニュー作成に失敗しました。')
    }
  }

  const deleteTemplate = async (id: number) => {
    if (!confirm('このメニューを削除しますか？')) return
    try {
      await api.delete(`/workouts/templates/${id}`)
      await fetchAll()
    } catch (e) {
      console.error(e)
      alert('メニュー削除に失敗しました。')
    }
  }

  const applyTemplateToSession = (templateId: string) => {
    const numericId = Number(templateId)
    const selected = templates.find((t) => t.id === numericId)
    if (!selected) {
      setSessionDraft((prev) => ({ ...prev, template_id: '', sets: [{ ...emptySessionSet }] }))
      return
    }

    const generatedSets: SessionDraftSet[] = []
    ;(selected.items || []).forEach((item) => {
      const setCount = item.target_sets || 1
      for (let i = 1; i <= setCount; i += 1) {
        generatedSets.push({
          exercise_name: item.exercise_name,
          set_no: i,
          reps: item.target_reps ? String(item.target_reps).replace(/[^0-9]/g, '') : '',
          weight_kg: item.target_weight_kg != null ? String(item.target_weight_kg) : '',
          note: '',
        })
      }
    })

    setSessionDraft((prev) => ({
      ...prev,
      template_id: String(numericId),
      sets: generatedSets.length > 0 ? generatedSets : [{ ...emptySessionSet }],
    }))
  }

  const addSessionSet = () => {
    setSessionDraft((prev) => {
      const nextSetNo = prev.sets.length + 1
      return { ...prev, sets: [...prev.sets, { ...emptySessionSet, set_no: nextSetNo }] }
    })
  }

  const updateSessionSet = (index: number, key: keyof SessionDraftSet, value: string | number) => {
    setSessionDraft((prev) => {
      const sets = [...prev.sets]
      sets[index] = { ...sets[index], [key]: value as never }
      return { ...prev, sets }
    })
  }

  const removeSessionSet = (index: number) => {
    setSessionDraft((prev) => {
      const sets = prev.sets.filter((_, i) => i !== index).map((s, idx) => ({ ...s, set_no: idx + 1 }))
      return { ...prev, sets: sets.length ? sets : [{ ...emptySessionSet }] }
    })
  }

  const saveSession = async () => {
    const setsPayload = sessionDraft.sets
      .filter((s) => s.exercise_name.trim())
      .map((s, idx) => ({
        exercise_name: s.exercise_name.trim(),
        set_no: idx + 1,
        reps: s.reps === '' ? undefined : Number(s.reps),
        weight_kg: s.weight_kg === '' ? undefined : Number(s.weight_kg),
        note: s.note.trim() || undefined,
      }))

    if (setsPayload.length === 0) {
      alert('種目を1つ以上入力してください。')
      return
    }

    try {
      await api.post('/workouts/sessions', {
        date: sessionDraft.date,
        template_id: sessionDraft.template_id ? Number(sessionDraft.template_id) : undefined,
        note: sessionDraft.note.trim() || undefined,
        sets: setsPayload,
      })
      window.dispatchEvent(new Event('data-updated'))
      setSessionDraft({
        date: today,
        template_id: '',
        note: '',
        sets: [{ ...emptySessionSet }],
      })
      await fetchAll()
      alert('本日のトレーニングを保存しました。')
    } catch (e) {
      console.error(e)
      alert('保存に失敗しました。')
    }
  }

  const deleteSession = async (id: number) => {
    if (!confirm('この記録を削除しますか？')) return
    try {
      await api.delete(`/workouts/sessions/${id}`)
      await fetchAll()
    } catch (e) {
      console.error(e)
      alert('削除に失敗しました。')
    }
  }

  const todaysSessions = sessions.filter((s) => s.date === today)
  const todaysVolume = todaysSessions.reduce((sum, session) => {
    return (
      sum +
      (session.sets || []).reduce((ss, set) => {
        if (set.weight_kg == null || set.reps == null) return ss
        return ss + set.weight_kg * set.reps
      }, 0)
    )
  }, 0)

  return (
    <Box>
      <Paper
        sx={{
          p: 2.4,
          mb: 2.5,
          borderRadius: 3,
          color: '#fff7ed',
          background: 'linear-gradient(130deg, #7f1d1d 0%, #dc2626 42%, #f97316 100%)',
          border: 'none',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5}>
          <Box>
            <Typography variant='h5' sx={{ color: '#fff7ed' }}>ワークアウト</Typography>
            <Typography sx={{ opacity: 0.95, fontWeight: 600 }}>メニュー作成から当日の重量入力まで、集中して積み上げる。</Typography>
          </Box>
          <Button variant='outlined' onClick={fetchAll} disabled={loading} sx={{ color: '#fff7ed', borderColor: 'rgba(255,247,237,0.5)' }}>
            最新に更新
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.2, borderRadius: 3, background: 'linear-gradient(160deg, #ffffff 0%, #fff2ea 100%)' }}>
            <Typography variant='body2' color='text.secondary'>今日のセッション数</Typography>
            <Typography sx={{ fontSize: '1.7rem', fontWeight: 900 }}>{todaysSessions.length} 件</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.2, borderRadius: 3, background: 'linear-gradient(160deg, #ffffff 0%, #fff2ea 100%)' }}>
            <Typography variant='body2' color='text.secondary'>今日の総セット数</Typography>
            <Typography sx={{ fontSize: '1.7rem', fontWeight: 900 }}>{todaysSessions.reduce((s, x) => s + (x.sets?.length || 0), 0)} セット</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.2, borderRadius: 3, background: 'linear-gradient(160deg, #ffffff 0%, #fff2ea 100%)' }}>
            <Typography variant='body2' color='text.secondary'>今日の推定総挙上重量</Typography>
            <Typography sx={{ fontSize: '1.7rem', fontWeight: 900 }}>{Math.round(todaysVolume)} kg</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, mb: 2.5, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 1.5, pt: 1 }}>
          <Tab label='メニュー作成・確認' />
          <Tab label='今日の記録入力' />
          <Tab label='履歴' />
        </Tabs>
        <Divider />

        {tab === 0 && (
          <Box sx={{ p: 2.2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>筋トレメニューを作成</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label='メニュー名' value={templateDraft.name} onChange={(e) => setTemplateDraft((p) => ({ ...p, name: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label='説明（任意）' value={templateDraft.description} onChange={(e) => setTemplateDraft((p) => ({ ...p, description: e.target.value }))} />
              </Grid>
            </Grid>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {templateDraft.items.map((item, idx) => (
                <Paper key={idx} sx={{ p: 1.5, borderRadius: 2.5, background: 'linear-gradient(145deg, #ffffff 0%, #fff6f0 100%)' }}>
                  <Grid container spacing={1.2} alignItems='center'>
                    <Grid item xs={12} sm={4} md={4}>
                      <TextField fullWidth label='種目名' value={item.exercise_name} onChange={(e) => updateTemplateItem(idx, 'exercise_name', e.target.value)} />
                    </Grid>
                    <Grid item xs={6} sm={2} md={2}>
                      <TextField fullWidth type='number' label='セット数' value={item.target_sets} onChange={(e) => updateTemplateItem(idx, 'target_sets', Number(e.target.value))} />
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                      <TextField fullWidth label='レップ目安' value={item.target_reps} onChange={(e) => updateTemplateItem(idx, 'target_reps', e.target.value)} />
                    </Grid>
                    <Grid item xs={10} sm={2} md={2}>
                      <TextField fullWidth type='number' label='目標重量(kg)' value={item.target_weight_kg} onChange={(e) => updateTemplateItem(idx, 'target_weight_kg', e.target.value)} />
                    </Grid>
                    <Grid item xs={2} sm={1} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton color='error' onClick={() => removeTemplateItem(idx)}>×</IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 2 }}>
              <Button variant='outlined' onClick={addTemplateItem}>＋ 種目を追加</Button>
              <Button variant='contained' onClick={openTemplateConfirm}>作成内容を確認</Button>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant='h6' sx={{ mb: 1.5 }}>作成済みメニュー</Typography>
            {templates.length === 0 ? (
              <Alert severity='info' sx={{ borderRadius: 2.5 }}>まだメニューがありません。</Alert>
            ) : (
              <Grid container spacing={1.8}>
                {templates.map((tpl) => (
                  <Grid item xs={12} md={6} key={tpl.id}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(160deg, #ffffff 0%, #fff3ec 100%)' }}>
                      <CardContent>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                          <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>{tpl.name}</Typography>
                          <Button size='small' color='error' variant='outlined' onClick={() => deleteTemplate(tpl.id)}>削除</Button>
                        </Stack>
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.6 }}>{tpl.description || '説明なし'}</Typography>
                        <Stack direction='row' spacing={1} sx={{ mt: 1.2, flexWrap: 'wrap' }}>
                          {(tpl.items || []).map((item, idx) => (
                            <Chip key={idx} label={`${item.exercise_name} ${item.target_sets || 1}set`} size='small' />
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 2.2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>今日の重量・レップを入力</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type='date'
                  label='日付'
                  value={sessionDraft.date}
                  onChange={(e) => setSessionDraft((p) => ({ ...p, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label='使用メニュー'
                  value={sessionDraft.template_id}
                  onChange={(e) => applyTemplateToSession(e.target.value)}
                >
                  <MenuItem value=''>選択しない（手入力）</MenuItem>
                  {templates.map((tpl) => (
                    <MenuItem key={tpl.id} value={String(tpl.id)}>{tpl.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label='セッションメモ' value={sessionDraft.note} onChange={(e) => setSessionDraft((p) => ({ ...p, note: e.target.value }))} />
              </Grid>
            </Grid>

            <Stack spacing={1.4} sx={{ mt: 2 }}>
              {sessionDraft.sets.map((set, idx) => (
                <Paper key={idx} sx={{ p: 1.5, borderRadius: 2.5, background: 'linear-gradient(145deg, #ffffff 0%, #fff7f2 100%)' }}>
                  <Grid container spacing={1.2} alignItems='center'>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label='種目名' value={set.exercise_name} onChange={(e) => updateSessionSet(idx, 'exercise_name', e.target.value)} />
                    </Grid>
                    <Grid item xs={4} sm={1.5}>
                      <TextField fullWidth type='number' label='Set' value={set.set_no} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={4} sm={1.5}>
                      <TextField fullWidth type='number' label='Reps' value={set.reps} onChange={(e) => updateSessionSet(idx, 'reps', e.target.value)} />
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <TextField fullWidth type='number' label='重量(kg)' value={set.weight_kg} onChange={(e) => updateSessionSet(idx, 'weight_kg', e.target.value)} />
                    </Grid>
                    <Grid item xs={6} sm={3.5}>
                      <TextField fullWidth label='メモ' value={set.note} onChange={(e) => updateSessionSet(idx, 'note', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={0.5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton color='error' onClick={() => removeSessionSet(idx)}>×</IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 2 }}>
              <Button variant='outlined' onClick={addSessionSet}>＋ セットを追加</Button>
              <Button variant='contained' onClick={saveSession}>今日の記録を保存</Button>
            </Stack>
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ p: 2.2 }}>
            <Typography variant='h6' sx={{ mb: 1.5 }}>トレーニング履歴</Typography>
            {sessions.length === 0 ? (
              <Alert severity='info' sx={{ borderRadius: 2.5 }}>履歴はまだありません。</Alert>
            ) : (
              <Stack spacing={1.5}>
                {sessions.map((s) => (
                  <Card key={s.id} sx={{ background: 'linear-gradient(160deg, #ffffff 0%, #fff5ef 100%)' }}>
                    <CardContent>
                      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' spacing={1.2}>
                        <Box>
                          <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>{s.date}</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            メニュー: {s.template_id ? templateNameMap.get(s.template_id) || `ID ${s.template_id}` : '手入力'}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>メモ: {s.note || 'なし'}</Typography>
                        </Box>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Chip label={`${s.sets?.length || 0} セット`} size='small' color='primary' variant='outlined' />
                          <Button size='small' color='error' variant='outlined' onClick={() => deleteSession(s.id)}>削除</Button>
                        </Stack>
                      </Stack>

                      {(s.sets || []).length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                          <Divider sx={{ mb: 1.2 }} />
                          <Grid container spacing={1}>
                            {(s.sets || []).map((set, idx) => (
                              <Grid item xs={12} md={6} key={idx}>
                                <Paper sx={{ p: 1.2, borderRadius: 2, background: '#fff9f5' }}>
                                  <Typography variant='body2' sx={{ fontWeight: 700 }}>
                                    {set.exercise_name} / {set.set_no}セット目
                                  </Typography>
                                  <Typography variant='body2' color='text.secondary'>
                                    {set.weight_kg ?? '-'}kg x {set.reps ?? '-'}回
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Paper>

      <Dialog open={confirmTemplateOpen} onClose={() => setConfirmTemplateOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ fontWeight: 800 }}>メニュー内容の確認</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 700 }}>{templateDraft.name}</Typography>
          <Typography color='text.secondary' sx={{ mb: 1.5 }}>{templateDraft.description || '説明なし'}</Typography>
          <Stack spacing={1}>
            {templateDraft.items
              .filter((i) => i.exercise_name.trim())
              .map((item, idx) => (
                <Paper key={idx} sx={{ p: 1.2, borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>{item.exercise_name}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {item.target_sets}セット / {item.target_reps || '-'}回 / 目標 {item.target_weight_kg || '-'}kg
                  </Typography>
                </Paper>
              ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmTemplateOpen(false)}>戻る</Button>
          <Button variant='contained' onClick={createTemplate}>この内容で作成</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
