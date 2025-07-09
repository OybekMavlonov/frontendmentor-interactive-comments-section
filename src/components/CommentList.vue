<script setup lang="ts">
import {ref, watch, provide} from 'vue'
import data from "../data.json"
import type {Comment, User, Reply} from '../types'
import {STORAGE_KEYS} from "../constants"
import CommentCard from "./CommentCard.vue"
import AddComment from "./AddComment.vue"

const commentList = ref<Comment[]>(data.comments)
const currentUser = ref<User>(data.currentUser)

provide(/* key */ 'currentUser', /* value */ currentUser)
provide(/* key */ 'addReplyToReply', /* value */ addReply)
provide(/* key */ 'updateReply', /* value */ updateReply)

const saveComments = (): void => {
  saveToStorage(STORAGE_KEYS.COMMENTS, commentList.value)
}

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error)
  }
}

const loadComments = (): void => {
  const loaded = loadFromStorage(STORAGE_KEYS.COMMENTS, [])
  if (loaded.length === 0) {
    commentList.value = data.comments
    saveComments()
  } else {
    commentList.value = loaded
  }
}

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error)
    return defaultValue
  }
}

loadComments()

function addComment(comment: Comment | Reply) {
  commentList.value.push(comment as Comment)
}

function addReply(id: number, reply: Reply) {
  const commentIndex = commentList.value.findIndex(comment => comment.id === id);
  if (commentIndex === -1) return;
  commentList.value[commentIndex].replies.push(reply)
}

function updateReply(id: number, replyId: number, content: string) {
  const commentIndex = commentList.value.findIndex(comment => comment.id === id);
  if (commentIndex === -1) return;
  const replyIndex = commentList.value[commentIndex].replies.findIndex(reply => reply.id === replyId);
  if (replyIndex === -1) return;
  commentList.value[commentIndex].replies[replyIndex].content = content
}

function deleteReply(id: number, replyId: number) {
  const commentIndex = commentList.value.findIndex(comment => comment.id === id);
  if (commentIndex === -1) return;

  const replyIndex = commentList.value[commentIndex].replies.findIndex(comment => comment.id === replyId);
  if (replyIndex === -1) return;
  commentList.value[commentIndex].replies.splice(replyIndex, 1)
}

const userVote = ref<Record<number, 'up' | 'down' | null>>(
    loadFromStorage(STORAGE_KEYS.USER_VOTES, {})
)

const saveUserVotes = (): void => {
  saveToStorage(STORAGE_KEYS.USER_VOTES, userVote.value)
}

// Find comment or reply by ID
const findCommentOrReply = (id: number) => {
  // First check main comments
  const comment = commentList.value.find(c => c.id === id);
  if (comment) return {item: comment};

  // Then check replies
  for (const comment of commentList.value) {
    const reply = comment.replies.find(r => r.id === id);
    if (reply) return {item: reply};
  }
  return null;
};

// Vote handling logic
const handleVote = (commentId: number, voteType: 'up' | 'down'): void => {
  const result = findCommentOrReply(commentId);
  if (!result) return;

  const {item} = result;
  const previousVote = userVote.value[commentId] || null;

  // If user clicks the same vote type, do nothing (no toggle)
  if (previousVote === voteType) {
    return;
  }

  // Calculate score adjustment
  if (item.score === 0 && voteType === 'up') {

  }

  let adjustment = 0
  if (!previousVote || item.score === 0) {
    if (voteType === 'up') {
      adjustment = 1;
    } else if (voteType === 'down') {
      // faqat score > 0 bo‘lsa -1 qilamiz
      adjustment = item.score > 0 ? -1 : 0;
    }
  } else if (previousVote === 'up' && voteType === 'down') {
    // faqat score >= 2 bo‘lsa -2 qilamiz
    adjustment = item.score >= 2 ? -2 : -item.score; // yoki 0gacha kamaytir
  } else if (previousVote === 'down' && voteType === 'up') {
    adjustment = 2;
  }

  // Apply the vote
  item.score += adjustment;

  userVote.value[commentId] = voteType;
  saveUserVotes();
};


watch(commentList, saveComments, {deep: true})
</script>

<template>
  <div class="container mx-auto px-10 py-20 md:max-w-3xl">
    <div v-for="comment in commentList" :key="comment.id">
      <CommentCard :comment="comment" :currentUser="currentUser" @vote="handleVote"
                   @add-reply="addReply" @delete="deleteReply"/>
    </div>
    <AddComment :currentUser="currentUser" @submit="addComment"/>
  </div>
</template>

<style scoped>

</style>
