import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

/**
 * Single source of truth for theme + providers.
 * App.tsx previously duplicated MantineProvider/Notifications — removed there,
 * merged its theme config (primaryColor: blue, Button size: sm) in here.
 */
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  headings: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.06)',
    sm: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 8px 24px rgba(0,0,0,0.10)',
  },
  components: {
    Card: { defaultProps: { withBorder: true, radius: 'md', shadow: 'xs' } },
    Paper: { defaultProps: { withBorder: true, radius: 'md', shadow: 'xs' } },
    Button: { defaultProps: { radius: 'md', size: 'sm' } },
    Badge: { defaultProps: { radius: 'md' } },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>
)