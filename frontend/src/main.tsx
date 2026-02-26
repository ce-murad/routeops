import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
  fontFamily:
    'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  headings: {
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.06)',
    sm: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 8px 24px rgba(0,0,0,0.10)',
  },
  components: {
    Card: { defaultProps: { withBorder: true, radius: 'md', shadow: 'sm' } },
    Paper: { defaultProps: { withBorder: true, radius: 'md', shadow: 'sm' } },
    Button: { defaultProps: { radius: 'md' } },
    Badge: { defaultProps: { radius: 'md' } },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>
)