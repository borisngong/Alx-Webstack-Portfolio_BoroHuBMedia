const mongoose = require('mongoose');
const Chat = require('../coreModels/chat');
const ChatEntry = require('../coreModels/chatEntry');
const Member = require('../coreModels/memberSchema');
const { BDERROR } = require('../middlewares/handleErrors');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../coreUtils/_bd_responseHandlers');

class ChatController {
  /**
   *  Creates a new chat with the specified participants and the creator
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async createChat(req, res, next) {
    const { participantsId } = req.body;

    try {
      if (!req.member || !req.member._id) {
        throw new BDERROR('Authentication required. Please log in', 401);
      }

      if (!participantsId || participantsId.length < 1) {
        throw new BDERROR('Chat must have at least one participant', 400);
      }

      const creatorId = req.member._id;

      if (!participantsId.includes(creatorId.toString())) {
        participantsId.push(creatorId);
      }

      const newChat = new Chat({
        participants: participantsId,
        creator: creatorId,
      });
      // Save the chat
      const savedChat = await newChat.save();
      const chatId = savedChat._id;
      // Update the participants' chat list
      const updatePromises = participantsId.map(async (participantId) => {
        // Validate participantId format
        if (!mongoose.Types.ObjectId.isValid(participantId)) {
          throw new BDERROR(
            `Invalid participant ID format: ${participantId}`,
            400,
          );
        }

        const member = await Member.findById(participantId);
        if (!member) {
          throw new BDERROR(
            `Participant with ID ${participantId} not found`,
            404,
          );
        }
        member.chats.push(chatId);
        return member.save();
      });

      await Promise.all(updatePromises);

      return sendSuccessResponse(res, {
        message: 'Chat created successfully!',
        chat: savedChat,
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      return next ? next(error) : sendErrorResponse(res, error);
    }
  }

  /**
   *  Creates a new chat entry (message) in the specified chat
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async createChatEntry(req, res, next) {
    const { chatId } = req.params;
    const { content, replyTo } = req.body;
    const senderId = req.member._id;

    try {
      if (!senderId) {
        throw new BDERROR('Authentication required. Please log in', 401);
      }

      // Validate chatId format
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new BDERROR('Invalid chat ID format', 400);
      }
      // Check if chat exists
      const chatExists = await Chat.findById(chatId);
      if (!chatExists) {
        throw new BDERROR('Chat does not exist', 404);
      }

      if (!chatExists.participants.includes(senderId.toString())) {
        throw new BDERROR('You are not a member of this chat', 403);
      }
      // Create a new chat entry
      const newChatEntry = new ChatEntry({
        chat: chatId,
        sender: senderId,
        content,
        replyTo: replyTo || null,
      });

      await newChatEntry.save();
      // Update the chat's messages list
      chatExists.messages.push(newChatEntry._id);
      await chatExists.save();

      return sendSuccessResponse(res, {
        message: 'Chat entry (message) created successfully!',
        chatEntry: newChatEntry,
      });
    } catch (error) {
      return next ? next(error) : sendErrorResponse(res, error);
    }
  }

  /**
   *  Retrieves a chat with the specified chatId and its messages
   * @param {} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async getChat(req, res, next) {
    const { chatId } = req.params;

    try {
      // Validate chatId format
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new BDERROR('Invalid chat ID format', 400);
      }
      // Check if chat exists
      const chatExists = await Chat.findById(chatId)
        .populate('participants', 'handle')
        .populate({
          path: 'messages',
          populate: { path: 'sender', select: 'handle' },
        });

      if (!chatExists) {
        throw new BDERROR('Chat cannot be found', 404);
      }
      // Check if the member is a participant in the chat
      return sendSuccessResponse(res, {
        message: 'Chat retrieved successfully!',
        chat: chatExists,
      });
    } catch (error) {
      console.error('Error retrieving chat:', error);
      return next ? next(error) : sendErrorResponse(res, error);
    }
  }

  /**
   *  Deletes a chat with the specified chatId and its messages
   * @param {*} req  - The request object
   * @param {*} res  - The response object
   * @param {*} next  - The next middleware function
   * @returns
   */
  static async deleteChat(req, res, next) {
    const { chatId } = req.params;

    try {
      // Validate chatId format
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new BDERROR('Invalid chat ID format', 400);
      }

      if (!chatId) {
        throw new BDERROR('Chat ID is required.', 400);
      }

      // Check if chat exists
      const chatToDelete = await Chat.findById(chatId);
      if (!chatToDelete) {
        throw new BDERROR('Chat not found or already deleted', 404);
      }

      if (!req.member || !req.member._id) {
        throw new BDERROR('Authentication required. Please log in', 401);
      }

      // Check if the member is a creator of the chat
      const memberId = req.member._id;

      // Check if the member is the creator of the chat
      if (!chatToDelete.creator) {
        throw new BDERROR(
          'Chat creator not found Only chat creator can perform this Action',
          404,
        );
      }

      if (chatToDelete.creator.toString() !== memberId.toString()) {
        throw new BDERROR('You are not authorized to delete this chat', 403);
      }

      // Delete the chat
      await chatToDelete.deleteOne();

      return sendSuccessResponse(res, {
        message: 'Chat deleted successfully by creator!',
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      return next ? next(error) : sendErrorResponse(res, error);
    }
  }
}

module.exports = ChatController;
