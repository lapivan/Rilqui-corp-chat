using RilquiChat.Domain.Enums;

namespace RilquiChat.Application.DTOs;

public record MessageDto(
    Guid Id,
    Guid ChatId,
    Guid SenderId,
    string? SenderName,
    string? Content,
    MessageType Type,
    DateTime CreatedAt,
    bool IsPinned,
    Guid? ParentMessageId,
    string? FileUrl,
    string? FileName,
    long? FileSize);