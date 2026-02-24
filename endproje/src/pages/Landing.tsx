/**
 * Landing page: hero, description, CTA to /app.
 */
import { Link } from 'react-router-dom'
import { Container, Title, Text, Button, Box } from '@mantine/core'
import { IconRoute } from '@tabler/icons-react'

export function Landing() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      }}
    >
      <Container size="sm">
        <Box ta="center" py="xl">
          <Box style={{ display: 'inline-flex', marginBottom: 16 }}>
            <IconRoute size={48} stroke={1.5} color="#228be6" />
          </Box>
          <Title order={1} size="2.5rem" mb="md">
            Vehicle Routing Optimizer
          </Title>
          <Text size="lg" c="dimmed" maw={480} mx="auto" mb="xl">
            Upload stops, set vehicle capacity, solve routes, and visualize on a map.
          </Text>
          <Button
            component={Link}
            to="/app"
            size="lg"
            variant="filled"
          >
            Start Optimizing
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
