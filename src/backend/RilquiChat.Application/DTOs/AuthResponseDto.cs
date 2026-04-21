namespace RilquiChat.Application.DTOs;

public record AuthResponseDto(
    UserDto User,
    string Token);