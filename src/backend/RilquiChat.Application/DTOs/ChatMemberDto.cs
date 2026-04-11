using RilquiChat.Domain.Enums;

namespace RilquiChat.Application.DTOs;

public record ChatMemberDto(
    Guid UserId,
    string Username,
    string Fullname,
    string? AvatarUrl,
    UserRole Role,
    DateTime JoinedAt);