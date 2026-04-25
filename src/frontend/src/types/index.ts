export const ChatType = {
    Direct: 0,
    Group: 1,
    Channel: 2
} as const;

export type ChatType = typeof ChatType[keyof typeof ChatType];

export const UserRole = {
    Member: 0,
    Admin: 1
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const MessageType = {
    Text: 0,
    File: 1,
    Voice: 2
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export interface UserDto {
    id: string;
    username: string;
    fullname: string;
    avatarUrl: string | null;
    role: number;
}

export interface MessageDto {
    id: string;
    chatId: string;
    senderId: string;
    senderName: string | null;
    content: string | null;
    type: MessageType;
    createdAt: string;
    isPinned: boolean;
    parentMessageId: string | null;
    fileUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
}

export interface ChatMemberDto {
    userId: string;
    username: string;
    fullname: string;
    avatarUrl: string | null;
    role: UserRole;
    joinedAt: string;
}

export interface ChatSummaryDto {
    id: string;
    title: string | null;
    type: ChatType;
    updatedAt: string;
    lastMessage: MessageDto | null;
    unreadCount: number;
}

export interface ChatDetailDto {
    id: string;
    title: string | null;
    type: ChatType;
    members: ChatMemberDto[];
}


export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    fullname: string;
    password: string;
}

export interface AuthResponse {
    user: UserDto;
    token: string;
}

export interface UpdateProfileRequest {
    fullname?: string;
    username?: string;
}

export interface AvatarResponse {
    url: string;
}