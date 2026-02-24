import React from 'react'
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  ThemeProvider,
  CssBaseline,
  Paper,
  GlobalStyles,
  Chip,
} from '@mui/material'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Setup from './pages/Setup'
import BodyLogs from './pages/BodyLogs'
import Meals from './pages/Meals'
import Workouts from './pages/Workouts'
import Settings from './pages/Settings'
import theme from './theme'

const tabs = [
  { path: '/', label: 'ダッシュボード' },
  { path: '/setup', label: 'プロフィール' },
  { path: '/log/body', label: '身体ログ' },
  { path: '/log/meals', label: '食事ログ' },
  { path: '/log/workout', label: 'ワークアウト' },
  { path: '/settings', label: '設定' },
]

const TabNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const getTabIndex = () => {
    const idx = tabs.findIndex((t) => t.path === location.pathname)
    return idx >= 0 ? idx : 0
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(tabs[newValue].path)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky',
        top: 64,
        zIndex: 10,
        mx: { xs: 1.2, md: 2 },
        mt: 1.2,
        borderRadius: 2.2,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255,255,255,0.86)',
      }}
    >
      <Tabs
        value={getTabIndex()}
        onChange={handleTabChange}
        variant='scrollable'
        scrollButtons='auto'
        sx={{
          px: 1,
          minHeight: 54,
          '& .MuiTab-root': {
            minHeight: 42,
            my: 0.8,
            px: 2,
            fontWeight: 800,
            borderRadius: 2,
            zIndex: 1,
          },
        }}
      >
        {tabs.map((item) => (
          <Tab key={item.path} label={item.label} />
        ))}
      </Tabs>
    </Paper>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '*': { boxSizing: 'border-box' },
          '#root': { minHeight: '100vh' },
        }}
      />
      <BrowserRouter>
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
          <AppBar
            position='sticky'
            sx={{
              background:
                'linear-gradient(120deg, rgba(127,29,29,0.97) 0%, rgba(220,38,38,0.94) 55%, rgba(249,115,22,0.9) 100%)',
              boxShadow: '0 12px 28px rgba(127, 29, 29, 0.35)',
            }}
          >
            <Toolbar sx={{ minHeight: { xs: 68, sm: 76 }, display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6' sx={{ color: '#fff7ed', lineHeight: 1 }}>
                  BUILD MODE
                </Typography>
                <Typography sx={{ color: 'rgba(255,247,237,0.95)', fontSize: '0.85rem', fontWeight: 700 }}>
                  積み上げて、強くなる。
                </Typography>
              </Box>
              <Chip
                label='本気トレーニング管理'
                sx={{
                  color: '#fff7ed',
                  fontWeight: 800,
                  border: '1px solid rgba(255,247,237,0.45)',
                  backgroundColor: 'rgba(255,247,237,0.12)',
                }}
              />
            </Toolbar>
          </AppBar>

          <TabNavigation />

          <Container maxWidth='lg' sx={{ py: { xs: 2.2, md: 3.2 } }}>
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/setup' element={<Setup />} />
              <Route path='/log/body' element={<BodyLogs />} />
              <Route path='/log/meals' element={<Meals />} />
              <Route path='/log/workout' element={<Workouts />} />
              <Route path='/settings' element={<Settings />} />
            </Routes>
          </Container>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}
