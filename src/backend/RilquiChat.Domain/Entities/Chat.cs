using RilquiChat.Domain.Common;
using RilquiChat.Domain.Enums;

namespace RilquiChat.Domain.Entities;

public class Chat : BaseEntity
{
    public string? Title { get; private set; }
    public ChatType Type { get; private set; }
    
    private readonly List<ChatMember> _members = new();
    public virtual IReadOnlyCollection<ChatMember> Members => _members.AsReadOnly();

    private readonly List<Message> _messages = new();
    public virtual IReadOnlyCollection<Message> Messages => _messages.AsReadOnly();

    private Chat() { }

    public Chat(string? title, ChatType type)
    {
        ValidateTitle(title, type);
        
        Title = title;
        Type = type;
    }

    private void ValidateTitle(string? title, ChatType type)
    {
        if (type != ChatType.Direct && string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Group and Channel names cannot be empty.", nameof(title));

        if (title?.Length > 100) throw new ArgumentException("Chat title cannot exceed 100 characters.", nameof(title));
    }

    public void Rename(string newTitle)
    {
        if (Type == ChatType.Direct) throw new InvalidOperationException("Cannot rename a direct chat.");

        ValidateTitle(newTitle, Type);
        Title = newTitle;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddMember(User user, UserRole role)
    {
        if (Type == ChatType.Direct && _members.Count >= 2) throw new InvalidOperationException("Direct chat cannot have more than 2 members.");
        
        if (_members.Any(m => m.UserId == user.Id)) throw new InvalidOperationException("User is already a member of this chat.");

        var member = new ChatMember(user.Id, this.Id, role);
        _members.Add(member);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveMember(Guid userId)
    {
        var member = _members.FirstOrDefault(m => m.UserId == userId);
        if (member == null) return;
        
        if (Type == ChatType.Direct) throw new InvalidOperationException("Cannot remove members from a direct chat individually.");

        _members.Remove(member);
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddMessage(Message message)
    {
        _messages.Add(message);
    }
    public void UpdateTimestamp(DateTime utcDateTime)
    {
        UpdatedAt = utcDateTime;
    }
    public void PinMessage(Message message)
    {
        if (message.ChatId != this.Id) throw new InvalidOperationException("Message does not belong to this chat.");
        
        if (_messages.Count(m => m.IsPinned) >= 10) 
            throw new InvalidOperationException("Maximum 10 pinned messages allowed per chat.");

        message.Pin();
        UpdatedAt = DateTime.UtcNow;
    }
}