<script setup lang="ts">
import {ref, onMounted, nextTick, computed} from 'vue'
import type {Comment, Reply, User} from '../types'

interface Props {
  currentUser: User,
  isReplyForm?: boolean
  replyingTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  isReplyForm: false,
  replyingTo: ''
});

const emit = defineEmits<{
  (e: 'submit', comment: Comment | Reply): void
  (e: 'close'): void
}>()

function getUserImgUrl(username: string) {
  return new URL(`../assets/images/avatars/image-${username}.png`, import.meta.url).href
}

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const newComment = ref<string>('');

onMounted(() => {
  if (props.isReplyForm) {
    newComment.value = `@${props.replyingTo} `;

    nextTick(() => {
      textareaRef.value?.focus();
    });
  }
});
const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

const sendComment = () => {
  let content = newComment.value?.trim();
  // Remove the @username from content if it's a reply form, since it will be displayed separately
  if (props.isReplyForm && content.startsWith(`@${props.replyingTo}`)) {
    content = content.replace(`@${props.replyingTo}`, '').trim();
  }

  if (!content) return;
  const base = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    content: content,
    createdAt: formatTimeAgo(new Date()),
    score: 0,
    user: {
      image: {
        png: `../assets/images/avatars/image-${props.currentUser.username}.png`,
        webp: `../assets/images/avatars/image-${props.currentUser.username}.webp`
      },
      username: props.currentUser.username
    }
  };

  if (props.isReplyForm) {
    const reply: Reply = {
      ...base,
      replyingTo: props.replyingTo
    };
    emit('submit', reply);
  } else {
    const comment: Comment = {
      ...base,
      replies: []
    };
    emit('submit', comment);
  }

  newComment.value = "";
}

// Computed property to check if content is valid
const isContentValid = computed(() => {
  if (!newComment.value) return false;

  let content = newComment.value.trim();

  // Remove the @username from content if it's a reply form
  if (props.isReplyForm && props.replyingTo && content.startsWith(`@${props.replyingTo}`)) {
    content = content.replace(`@${props.replyingTo}`, '').trim();
  }

  return content.length > 0;
});

const isRotating = ref(false);

const closeReplyForm = () => {
  isRotating.value = true;

  setTimeout(() => {
    isRotating.value = false;
    emit('close'); // or whatever closes the form
  }, 100); // match duration with animation
};
</script>

<template>
  <div class="relative md:flex items-start gap-x-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 my-2">
    <button
        v-if="isReplyForm"
        @click="closeReplyForm"
        class="absolute top-2 right-2 text-grey-500 hover:text-grey-800 hover:bg-grey-100 rounded-full p-1 transition-colors"
        aria-label="Close reply form"
    >
      <svg
          class="w-5 h-5 transition-transform duration-100"
          :class="{ 'rotate-180': isRotating }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <textarea
        ref="textareaRef"
        v-model="newComment"
        :placeholder="isReplyForm ? 'Reply' : 'Add a comment...'"
        rows="3"
        class="md:hidden w-full px-3 py-2 border border-grey-100 text-grey-800 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-transparent resize-none"
    ></textarea>
    <div class="flex items-center justify-between gap-x-4 w-full">
      <img
          :src="getUserImgUrl(currentUser.username)"
          :alt="`${currentUser.username} avatar`"
          class="size-8 md:size-10 rounded-full object-cover"
      />
      <textarea
          ref="textareaRef"
          v-model="newComment"
          :placeholder="isReplyForm ? 'Reply' : 'Add a comment...'"
          rows="3"
          class="hidden md:block w-full px-3 py-2 border border-grey-100 text-grey-800 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-transparent resize-none"
      ></textarea>
      <button
          class="p-2 md:px-5 bg-purple-600 text-xs md:text-base font-medium md:font-semibold text-uppercase text-white rounded-lg hover:opacity-40 disabled:opacity-40 uppercase"
          :disabled="!isContentValid"
          @click="sendComment">
        <span v-if="isReplyForm">Reply</span>
        <span v-else>Send</span>
      </button>
    </div>

  </div>
</template>
