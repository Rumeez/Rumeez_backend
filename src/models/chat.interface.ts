import User from "./user.interface"

interface chat {
    chatName?: string;
    isGroupChat: boolean;
    users: User[];
    messages: string[][];
}

export default chat;
