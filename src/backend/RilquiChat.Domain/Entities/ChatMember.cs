using RilquiChat.Domain.Common;
using RilquiChat.Domain.Enums;

namespace RilquiChat.Domain.Entities;

public class ChatMember : BaseEntity
{
    public Guid UserId { get; private set; }
    public virtual User User { get; private set; } = null!;

    public Guid ChatId { get; private set; }
    public virtual Chat Chat { get; private set; } = null!;

    public UserRole Role { get; private set; }
    public DateTime JoinedAt { get; private set; }

    public Guid? LastReadMessageId { get; private set; }

    private ChatMember() { }

    public ChatMember(Guid userId, Guid chatId, UserRole role)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty.", nameof(userId));
        if (chatId == Guid.Empty) throw new ArgumentException("ChatId cannot be empty.", nameof(chatId));
        
        UserId = userId;
        ChatId = chatId;
        Role = role;
        JoinedAt = DateTime.UtcNow;
    }

    public void ChangeRole(UserRole newRole)
    {
        if (!Enum.IsDefined(typeof(UserRole), newRole)) throw new ArgumentException("Invalid chat role.", nameof(newRole));
        Role = newRole;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateLastReadMessage(Guid messageId)
    {
        LastReadMessageId = messageId;
        UpdatedAt = DateTime.UtcNow;
    }
}