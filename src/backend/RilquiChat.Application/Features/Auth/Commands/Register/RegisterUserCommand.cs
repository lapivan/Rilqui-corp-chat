using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Auth.Commands.Register;

public record RegisterUserCommand(
    string Username,
    string Email,
    string Fullname,
    string Password) : IRequest<UserDto>;