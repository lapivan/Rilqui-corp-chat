using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Common.Interfaces;

public interface ISignalRService
{
    Task SendMessageAsync(Guid chatId, MessageDto message);
    Task SendUpdateAsync(Guid chatId, MessageDto message);
    Task SendDeletionAsync(Guid chatId, Guid messageId);
    Task SendMessagesReadAsync(Guid chatId, Guid readerId, DateTime readAt);
    
    Task NotifyChatCreatedAsync(Guid userId, ChatSummaryDto chat);
    Task NotifyChatRenameAsync(Guid chatId, string newName);
    Task NotifyMemberChangeAsync(Guid chatId, string username, bool joined);
}