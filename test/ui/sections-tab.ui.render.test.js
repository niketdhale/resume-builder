import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, ref } from 'vue'
import SectionsTab from '../../src/components/customize/SectionsTab.vue'

// Draggable stub to render items without dragging logic
const DraggableStub = {
  name: 'Draggable',
  props: ['list', 'group', 'itemKey'],
  render() {
    const items = this.list || []
    return h(
      'div',
      { class: 'draggable-stub' },
      items.map((item) => h('div', { class: 'item', key: item.id }, item.title)),
    )
  },
}

describe('SectionsTab UI render (Draggable stubbed)', () => {
  it('renders left and right items in two-column mode', async () => {
    const sections = [
      { id: 1, title: 'Experience', type: 'experience' },
      { id: 2, title: 'Education', type: 'education' },
      { id: 3, title: 'Skills', type: 'skills' },
      { id: 4, title: 'Languages', type: 'languages' },
    ]
    const activeSections = ref(sections)
    const activeSettings = ref({ columns: 'two', columnLayout: { left: [1, 3], right: [2, 4] } })

    const wrapper = mount(SectionsTab, {
      global: {
        stubs: { Draggable: DraggableStub },
        provide: {
          activeSections: activeSections,
          activeSettings: activeSettings,
          updateSectionOrder: () => {},
          updateSetting: () => {},
        },
      },
    })
    await nextTick()

    const draggables = wrapper.findAll('.draggable-stub')
    // Two columns rendered
    expect(draggables.length).toBeGreaterThanOrEqual(2)
    const leftItems = draggables[0].findAll('.item')
    const rightItems = draggables[1].findAll('.item')
    expect(leftItems.length).toBe(2)
    expect(rightItems.length).toBe(2)
    expect(leftItems[0].text()).toContain('Experience')
  })
})
