using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Common.Interfaces;

public interface ISignalRService
{
    /// <summary>Sends a message to specified users.</summary>
    Task SendMessageAsync(IEnumerable<Guid> userIds, MessageDto message);
    
    /// <summary>Sends a message update to specified users.</summary>
    Task SendUpdateAsync(IEnumerable<Guid> userIds, MessageDto message);
    
    /// <summary>Sends a message deletion notification to specified users.</summary>
    Task SendDeletionAsync(IEnumerable<Guid> userIds, Guid chatId, Guid messageId);
    
    /// <summary>Sends a read receipt notification to specified users.</summary>
    Task SendMessagesReadAsync(IEnumerable<Guid> userIds, Guid chatId, Guid readerId, DateTime readAt);
    
    /// <summary>Notifies a single user about a new chat.</summary>
    Task NotifyChatCreatedAsync(Guid userId, ChatSummaryDto chat);
    
    /// <summary>Notifies users about a chat rename.</summary>
    Task NotifyChatRenameAsync(IEnumerable<Guid> userIds, Guid chatId, string newName);
    
    /// <summary>Notifies users about a member joining or leaving a chat.</summary>
    Task NotifyMemberChangeAsync(IEnumerable<Guid> userIds, Guid chatId, string username, bool joined);
    
    /// <summary>Notifies a user that they have been removed from a chat.</summary>
    Task NotifyMemberRemovedAsync(Guid chatId, Guid userId);
    
    /// <summary>Notifies a user that they have been added to a chat.</summary>
    Task NotifyMemberAddedAsync(Guid userId, ChatSummaryDto chatSummary);
    
    /// <summary>Sends a message to all participants (alias for SendMessageAsync).</summary>
    Task SendMessageToParticipantsAsync(IEnumerable<Guid> userIds, MessageDto message);
    Task SendDeletionAsync(IEnumerable<Guid> userIds, Guid chatId, Guid messageId, MessageDto? nextLastMessage);
}