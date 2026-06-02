import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GlassCard from '../../components/ui/GlassCard'

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Hello World</GlassCard>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('applies hover class when hover prop is true', () => {
    const { container } = render(<GlassCard hover>Hover</GlassCard>)
    expect(container.firstChild).toHaveClass('card-hover')
    expect(container.firstChild).toHaveClass('cursor-pointer')
  })

  it('applies custom className', () => {
    const { container } = render(<GlassCard className="custom-class">Custom</GlassCard>)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders with sm padding', () => {
    const { container } = render(<GlassCard padding="sm">Small</GlassCard>)
    expect(container.firstChild).toHaveClass('p-4')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<GlassCard onClick={onClick}>Clickable</GlassCard>)
    screen.getByText('Clickable').click()
    expect(onClick).toHaveBeenCalledOnce()
  })
})
