namespace RilquiChat.Application.DTOs;

public record UserDto(Guid Id, string Username, string Fullname, string? AvatarUrl, int Role);