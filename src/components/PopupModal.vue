<script setup lang="ts">
import {computed} from 'vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  cancelText?: string
  confirmText?: string
  confirmType?: 'primary' | 'danger'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  confirmType: 'primary'
})

const emit = defineEmits<Emits>()

const confirmButtonClass = computed(() => {
  return props.confirmType === 'danger'
      ? 'bg-pink-400 hover:opacity-70 text-white'
      : 'bg-purple-600 hover:opacity-70 text-white'
})

const closeModal = () => {
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  closeModal()
}

const handleConfirm = () => {
  emit('confirm')
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
          v-if="modelValue"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
          @click="closeModal"
      >
        <div
            class="bg-white rounded-lg p-6 w-full max-w-sm mx-4 transform transition-all"
            @click.stop
        >
          <h2 class="text-lg md:text-xl font-semibold mb-4 text-grey-800">{{ title }}</h2>
          <p class="text-sm md:text-base text-grey-500 mb-6">{{ message }}</p>

          <div class="grid grid-cols-2 space-x-3 text-xs md:text-base">
            <button
                @click="handleCancel"
                class="bg-grey-500 hover:opacity-70 text-white px-3 md:px-6 py-2 rounded-lg transition-colors font-medium"
            >
              {{ cancelText }}
            </button>
            <button
                @click="handleConfirm"
                :class="confirmButtonClass"
                class="px-3 md:px-6 py-2 rounded-lg transition-colors font-medium"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal Backdrop Transitions */
.modal-backdrop-enter-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

/* Modal Content Transitions */
.modal-content-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>