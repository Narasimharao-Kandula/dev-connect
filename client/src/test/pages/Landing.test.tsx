import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import api from '../../api/client'
import Landing from '../../pages/Landing'

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockStats = {
  totalUsers: 1500,
  totalProjects: 320,
  totalCountries: 45,
  activeThisWeek: 180,
}

const mockedApi = vi.mocked(api)

describe('Landing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedApi.get.mockResolvedValue({ data: mockStats })
  })

  it('renders hero heading', async () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    )
    const heading = await screen.findByText(/Find Developers/i)
    expect(heading).toBeInTheDocument()
  })

  it('fetches stats from API', async () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/stats')
    })
  })
})
