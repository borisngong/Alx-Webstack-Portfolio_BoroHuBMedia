const Chat = require("../coreModels/chat");
const ChatEntry = require("../coreModels/chatEntry");
const Member = require("../coreModels/memberSchema");
const { BDERROR } = require("../middlewares/handleErrors");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../coreUtils/_bd_responseHandlers");

class ChatController {
  /**
   * Responsible for creating a new chat
   * @param {*} req  The request object
   * @param {*} res  The response object
   * @returns  {Promise<void>}
   */
  static async createChat(req, res) {
    const { participantsId } = req.body;

    try {
      // Ensure the user is authenticated
      if (!req.member || !req.member._id) {
        throw new BDERROR("Authentication required. Please log in", 401);
      }

      if (!participantsId || participantsId.length < 1) {
        throw new BDERROR("Chat must have at least one participant", 400);
      }

      const creatorId = req.member._id;

      // Automatically add Creator to participants list
      if (!participantsId.includes(creatorId.toString())) {
        participantsId.push(creatorId);
      }

      const newChat = new Chat({
        participants: participantsId,
        creator: creatorId,
      });

      const savedChat = await newChat.save();
      const chatId = savedChat._id;

      // Prepare to update each participant's chat list
      const updatePromises = participantsId.map(async (participantId) => {
        const member = await Member.findById(participantId);
        if (!member) {
          throw new BDERROR(
            `Participant with ID ${participantId} not found`,
            404
          );
        }
        member.chats.push(chatId);
        return member.save();
      });

      // Await all update promises to complete
      await Promise.all(updatePromises);

      return sendSuccessResponse(res, {
        message: "Chat created successfully!",
        chat: savedChat,
      });
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  /**
   * Responsible for creating a new chat entry (message)
   * @param {*} req The request object
   * @param {*} res The response object
   * @returns {Promise<void>}
   */
  static async createChatEntry(req, res) {
    const { chatId } = req.params;
    const { content, replyTo } = req.body;
    const senderId = req.member._id;

    try {
      // Check if the chat exists
      const chatExists = await Chat.findById(chatId);
      if (!chatExists) {
        throw new BDERROR("Chat does not exist", 404);
      }

      // Check if the sender is a member of the chat
      if (!chatExists.participants.includes(senderId.toString())) {
        throw new BDERROR("You are not a member of this chat", 403);
      }

      // Create a new chat entry
      const newChatEntry = new ChatEntry({
        chat: chatId,
        sender: senderId,
        content,
        replyTo: replyTo || null,
      });

      await newChatEntry.save();

      // Push the new message ID into the messages array
      chatExists.messages.push(newChatEntry._id);
      await chatExists.save();

      return sendSuccessResponse(res, {
        message: "Chat entry (message) created successfully!",
        chatEntry: newChatEntry,
      });
    } catch (error) {
      console.error("Error creating chat entry:", error);
      return sendErrorResponse(res, error);
    }
  }

  /**
   * Responsible for retrieving a specific chat
   * @param {*} req The request object
   * @param {*} res The response object
   * @returns {Promise<void>}
   */
  static async getChat(req, res) {
    const { chatId } = req.params;

    try {
      const chatExists = await Chat.findById(chatId)
        .populate("participants", "handle")
        .populate({
          path: "messages",
          populate: { path: "sender", select: "handle" },
        });

      if (!chatExists) {
        throw new BDERROR("Chat cannot be found", 404);
      }

      return sendSuccessResponse(res, {
        message: "Chat retrieved successfully!",
        chat: chatExists,
      });
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  /**
   * Responsible for deleting a specific chat based on the chat ID
   * @param {*} req The request object
   * @param {*} res The response object
   * @returns {Promise<void>}
   */
  static async deleteChat(req, res) {
    const { chatId } = req.params;

    try {
      // Validate the chat ID
      if (!chatId) {
        return sendErrorResponse(res, {
          message: "Chat ID is required.",
          statusCode: 400,
        });
      }

      // Find the chat
      const chatToDelete = await Chat.findById(chatId);
      if (!chatToDelete) {
        return sendErrorResponse(res, {
          message: "Chat not found or already deleted.",
          statusCode: 404,
        });
      }

      // Ensure member is authenticated
      if (!req.member || !req.member._id) {
        return sendErrorResponse(res, {
          message: "Authentication required. Please log in.",
          statusCode: 401,
        });
      }

      const memberId = req.member._id;

      // Authorization: member must be a participant
      const isParticipant = chatToDelete.participants.includes(
        memberId.toString()
      );

      if (!isParticipant) {
        return sendErrorResponse(res, {
          message: "You are not authorized to delete this chat.",
          statusCode: 403,
        });
      }

      // Delete the chat
      await chatToDelete.deleteOne();

      return sendSuccessResponse(res, {
        message: "Chat deleted successfully.",
        statusCode: 204,
      });
    } catch (error) {
      return sendErrorResponse(res, {
        message: "Failed to delete chat due to an unexpected error.",
        statusCode: 500,
      });
    }
  }
}

module.exports = ChatController;
