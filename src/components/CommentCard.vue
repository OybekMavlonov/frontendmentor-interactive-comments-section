<script setup lang="ts">
import {ref, toRefs} from 'vue'
import type {Comment, User} from '../types'
import CommentReply from './CommentReply.vue';
import AddComment from "./AddComment.vue"
import type {Reply} from "../types";

interface Props {
  comment: Comment
  currentUser: User
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  vote: [commentId: number, type: 'up' | 'down']
  addReply: [commentId: number, reply: Reply]
  edit: [commentId: number, content: string]
  delete: [commentId: number, replyId: number]
}>()


// Reactive state
const userVote = ref<'up' | 'down' | null>(null)
const {score, content, user, createdAt} = toRefs(props.comment)
const showReplyForm = ref(false)

function getUserImgUrl(userImg: string) {
  return new URL(`../assets/images/avatars/image-${userImg}.png`, import.meta.url).href
}

const handleVote = (type: 'up' | 'down') => {
  userVote.value = type
  emit("vote", props.comment.id, type)
}

const handleReplyVote = (id: number, voteType: 'up' | 'down') => {
  emit("vote", id, voteType)
}

function addReply(reply: Reply) {
  emit("addReply", props.comment.id, reply)
  showReplyForm.value = false
}

const handleReplyDelete = (replyId: number) => {
  emit("delete", props.comment.id, replyId)
}
</script>

<template>
  <div class="mb-6">
    <div class="md:flex gap-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div class="w-full md:order-2">
        <!-- Comment Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <!-- User Avatar -->
            <img
                :src="getUserImgUrl(user.username)"
                :alt="`${user.username} avatar`"
                class="size-8 md:size-10 rounded-full object-cover"
            />

            <!-- User Info -->
            <div class="flex items-center gap-3">
              <h3 class="font-semibold text-grey-800">{{ user.username }}</h3>
              <span class="text-sm text-grey-500">{{ createdAt }}</span>
            </div>
          </div>
          <!-- Comment Actions -->
          <button
              @click="showReplyForm = true"
              class="hidden md:flex items-center gap-2 text-purple-600 hover:opacity-60 font-bold transition-colors"
          >
            <img src="../assets/images/icon-reply.svg" alt="icon-reply">
            Reply
          </button>
        </div>

        <!-- Comment Content -->
        <div class="mb-4">
          <p class="text-sm md:text-base text-grey-500 leading-relaxed">{{ content }}</p>
        </div>
      </div>
      <div class="flex items-center justify-between md:order-1 gap-2">
        <div class="flex md:flex-col gap-2 items-center bg-grey-100 rounded-lg md:px-3 px-2 py-1 md:py-2 font-semibold">
          <button
              @click="handleVote('up')"
              class="text-purple-200 hover:text-purple-600 transition-colors px-1"
              :class="{ 'text-purple-600': userVote === 'up' }"
              :disabled="userVote === 'up'"
          >
            +
          </button>

          <span class="text-purple-600">{{ score }}</span>

          <button
              @click="handleVote('down')"
              class="text-purple-200 hover:text-purple-600 transition-colors px-1"
              :class="{ 'text-purple-600': userVote === 'down' }"
              :disabled="userVote === 'down' || score === 0"
          >
            -
          </button>
        </div>
        <button
            @click="showReplyForm = true"
            class="md:hidden flex items-center gap-2 text-purple-600 hover:opacity-60 font-semibold text-sm transition-colors"
        >
          <img src="../assets/images/icon-reply.svg" alt="icon-reply">
          Reply
        </button>
      </div>
    </div>
    <div v-if="comment.replies && comment.replies.length > 0"
         class="mt-4 ml-4 md:ml-8 pl-4 md:pl-6  border-l-2 border-grey-200">
      <CommentReply
          v-for="reply in comment.replies"
          :key="reply.id"
          :reply="reply"
          :comment-id="comment.id"
          @vote="handleReplyVote"
          @delete="handleReplyDelete"
      />
    </div>
    <Transition
        name="fade-slide"
        appear
    >
      <AddComment v-if="showReplyForm && currentUser" :currentUser="currentUser"
                  :replying-to="user.username" :is-reply-form="true" @submit="addReply"/>
    </Transition>
  </div>
</template>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

