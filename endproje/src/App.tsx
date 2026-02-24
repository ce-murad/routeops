/**
 * RouteOps – Vehicle Routing Optimizer.
 * Root: MantineProvider, Notifications, React Router.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { Toasts } from '@/components/Toasts'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'
import '@/styles/global.css'

const theme = createTheme({
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  primaryColor: 'blue',
  defaultRadius: 'md',
  components: {
    Paper: {
      defaultProps: {
        withBorder: true,
        shadow: 'xs',
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
        shadow: 'xs',
        radius: 'md',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
    },
  },
})

export default function App() {
  return (
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <Notifications />
      <Toasts />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
}
