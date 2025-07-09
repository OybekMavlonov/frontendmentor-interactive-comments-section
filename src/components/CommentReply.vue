<script setup lang="ts">
import {ref, inject, onMounted, nextTick} from "vue";
import type {Reply, User} from '../types';
import PopupModal from './PopupModal.vue'
import AddComment from "./AddComment.vue"

interface Props {
  reply: Reply;
  commentId: number
}

const props = defineProps<Props>();
const currentUser = inject<User>('currentUser')
const addReplyToReply = inject<(parentCommentId: number, reply: Reply) => void>('addReplyToReply');
const updateReply = inject<(parentCommentId: number, replyId: number, content: string) => void>('updateReply');

const emit = defineEmits<{
  vote: [commentId: number, type: 'up' | 'down']
  delete: [id: number];
}>();

const userReplyVote = ref<'up' | 'down' | null>(null)
const showReplyForm = ref(false)

function getUserImgUrl(userImg: string) {
  return new URL(`../assets/images/avatars/image-${userImg}.png`, import.meta.url).href
}

const handleVote = (type: 'up' | 'down') => {
  userReplyVote.value = type
  emit("vote", props.reply.id, type)
}

const showDeleteModal = ref(false)

const handleDeleteConfirm = () => {
  emit('delete', props.reply.id);
}

const handleDeleteCancel = () => {
  showDeleteModal.value = false
}

const handleReplyToReply = (reply: Reply) => {
  if (addReplyToReply) {
    addReplyToReply(props.commentId, reply)
  }
  showReplyForm.value = false
}

const editedContent = ref<string>('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isEditing = ref<boolean>(false)

editedContent.value = `@${props.reply.replyingTo} ${props.reply.content}`;

onMounted(() => {
  if (isEditing.value) {
    nextTick(() => {
      textareaRef.value?.focus();
    });
  }
});

const editReply = () => {
  let content = editedContent.value.trim();

  // Remove the @username from content if it's a reply form, since it will be displayed separately
  if (content.startsWith(`@${props.reply.replyingTo} `)) {
    content = content.replace(`@${props.reply.replyingTo} `, '').trim();
  }
  if (updateReply) {
    updateReply(props.commentId, props.reply.id, content);
  }
  isEditing.value = false
};
</script>

<template>
  <div class="my-4">
    <div class="md:flex gap-8 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div class="w-full md:order-2">
        <div class="flex items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-4">
            <img
                :src="getUserImgUrl(reply.user.username)"
                :alt="`${reply.user.username} avatar`"
                class="size-8 md:size-10 rounded-full object-cover"
            />
            <div class="flex items-center gap-3">
              <h3 class="font-semibold text-grey-800">{{ reply.user.username }}</h3>
              <span
                  v-if="currentUser && reply.user.username === currentUser.username"
                  class="bg-purple-600 text-white text-xs p-1 md:px-2 rounded"
              >you</span>
              <span class="text-sm text-grey-500">{{ reply.createdAt }}</span>
            </div>
          </div>
          <div class="hidden md:flex items-center gap-4">
            <template v-if="currentUser && reply.user.username === currentUser.username">
              <button
                  @click="showDeleteModal = true"
                  :disabled="isEditing"
                  class="text-pink-400 hover:opacity-60 disabled:opacity-60 font-bold flex items-center gap-1"
              >
                <img src="../assets/images/icon-delete.svg" alt="delete">
                Delete
              </button>
              <button
                  @click="isEditing = true"
                  :disabled="isEditing"
                  class="text-purple-600 hover:opacity-60 disabled:opacity-60 font-bold flex items-center gap-1"
              >
                <img src="../assets/images/icon-edit.svg" alt="edit">
                Edit
              </button>
            </template>
            <template v-else>
              <button
                  @click="showReplyForm = true"
                  class="flex items-center gap-2 text-purple-600 hover:opacity-60 font-bold transition-colors"
              >
                <img src="../assets/images/icon-reply.svg" alt="icon-reply">
                Reply
              </button>
            </template>
          </div>
        </div>

        <div class="mb-3 text-sm md:text-base">
          <p v-if="!isEditing" class="text-gray-700 leading-relaxed">
          <span
              v-if="reply.replyingTo"
              class="text-blue-500 font-medium"
          >
            @{{ reply.replyingTo }}
          </span>
            {{ reply.content }}
          </p>
          <div v-else>
             <textarea
                 ref="textareaRef"
                 v-model="editedContent"
                 rows="3"
                 class="w-full px-3 py-2 border border-grey-100 text-grey-800 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-transparent resize-none"
             ></textarea>
            <button
                class="hidden md:block py-2 px-4 md:px-5 bg-purple-600 text-sm md:text-base font-medium
                md:font-semibold text-uppercase text-white rounded-lg hover:opacity-40 float-right uppercase"
                @click="editReply">
              <span>Update</span>
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between md:order-1 gap-2">
        <div class="flex md:flex-col gap-2 items-center bg-grey-100 rounded-lg md:px-3 px-2 py-1 md:py-2 font-semibold">
          <button
              @click="handleVote('up')"
              class="text-purple-200 hover:text-purple-600 transition-colors px-1"
              :class="{ 'text-purple-600': userReplyVote === 'up' }"
              :disabled="userReplyVote === 'up'"
          >
            +
          </button>

          <span class="text-purple-600">{{ reply.score }}</span>

          <button
              @click="handleVote('down')"
              class="text-purple-200 hover:text-purple-600 transition-colors px-1"
              :class="{ 'text-purple-600': userReplyVote === 'down' }"
              :disabled="userReplyVote === 'down' || reply.score === 0"
          >
            -
          </button>
        </div>
        <div :class="{'hidden md:inline-block': !isEditing}">
          <button
              class="md:hidden md:block p-2 bg-purple-600 text-xs font-medium
                text-uppercase text-white rounded-lg hover:opacity-40 float-right uppercase"
              @click="editReply">
            <span>Update</span>
          </button>
        </div>
        <div class="md:hidden flex items-center gap-2 md:gap-4 text-sm" :class="{'hidden md:inline-block': isEditing}">
          <template v-if="currentUser && reply.user.username === currentUser.username">
            <button
                @click="showDeleteModal = true"
                :disabled="isEditing"
                class="text-pink-400 hover:opacity-60 disabled:opacity-60 font-semibold flex items-center gap-1"
            >
              <img src="../assets/images/icon-delete.svg" alt="delete">
              Delete
            </button>
            <button
                @click="isEditing = true"
                :disabled="isEditing"
                class="text-purple-600 hover:opacity-60 disabled:opacity-60 font-semibold flex items-center gap-1"
            >
              <img src="../assets/images/icon-edit.svg" alt="edit">
              Edit
            </button>
          </template>
          <template v-else>
            <button
                @click="showReplyForm = true"
                class="flex items-center gap-2 text-purple-600 hover:opacity-60 font-semibold transition-colors"
            >
              <img src="../assets/images/icon-reply.svg" alt="icon-reply">
              Reply
            </button>
          </template>
        </div>
      </div>
    </div>
    <PopupModal
        v-model="showDeleteModal"
        title="Delete comment"
        message="Are you sure you want to delete this comment? This will remove the comment and can't be undone."
        cancel-text="NO, CANCEL"
        confirm-text="YES, DELETE"
        confirm-type="danger"
        @confirm="handleDeleteConfirm"
        @cancel="handleDeleteCancel"
    />
    <Transition
        name="fade-slide"
        appear
    >
      <AddComment v-if="showReplyForm && currentUser" :currentUser="currentUser"
                  :replying-to="reply.user.username" :is-reply-form="true" @submit="handleReplyToReply"/>
    </Transition>
  </div>
</template>
