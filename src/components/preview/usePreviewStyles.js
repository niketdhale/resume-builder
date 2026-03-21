import { computed } from 'vue'

export function usePreviewStyles(settings) {
  const s = computed(() => settings.value)

  // ─── Heading style ─────────────────────────────────────────────────────────
  const headingStyle = computed(() => {
    const borderColor = s.value.accentHeadingLine ? s.value.accentColor : s.value.borderColor
    const sizeMap = { S: '0.6rem', M: '0.7rem', L: '0.8rem', XL: '0.9rem' }
    const base = {
      textTransform: s.value.headingCapitalization === 'uppercase' ? 'uppercase' : 'capitalize',
      color: s.value.accentHeadings ? s.value.accentColor : undefined,
      letterSpacing: '0.08em',
      fontWeight: '700',
      marginBottom: '6px',
      paddingBottom: '2px',
      display: 'block',
      width: '100%',
      fontSize: sizeMap[s.value.headingSize] || '0.7rem',
    }
    switch (s.value.headingStyle) {
      case 'underline':
        return { ...base, borderBottom: `2px solid ${borderColor}` }
      case 'leftbar':
        return { ...base, borderLeft: `3px solid ${s.value.accentColor}`, paddingLeft: '6px' }
      case 'bold':
        return { ...base, fontWeight: '900' }
      case 'filled':
        return {
          ...base,
          background: s.value.accentColor,
          color: '#fff',
          padding: '2px 6px',
          borderRadius: '3px',
        }
      case 'dotted':
        return { ...base, borderBottom: `2px dotted ${borderColor}` }
      case 'wavy':
        return { ...base, textDecoration: 'underline wavy' }
      case 'centered':
        return { ...base, textAlign: 'center', borderBottom: `1px solid ${borderColor}` }
      default:
        return base
    }
  })

  // ─── Text styles ───────────────────────────────────────────────────────────
  const nameStyle = computed(() => ({
    color: s.value.accentName ? s.value.accentColor : undefined,
  }))
  const jobTitleStyle = computed(() => ({
    color: s.value.accentJobTitle ? s.value.accentColor : '#6366f1',
  }))
  const dateStyle = computed(() => ({
    color: s.value.accentDates ? s.value.accentColor : '#9ca3af',
  }))
  const subtitleStyle = computed(() => ({
    color: s.value.accentSubtitle ? s.value.accentColor : '#6b7280',
  }))
  const iconStyle = computed(() => ({
    color: s.value.accentHeaderIcons ? s.value.accentColor : undefined,
  }))

  // ─── Layout computed ───────────────────────────────────────────────────────
  const headerPos = computed(() => s.value.headerPosition || 'top')
  const headerLayout = computed(() => s.value.headerLayout || 'classic')
  const isTwoCol = computed(() => s.value.columns === 'two')
  const isMixCol = computed(() => s.value.columns === 'mix')

  // ─── Badge colors ──────────────────────────────────────────────────────────
  const levelColors = {
    Beginner: 'bg-indigo-100 text-indigo-600',
    Intermediate: 'bg-blue-100 text-blue-600',
    Advanced: 'bg-violet-100 text-violet-600',
    Expert: 'bg-purple-100 text-purple-700',
  }

  const proficiencyColors = {
    Basic: 'bg-gray-100 text-gray-500',
    Conversational: 'bg-blue-100 text-blue-600',
    Fluent: 'bg-indigo-100 text-indigo-600',
    Native: 'bg-purple-100 text-purple-700',
  }

  // ─── Date formatting ───────────────────────────────────────────────────────
  function formatMonth(val) {
    if (!val) return ''
    if (!val.includes('-')) return val
    const [y, m] = val.split('-')
    if (!m) return y
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const fmt = s.value.dateFormat
    if (fmt === 'MM/DD/YYYY') return `${m}/${y}`
    if (fmt === 'YYYY-MM-DD') return `${y}-${m}`
    return `${months[parseInt(m) - 1]} ${y}`
  }

  function formatDate(val) {
    if (!val) return ''
    return new Date(val).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // ─── Contact visibility ────────────────────────────────────────────────────
  function show(field) {
    return s.value[field] !== false
  }

  // ─── SectionContent props bundle ───────────────────────────────────────────
  const sectionContentProps = computed(() => ({
    s: s.value,
    dateStyle: dateStyle.value,
    subtitleStyle: subtitleStyle.value,
    formatMonth,
    formatDate,
    levelColors,
    proficiencyColors,
    entrySpacing: s.value.entrySpacing,
  }))

  return {
    s,
    headingStyle,
    nameStyle,
    jobTitleStyle,
    dateStyle,
    subtitleStyle,
    iconStyle,
    headerPos,
    headerLayout,
    isTwoCol,
    isMixCol,
    levelColors,
    proficiencyColors,
    formatMonth,
    formatDate,
    show,
    sectionContentProps,
  }
}
