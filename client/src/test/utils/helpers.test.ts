import { describe, it, expect } from 'vitest'
import { formatRelativeTime, getAvailabilityColor, getStatusColor } from '../../utils/helpers'

describe('formatRelativeTime', () => {
  it('returns "just now" for recent dates', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now')
  })

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago')
  })

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago')
  })

  it('returns days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago')
  })
})

describe('getAvailabilityColor', () => {
  it('returns emerald for Available', () => {
    expect(getAvailabilityColor('Available')).toBe('text-emerald-500')
  })

  it('returns red for Busy', () => {
    expect(getAvailabilityColor('Busy')).toBe('text-red-500')
  })

  it('returns amber for LookingForTeam', () => {
    expect(getAvailabilityColor('LookingForTeam')).toBe('text-amber-500')
  })

  it('returns gray-400 for unknown status', () => {
    expect(getAvailabilityColor('Unknown')).toBe('text-gray-400')
  })
})

describe('getStatusColor', () => {
  it('returns amber for Planning', () => {
    const result = getStatusColor('Planning')
    expect(result).toContain('bg-amber-50')
    expect(result).toContain('text-amber-600')
  })

  it('returns blue for InProgress', () => {
    const result = getStatusColor('InProgress')
    expect(result).toContain('bg-blue-50')
    expect(result).toContain('text-blue-600')
  })

  it('returns emerald for Completed', () => {
    const result = getStatusColor('Completed')
    expect(result).toContain('bg-emerald-50')
    expect(result).toContain('text-emerald-600')
  })

  it('returns gray for Archived', () => {
    const result = getStatusColor('Archived')
    expect(result).toContain('bg-gray-100')
    expect(result).toContain('text-gray-500')
  })
})
