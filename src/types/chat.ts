
export interface User {
  id: string;
  name: string;
  photo?: string;
  status: "online" | "offline";
  role: "student" | "teacher" | "staff";
  lastSeen?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  status: "sent" | "pending" | "failed";
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "other";
  url: string;
  size?: string;
}

export interface Conversation {
  id: string;
  type: "user" | "group";
  name: string;
  participants: User[];
  messages: Message[];
  unreadCount?: number;
  lastMessage?: Message;
  avatar?: string;
}

export interface UserState {
  currentUser: User;
  isConnected: boolean;
  lastSyncTime?: string;
}

export interface Call {
  id: string;
  conversationId: string;
  startTime: string;
  endTime?: string;
  participants: User[];
  status: "ongoing" | "ended" | "missed";
  initiatedBy: string;
}
