import { describe, it, expect } from 'vitest'
import { defaultSettings } from '../../constants/sectionDefaults'

describe('Column Layout', () => {
  it('defaultSettings includes columnLayout with left and right arrays', () => {
    const settings = defaultSettings()
    expect(settings.columnLayout).toBeDefined()
    expect(settings.columnLayout.left).toEqual([])
    expect(settings.columnLayout.right).toEqual([])
  })

  it('defaultSettings columns is one', () => {
    const settings = defaultSettings()
    expect(settings.columns).toBe('one')
  })
})

describe('Column Section Logic', () => {
  // Helper function to simulate initColumnSections logic
  function initColumnSections(localSections, columnLayout) {
    const allIds = new Set(localSections.map((s) => s.id))
    const leftIds = columnLayout.left.filter((id) => allIds.has(id))
    const rightIds = columnLayout.right.filter((id) => allIds.has(id))

    // If no sections assigned yet, split by even/odd as default
    if (leftIds.length === 0 && rightIds.length === 0 && localSections.length > 0) {
      const leftSections = localSections.filter((_, i) => i % 2 === 0)
      const rightSections = localSections.filter((_, i) => i % 2 !== 0)
      return { leftSections, rightSections, wasEmpty: true }
    } else {
      const leftSections = localSections.filter((s) => leftIds.includes(s.id))
      const rightSections = localSections.filter((s) => rightIds.includes(s.id))
      return { leftSections, rightSections, wasEmpty: false }
    }
  }

  const mockSections = [
    { id: 's1', title: 'Experience', type: 'experience' },
    { id: 's2', title: 'Education', type: 'education' },
    { id: 's3', title: 'Skills', type: 'skills' },
    { id: 's4', title: 'Languages', type: 'languages' },
    { id: 's5', title: 'Certificates', type: 'certificates' },
  ]

  it('splits sections by even/odd when columnLayout is empty', () => {
    const emptyLayout = { left: [], right: [] }
    const { leftSections, rightSections, wasEmpty } = initColumnSections(mockSections, emptyLayout)

    expect(wasEmpty).toBe(true)
    expect(leftSections.map((s) => s.id)).toEqual(['s1', 's3', 's5'])
    expect(rightSections.map((s) => s.id)).toEqual(['s2', 's4'])
  })

  it('uses existing columnLayout when provided', () => {
    const existingLayout = {
      left: ['s1', 's2'],
      right: ['s3', 's4', 's5'],
    }
    const { leftSections, rightSections, wasEmpty } = initColumnSections(
      mockSections,
      existingLayout,
    )

    expect(wasEmpty).toBe(false)
    expect(leftSections.map((s) => s.id)).toEqual(['s1', 's2'])
    expect(rightSections.map((s) => s.id)).toEqual(['s3', 's4', 's5'])
  })

  it('filters out invalid section IDs from columnLayout', () => {
    const layoutWithInvalidIds = {
      left: ['s1', 'invalid-id'],
      right: ['s2'],
    }
    const { leftSections } = initColumnSections(mockSections, layoutWithInvalidIds)

    expect(leftSections.length).toBe(1)
    expect(leftSections[0].id).toBe('s1')
  })

  it('handles empty sections array', () => {
    const emptyLayout = { left: [], right: [] }
    const { leftSections, rightSections } = initColumnSections([], emptyLayout)

    expect(leftSections).toEqual([])
    expect(rightSections).toEqual([])
  })

  it('handles single section', () => {
    const singleSection = [{ id: 's1', title: 'Experience', type: 'experience' }]
    const emptyLayout = { left: [], right: [] }
    const { leftSections, rightSections } = initColumnSections(singleSection, emptyLayout)

    expect(leftSections.length).toBe(1)
    expect(rightSections.length).toBe(0)
  })
})
