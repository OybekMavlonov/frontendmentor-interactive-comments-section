// types.ts
export interface UserImage {
    png: string
    webp: string
}

export interface User {
    image: UserImage
    username: string
}

export interface BaseComment {
    id: number
    content: string
    createdAt: string
    score: number
    user: User
}

export interface Reply extends BaseComment {
    replyingTo?: string
}

export interface Comment extends BaseComment {
    replies: Reply[]
}
