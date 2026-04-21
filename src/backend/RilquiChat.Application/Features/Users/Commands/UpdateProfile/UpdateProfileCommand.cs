using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Users.Commands.UpdateProfile;

public record UpdateProfileCommand(
    string? Fullname,
    string? AvatarUrl,
    string? Username) : IRequest<UserDto>;