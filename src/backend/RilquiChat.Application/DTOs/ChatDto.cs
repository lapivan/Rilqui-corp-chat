using RilquiChat.Domain.Enums;

namespace RilquiChat.Application.DTOs;

public record ChatSummaryDto(
    Guid Id,
    string? Title,
    string? AvatarUrl,
    ChatType Type,
    DateTime UpdatedAt,
    MessageDto? LastMessage,
    int UnreadCount);
    
public record ChatDetailDto(
    Guid Id,
    string? Title,
    ChatType Type,
    IReadOnlyCollection<ChatMemberDto> Members);