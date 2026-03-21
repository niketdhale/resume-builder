<script setup>
import { ref, inject } from 'vue'
import { GripVertical, Pencil, Eye, EyeOff, Copy, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  entry: { type: Object, required: true },
  sectionId: { type: Number, required: true },
  sectionType: { type: String, default: 'custom' },
})

const updateEntry = inject('updateEntry')
const deleteEntry = inject('deleteEntry')
const duplicateEntry = inject('duplicateEntry')
const toggleEntryVisibility = inject('toggleEntryVisibility')

// ─── Draft state ──────────────────────────────────────────────────────────────
const draft = ref({})
const confirmDelete = ref(false)

function openEditor() {
  draft.value = { ...props.entry }
  updateEntry(props.sectionId, props.entry.id, { isEditing: true })
}

function saveEntry() {
  updateEntry(props.sectionId, props.entry.id, { ...draft.value, isEditing: false })
}

function cancelEdit() {
  updateEntry(props.sectionId, props.entry.id, { isEditing: false })
}

// ─── Preview label per type ───────────────────────────────────────────────────
function getPreviewLabel(e, type) {
  switch (type) {
    case 'experience':
      return e.role || e.company || 'New Experience'
    case 'education':
      return e.degree || e.institution || 'New Education'
    case 'skills':
      return e.skill || 'New Skill'
    case 'languages':
      return e.language || 'New Language'
    case 'certificates':
      return e.certName || 'New Certificate'
    case 'interests':
      return e.title || 'New Interest'
    case 'projects':
      return e.projectName || 'New Project'
    case 'courses':
      return e.courseName || 'New Course'
    case 'awards':
      return e.awardName || 'New Award'
    case 'organisations':
      return e.orgName || 'New Organisation'
    case 'publications':
      return e.pubTitle || 'New Publication'
    case 'references':
      return e.refName || 'New Reference'
    case 'declaration':
      return 'Declaration'
    case 'dob':
      return e.dob || 'Date of Birth'
    default:
      return e.title || 'New Entry'
  }
}

function getPreviewSub(e, type) {
  switch (type) {
    case 'experience':
      return e.company || ''
    case 'education':
      return e.institution || ''
    case 'skills':
      return e.level || ''
    case 'languages':
      return e.proficiency || ''
    case 'certificates':
      return e.issuer || ''
    case 'projects':
      return e.projectRole || ''
    case 'courses':
      return e.courseInstitution || ''
    case 'awards':
      return e.awardIssuer || ''
    case 'organisations':
      return e.orgRole || ''
    case 'publications':
      return e.publisher || ''
    case 'references':
      return e.refCompany || ''
    default:
      return e.content || ''
  }
}

// ─── Word count ───────────────────────────────────────────────────────────────
function wordCount(text) {
  if (!text) return 0
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}
</script>

<template>
  <div
    :class="[
      'rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md',
      entry.isVisible
        ? 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
        : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-50',
    ]"
  >
    <!-- Entry Header -->
    <div class="flex items-center gap-2 px-4 py-3">
      <span
        class="entry-drag-handle cursor-grab text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-400 flex-shrink-0"
      >
        <GripVertical :size="14" />
      </span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
          {{ getPreviewLabel(entry, sectionType) }}
        </p>
        <p
          v-if="getPreviewSub(entry, sectionType)"
          class="text-xs text-gray-400 dark:text-gray-500 truncate"
        >
          {{ getPreviewSub(entry, sectionType) }}
        </p>
      </div>
      <div class="flex items-center gap-1 flex-shrink-0">
        <button
          @click="openEditor"
          class="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          title="Edit"
        >
          <Pencil :size="13" />
        </button>
        <button
          @click="toggleEntryVisibility(sectionId, entry.id)"
          :class="
            entry.isVisible
              ? 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'
          "
          class="p-1 transition-colors"
          :title="entry.isVisible ? 'Hide' : 'Show'"
        >
          <Eye v-if="entry.isVisible" :size="13" />
          <EyeOff v-else :size="13" />
        </button>
        <button
          @click="duplicateEntry(sectionId, entry.id)"
          class="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          title="Duplicate"
        >
          <Copy :size="13" />
        </button>
        <button
          v-if="!confirmDelete"
          @click="confirmDelete = true"
          class="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 :size="13" />
        </button>
        <div v-else class="flex items-center gap-1">
          <button
            @click="deleteEntry(sectionId, entry.id)"
            class="text-xs px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Yes
          </button>
          <button
            @click="confirmDelete = false"
            class="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            No
          </button>
        </div>
      </div>
    </div>

    <!-- Inline Editor -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[600px]"
      leave-from-class="opacity-100 max-h-[600px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="entry.isEditing"
        class="overflow-hidden border-t border-gray-100 dark:border-gray-700 px-4 py-3 flex flex-col gap-2"
      >
        <!-- EXPERIENCE -->
        <template v-if="sectionType === 'experience'">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Role</label>
              <input v-model="draft.role" placeholder="Software Engineer" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Company</label>
              <input v-model="draft.company" placeholder="Acme Corp" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Start Date</label>
              <input v-model="draft.startDate" type="month" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">End Date</label>
              <input
                v-model="draft.endDate"
                type="month"
                :disabled="draft.currentlyWorking"
                class="input disabled:opacity-40"
              />
            </div>
          </div>
          <label
            class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer"
          >
            <input type="checkbox" v-model="draft.currentlyWorking" class="accent-indigo-600" />
            Currently working here
          </label>
          <label class="text-xs text-gray-500 dark:text-gray-400">Description</label>
          <textarea
            v-model="draft.description"
            rows="3"
            placeholder="Describe your role..."
            class="input resize-none"
          />
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ wordCount(draft.description) }} words
          </p>
        </template>

        <!-- EDUCATION -->
        <template v-else-if="sectionType === 'education'">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Degree</label>
              <input v-model="draft.degree" placeholder="B.Sc. Computer Science" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Institution</label>
              <input v-model="draft.institution" placeholder="MIT" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Start Date</label>
              <input v-model="draft.startDate" type="month" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">End Date</label>
              <input v-model="draft.endDate" type="month" class="input" />
            </div>
          </div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Honors / Focus</label>
          <input v-model="draft.honors" placeholder="Magna Cum Laude" class="input" />
        </template>

        <!-- SKILLS -->
        <template v-else-if="sectionType === 'skills'">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Skill</label>
              <input v-model="draft.skill" placeholder="Vue.js" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Level</label>
              <select v-model="draft.level" class="input">
                <option value="">Select level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Expert</option>
              </select>
            </div>
          </div>
        </template>

        <!-- LANGUAGES -->
        <template v-else-if="sectionType === 'languages'">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Language</label>
              <input v-model="draft.language" placeholder="English" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Proficiency</label>
              <select v-model="draft.proficiency" class="input">
                <option value="">Select proficiency</option>
                <option>Basic</option>
                <option>Conversational</option>
                <option>Fluent</option>
                <option>Native</option>
              </select>
            </div>
          </div>
        </template>

        <!-- CERTIFICATES -->
        <template v-else-if="sectionType === 'certificates'">
          <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400">Certificate Name</label>
              <input v-model="draft.certName" placeholder="AWS Solutions Architect" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Issuer</label>
              <input v-model="draft.issuer" placeholder="Amazon Web Services" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Date Earned</label>
              <input v-model="draft.dateEarned" type="month" class="input" />
            </div>
          </div>
        </template>

        <!-- INTERESTS -->
        <template v-else-if="sectionType === 'interests'">
          <label class="text-xs text-gray-500 dark:text-gray-400">Interest</label>
          <input v-model="draft.title" placeholder="Open Source Development" class="input" />
          <label class="text-xs text-gray-500 dark:text-gray-400">Description</label>
          <textarea
            v-model="draft.content"
            rows="2"
            placeholder="Brief description..."
            class="input resize-none"
          />
        </template>

        <!-- PROJECTS -->
        <template v-else-if="sectionType === 'projects'">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Project Name</label>
              <input v-model="draft.projectName" placeholder="Resume Builder" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Your Role</label>
              <input v-model="draft.projectRole" placeholder="Lead Developer" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Start Date</label>
              <input v-model="draft.startDate" type="month" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">End Date</label>
              <input v-model="draft.endDate" type="month" class="input" />
            </div>
          </div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Description</label>
          <textarea
            v-model="draft.description"
            rows="3"
            placeholder="Challenges, impact, technologies..."
            class="input resize-none"
          />
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ wordCount(draft.description) }} words
          </p>
        </template>

        <!-- COURSES -->
        <template v-else-if="sectionType === 'courses'">
          <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400">Course Name</label>
              <input
                v-model="draft.courseName"
                placeholder="Machine Learning Specialization"
                class="input"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Institution / Platform</label>
              <input v-model="draft.courseInstitution" placeholder="Coursera" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Date Completed</label>
              <input v-model="draft.dateCompleted" type="month" class="input" />
            </div>
          </div>
        </template>

        <!-- AWARDS -->
        <template v-else-if="sectionType === 'awards'">
          <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400">Award Name</label>
              <input v-model="draft.awardName" placeholder="Best Innovation Award" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Issuer</label>
              <input v-model="draft.awardIssuer" placeholder="TechConf 2024" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Date</label>
              <input v-model="draft.awardDate" type="month" class="input" />
            </div>
          </div>
          <label class="text-xs text-gray-500 dark:text-gray-400">Description</label>
          <textarea
            v-model="draft.description"
            rows="2"
            placeholder="What this award is for..."
            class="input resize-none"
          />
        </template>

        <!-- ORGANISATIONS -->
        <template v-else-if="sectionType === 'organisations'">
          <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400">Organisation Name</label>
              <input v-model="draft.orgName" placeholder="Open Source Foundation" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Your Role</label>
              <input v-model="draft.orgRole" placeholder="Volunteer / Member" class="input" />
            </div>
            <div></div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Start Date</label>
              <input v-model="draft.orgStart" type="month" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">End Date</label>
              <input v-model="draft.orgEnd" type="month" class="input" />
            </div>
          </div>
        </template>

        <!-- PUBLICATIONS -->
        <template v-else-if="sectionType === 'publications'">
          <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400">Title</label>
              <input v-model="draft.pubTitle" placeholder="The Future of AI" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Publisher</label>
              <input v-model="draft.publisher" placeholder="Medium / IEEE" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Date</label>
              <input v-model="draft.pubDate" type="month" class="input" />
            </div>
            <div class="col-span-2">
              <label class="text-xs text-gray-500 dark:text-gray-400">URL</label>
              <input v-model="draft.pubUrl" placeholder="https://..." class="input" />
            </div>
          </div>
        </template>

        <!-- REFERENCES -->
        <template v-else-if="sectionType === 'references'">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Full Name</label>
              <input v-model="draft.refName" placeholder="Jane Smith" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Job Title</label>
              <input v-model="draft.refJobTitle" placeholder="Engineering Manager" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Company</label>
              <input v-model="draft.refCompany" placeholder="Acme Corp" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Email</label>
              <input v-model="draft.refEmail" placeholder="jane@acme.com" class="input" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">Phone</label>
              <input v-model="draft.refPhone" placeholder="+1 234 567 890" class="input" />
            </div>
          </div>
        </template>

        <!-- DECLARATION -->
        <template v-else-if="sectionType === 'declaration'">
          <label class="text-xs text-gray-500 dark:text-gray-400">Declaration Text</label>
          <textarea
            v-model="draft.content"
            rows="3"
            placeholder="I hereby declare..."
            class="input resize-none"
          />
        </template>

        <!-- DOB -->
        <template v-else-if="sectionType === 'dob'">
          <label class="text-xs text-gray-500 dark:text-gray-400">Date of Birth</label>
          <input v-model="draft.dob" type="date" class="input" />
        </template>

        <!-- CUSTOM -->
        <template v-else>
          <label class="text-xs text-gray-500 dark:text-gray-400">Title</label>
          <input v-model="draft.title" placeholder="Entry title" class="input" />
          <label class="text-xs text-gray-500 dark:text-gray-400">Content</label>
          <textarea
            v-model="draft.content"
            rows="3"
            placeholder="Entry content..."
            class="input resize-none"
          />
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ wordCount(draft.content) }} words
          </p>
        </template>

        <!-- Additional Information (all types) -->
        <div class="mt-1 pt-3 border-t border-gray-100 dark:border-gray-700">
          <label class="text-xs text-gray-500 dark:text-gray-400">Additional Information</label>
          <textarea
            v-model="draft.information"
            rows="2"
            placeholder="Any extra details or notes..."
            class="input resize-none mb-3"
          />
          <div class="flex justify-end gap-2">
            <button
              @click="cancelEdit"
              class="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              @click="saveEntry"
              class="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.input {
  display: block;
  width: 100%;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  margin-top: 0.125rem;
  outline: none;
  background-color: #ffffff;
  color: #111827;
}
.input:focus {
  border-color: #818cf8;
}
.input:disabled {
  opacity: 0.4;
}

/* Dark mode overrides for scoped .input class */
:where(.dark, .dark *) .input {
  background-color: #1f2937; /* gray-800 */
  border-color: #374151; /* gray-700 */
  color: #f3f4f6; /* gray-100 */
}
:where(.dark, .dark *) .input:focus {
  border-color: #818cf8; /* indigo-400 */
}
:where(.dark, .dark *) .input option {
  background-color: #1f2937;
  color: #f3f4f6;
}
</style>
