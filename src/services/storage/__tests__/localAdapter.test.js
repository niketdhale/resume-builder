import { describe, it, expect, beforeEach } from 'vitest'
import { localAdapter } from '../localAdapter'

describe('localAdapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads data correctly', async () => {
    const data = { name: 'Test Resume', id: 1 }
    await localAdapter.save('test_key', data)
    const loaded = await localAdapter.load('test_key')
    expect(loaded).toEqual(data)
  })

  it('returns null for missing key', async () => {
    const result = await localAdapter.load('nonexistent_key')
    expect(result).toBeNull()
  })

  it('deletes data correctly', async () => {
    await localAdapter.save('delete_key', { test: true })
    await localAdapter.delete('delete_key')
    const result = await localAdapter.load('delete_key')
    expect(result).toBeNull()
  })

  it('lists keys with prefix', async () => {
    await localAdapter.save('resumes', [])
    await localAdapter.save('sections', [])
    const keys = await localAdapter.list('')
    expect(keys).toContain('resumes')
    expect(keys).toContain('sections')
  })

  it('overwrites existing data on save', async () => {
    await localAdapter.save('overwrite_key', { v: 1 })
    await localAdapter.save('overwrite_key', { v: 2 })
    const result = await localAdapter.load('overwrite_key')
    expect(result.v).toBe(2)
  })
})
