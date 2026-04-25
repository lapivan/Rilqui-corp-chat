using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Common.Interfaces;

public interface IChatClient
{
    Task ReceiveMessage(MessageDto message);
    Task MessageUpdated(MessageDto message);
    Task MessageDeleted(Guid chatId, Guid messageId);
    Task MessagesRead(Guid chatId, Guid userId, DateTime readAt);
    
    Task ChatCreated(ChatSummaryDto chat);
    Task ChatUpdated(Guid chatId, string newName); 
    Task MemberJoined(Guid chatId, string username);
    Task MemberLeft(Guid chatId, string username);
    
    Task UserIsTyping(Guid chatId, string username);
    Task ChatRemoved(Guid chatId);
}