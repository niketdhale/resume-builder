import { describe, it, expect } from 'vitest'
import { deriveColumns } from '../utils/columnDerivation.js'

describe('deriveColumns', () => {
  const secs = [
    { id: 1, title: 'Experience', type: 'experience' },
    { id: 2, title: 'Education', type: 'education' },
    { id: 3, title: 'Skills', type: 'skills' },
    { id: 4, title: 'Languages', type: 'languages' },
  ]

  it('defaults to alternating when layout is empty', () => {
    const { left, right } = deriveColumns(secs, { left: [], right: [] }, 'two')
    expect(left.map((s) => s.id)).toEqual([1, 3])
    expect(right.map((s) => s.id)).toEqual([2, 4])
  })

  it('honors explicit layout', () => {
    const layout = { left: [1, 3], right: [2, 4] }
    const { left, right } = deriveColumns(secs, layout, 'two')
    expect(left.map((s) => s.id)).toEqual([1, 3])
    expect(right.map((s) => s.id)).toEqual([2, 4])
  })
})
