import { describe, it, expect, beforeEach } from 'vitest'
import { addResume, deleteResume, renameResume } from '../useResumeActions'
import { resumes, activeResumeId } from '../useResumeState'

describe('useResumeActions', () => {
  beforeEach(() => {
    // Reset to single default resume before each test
    resumes.value = [
      {
        id: 1,
        title: 'Test Resume',
        pageSize: 'A4',
        settings: {},
        metadata: { fullName: '', jobTitle: '' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    activeResumeId.value = 1
  })

  it('adds a new resume', () => {
    const countBefore = resumes.value.length
    addResume()
    expect(resumes.value.length).toBe(countBefore + 1)
  })

  it('sets active resume to new resume on add', () => {
    addResume()
    const newResume = resumes.value[resumes.value.length - 1]
    expect(activeResumeId.value).toBe(newResume.id)
  })

  it('renames a resume', () => {
    renameResume(1, 'Updated Title')
    expect(resumes.value[0].title).toBe('Updated Title')
  })

  it('does not rename with empty string', () => {
    renameResume(1, '')
    expect(resumes.value[0].title).toBe('Test Resume')
  })

  it('cannot delete last resume', () => {
    deleteResume(1)
    expect(resumes.value.length).toBe(1)
  })

  it('deletes a resume when more than one exists', () => {
    addResume()
    const idToDelete = resumes.value[0].id
    deleteResume(idToDelete)
    expect(resumes.value.find((r) => r.id === idToDelete)).toBeUndefined()
  })

  it('switches active resume after deletion', () => {
    addResume()
    const firstId = resumes.value[0].id
    deleteResume(firstId)
    expect(activeResumeId.value).not.toBe(firstId)
  })
})
