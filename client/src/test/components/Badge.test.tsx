import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Badge from '../../components/ui/Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies primary variant', () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>)
    expect(container.firstChild).toHaveClass('bg-primary/10')
    expect(container.firstChild).toHaveClass('text-primary')
  })

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    expect(container.firstChild).toHaveClass('text-emerald-600')
  })

  it('applies sm size', () => {
    const { container } = render(<Badge size="sm">Small</Badge>)
    expect(container.firstChild).toHaveClass('text-[10px]')
  })

  it('applies md size by default', () => {
    const { container } = render(<Badge>Medium</Badge>)
    expect(container.firstChild).toHaveClass('text-xs')
  })
})
