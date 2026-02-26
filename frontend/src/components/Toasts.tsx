/**
 * Toast notifications wrapper – uses Mantine Notifications.
 * Rendered once in App; use notifications API from hooks.
 */
import { Notifications } from '@mantine/notifications'

export function Toasts() {
  return <Notifications position="top-right" zIndex={2000} />
}
