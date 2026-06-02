import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../../components/ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    screen.getByText('Click').click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows loading spinner when loading', () => {
    const { container } = render(<Button loading>Loading</Button>)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('disables button when disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  it('applies fullWidth class', () => {
    const { container } = render(<Button fullWidth>Full</Button>)
    expect(container.firstChild).toHaveClass('w-full')
  })

  it('renders as submit type', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit')
  })
})
