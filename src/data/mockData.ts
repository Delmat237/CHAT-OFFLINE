import { User, Conversation, Message, Attachment, UserState, Call } from "../types/chat";
const user = JSON.parse(localStorage.getItem("user") || "null");


export const fetchUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Aucun token trouvé dans le localStorage");

  const response = await fetch("/api/users/all", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }

  const data = await response.json();
  return data as User[];
};


// Mock Users
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Laminsi Yann",
    status: "online",
    role: "teacher",
    photo: "https://i.pravatar.cc/150?img=58", // African male
  },
  {
    id: "u2",
    name: "Steeven",
    status: "online",
    role: "student",
    photo: "https://static.vecteezy.com/system/resources/thumbnails/040/343/512/small_2x/ai-generated-businessman-in-suit-and-tie-posing-free-photo.jpeg", // African male
  },
  {
    id: "u3",
    name: "Pierre Antoine",
    status: "offline",
    role: "student",
    lastSeen: "2023-05-03T10:30:00",
    photo: "https://th.bing.com/th/id/OIP.L9vQedugwGWPi3SAmaS7HwHaMB?w=196&h=318&c=7&r=0&o=5&dpr=1.1&pid=1.7", // African male
  },
  {
    id: "u4",
    name: "Anna",
    status: "online",
    role: "teacher",
    photo: "https://th.bing.com/th/id/OIP._32fIIUmYkVy0WZ3dR89JwHaE7?rs=1&pid=ImgDetMain", // African female
  },
  {
    id: "u5",
    name: "The King",
    status: "offline",
    role: "staff",
    lastSeen: "2023-05-02T16:45:00",
    photo: "https://th.bing.com/th/id/OIP.iH74Gz557wkdrvHyJQJrvAHaGS?w=554&h=470&rs=1&pid=ImgDetMain", // African male
  },
  {
    id: "u6",
    name: "Steve Dimitri",
    status: "online",
    role: "student",
    photo: "https://i.pravatar.cc/150?img=49", // African male
  },
  {
    id: "u7",
    name: "Nathan",
    status: "offline",
    role: "student",
    lastSeen: "2023-05-03T09:15:00",
    photo: "https://th.bing.com/th/id/OIP.xW1u2Lkn8HHo-BFCQKE2pQAAAA?w=416&h=416&rs=1&pid=ImgDetMain", // African male
  },
  {
    id: "u8",
    name: "Rigobert",
    status: "online",
    role: "teacher",
    photo: "https://th.bing.com/th/id/OIP.fIAYbbImWyYpy-cyuzkcfgHaE8?w=290&h=193&c=7&r=0&o=5&dpr=1.1&pid=1.7", // African male
  },
];

// --- CORRECTION APPLIQUÉE ICI ---
export const currentUser: User = {
  // Si 'user' est null, on utilise un ID par défaut et on attribue un nom par défaut.
  id: user?.id || "u0",
  name: user ? `Vous (${user.name})` : "Utilisateur Déconnecté", // Utilise une ternaire pour l'affichage
  status: user?.status || "offline", // Définir 'offline' par défaut si non connecté
  role: user?.role || "student",
  photo: user?.photo || "https://placehold.co/150x150/cccccc/333333?text=?", // Photo par défaut si non connecté
};
// ---------------------------------

// Mock Attachments
const mockAttachments: Attachment[] = [
  {
    id: "a1",
    name: "Devoir_Maths.pdf",
    type: "document",
    url: "#",
    size: "2.4 MB",
  },
  {
    id: "a2",
    name: "Cours_Histoire.pdf",
    type: "document",
    url: "#",
    size: "3.7 MB",
  },
  {
    id: "a3",
    name: "Photo_Projet.jpg",
    type: "image",
    url: "#",
    size: "1.2 MB",
  },
];

// Mock Messages
const createMessages = (
  conversationId: string,
  userIds: string[],
  count: number = 10
): Message[] => {
  const messages: Message[] = [];
  const date = new Date();
  
  for (let i = count; i > 0; i--) {
    const sender = i % 2 === 0 ? "u0" : userIds[Math.floor(Math.random() * userIds.length)];
    const hourOffset = Math.floor(i / 2);
    date.setHours(date.getHours() - hourOffset);
    
    messages.push({
      id: `msg-${conversationId}-${i}`,
      content: i === 1 && sender !== "u0" 
        ? "Bonjour, pourriez-vous partager les derniers devoirs en mathématiques ?" 
        : i === 1 && sender === "u0" 
        ? "Je vous ferai parvenir le document dès que possible." 
        : sender === "u0" 
        ? `Ceci est un message envoyé pour tester l'application. Message numéro ${i}.` 
        : `Ceci est un message reçu pour tester l'application. Message numéro ${i}.`,
      senderId: sender,
      timestamp: date.toISOString(),
      status: i <= 2 && sender === "u0" ? "pending" : "sent",
      attachments: i === 2 && sender === "u0" ? [mockAttachments[0]] : undefined,
    });
  }
  
  return messages;
};

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: "c1",
    type: "group",
    name: "Classe 4A",
    participants: mockUsers.filter((u) => ["u2", "u3", "u6", "u7"].includes(u.id)),
    messages: createMessages("c1", ["u2", "u3", "u6", "u7"], 15),
    unreadCount: 3,
    avatar: "",
  },
  {
    id: "c2",
    type: "group",
    name: "Mathématiques",
    participants: mockUsers.filter((u) => ["u1", "u4", "u8"].includes(u.id)),
    messages: createMessages("c2", ["u1", "u4", "u8"], 8),
    unreadCount: 0,
    avatar: "",
  },
  {
    id: "c3",
    type: "group",
    name: "Projet Sciences",
    participants: mockUsers.filter((u) => ["u2", "u6", "u7"].includes(u.id)),
    messages: createMessages("c3", ["u2", "u6", "u7"], 12),
    unreadCount: 5,
    avatar: "",
  },
  {
    id: "c4",
    type: "private",
    name: mockUsers.find((u) => u.id === "u1")?.name || "",
    participants: [mockUsers.find((u) => u.id === "u1") as User],
    messages: createMessages("c4", ["u1"], 7),
    unreadCount: 0,
    avatar: mockUsers.find((u) => u.id === "u1")?.photo,
  },
  {
    id: "c5",
    type: "private",
    name: mockUsers.find((u) => u.id === "u2")?.name || "",
    participants: [mockUsers.find((u) => u.id === "u2") as User],
    messages: createMessages("c5", ["u2"], 5),
    unreadCount: 2,
    avatar: mockUsers.find((u) => u.id === "u2")?.photo,
  },
];

// Mock Calls
export const mockCalls: Call[] = [
  {
    id: "call1",
    conversationId: "c4",
    startTime: "2023-05-03T10:00:00",
    endTime: "2023-05-03T10:05:30",
    participants: [mockUsers.find((u) => u.id === "u1") as User, currentUser],
    status: "ended",
    initiatedBy: "u0",
  },
  {
    id: "call2",
    conversationId: "c5",
    startTime: "2023-05-03T11:15:00",
    participants: [mockUsers.find((u) => u.id === "u2") as User, currentUser],
    status: "missed",
    initiatedBy: "u2",
  }
];

// User State
export const userState: UserState = {


  
  currentUser: currentUser,
  isConnected: false,
  lastSyncTime: "2023-05-03T11:30:00",
};
