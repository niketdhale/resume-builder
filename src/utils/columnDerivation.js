export function deriveColumns(sections, layout, columns) {
  const isColumnMode = columns === 'two' || columns === 'mix'
  if (!isColumnMode) return { left: [], right: [] }

  const leftIds = (layout && layout.left) || []
  const rightIds = (layout && layout.right) || []
  const idSet = new Set(sections.map((s) => s.id))
  const matchedLeft = leftIds.filter((id) => idSet.has(id))
  const matchedRight = rightIds.filter((id) => idSet.has(id))

  if (matchedLeft.length === 0 && matchedRight.length === 0) {
    const left = []
    const right = []
    sections.forEach((s, idx) => (idx % 2 === 0 ? left.push(s) : right.push(s)))
    return { left, right }
  }

  const left = sections.filter((s) => matchedLeft.includes(s.id))
  const right = sections.filter((s) => matchedRight.includes(s.id))
  return { left, right }
}
