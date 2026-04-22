using RilquiChat.Domain.Common;
using RilquiChat.Domain.Enums;

namespace RilquiChat.Domain.Entities;

public class Message : BaseEntity
{
    public string? Content { get; private set; }
    public bool IsPinned { get; private set; } = false;
    
    public MessageType Type { get; private set; }
    public string? FileUrl { get; private set; }
    
    public string? FileName { get; private set; }
    public long? FileSize { get; private set; }
    
    public Guid SenderId { get; private set; }
    public virtual User Sender { get; private set; } = null!;

    public Guid ChatId { get; private set; }
    public virtual Chat Chat { get; private set; } = null!;

    public Guid? ParentMessageId { get; private set; }
    public virtual Message? ParentMessage { get; private set; }

    private Message() { }
    
    public Message(string content, Guid senderId, Guid chatId)
    {
        ValidateId(senderId, nameof(senderId));
        ValidateId(chatId, nameof(chatId));
        
        EditContent(content);
        SenderId = senderId;
        ChatId = chatId;
        Type = MessageType.Text;
    }
    
    public static Message CreateFileMessage(Guid senderId, Guid chatId, string fileUrl, string fileName, long fileSize, MessageType type, string? description = null)
    {
        if (type == MessageType.Text) throw new ArgumentException("Use constructor for text messages.");
        
        return new Message
        {
            SenderId = senderId,
            ChatId = chatId,
            FileUrl = fileUrl,
            FileName = fileName,
            FileSize = fileSize,
            Content = description,
            Type = type,
            CreatedAt = DateTime.UtcNow
        };
    }

    private void ValidateId(Guid id, string paramName)
    {
        if (id == Guid.Empty) throw new ArgumentException("ID cannot be empty.", paramName);
    }

    public void Pin()
    {
        if (IsPinned) return;
        IsPinned = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unpin()
    {
        if (!IsPinned) return;
        IsPinned = false;
        UpdatedAt = DateTime.UtcNow;
    }
    public void SetReplyTo(Guid parentMessageId)
    {
        ParentMessageId = parentMessageId;
    }

    public void EditContent(string newContent)
    {
        if (Type == MessageType.Text && string.IsNullOrWhiteSpace(newContent)) throw new ArgumentException("Text message cannot be empty.");
        Content = newContent;
        UpdatedAt = DateTime.UtcNow;
    }
}