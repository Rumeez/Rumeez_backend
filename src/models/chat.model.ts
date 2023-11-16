import chat from "./chat.interface"
import mongoose, { Schema, Model } from 'mongoose';

const chatSchema = new Schema<chat>({
    chatName: {
        type: String,
        required: false,
        trim: true,
    },
    isGroupChat: {
        type: Boolean,
        required: true,
        default: false,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    messages: 
    {
        type: [String],
        required: false,
    }
});

const chatModel: Model<chat> = mongoose.model<chat>('Chat', chatSchema);

export default chatModel;