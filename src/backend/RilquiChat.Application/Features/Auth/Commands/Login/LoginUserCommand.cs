using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Auth.Commands.Login;

public record LoginUserCommand(
    string Email,
    string Password) : IRequest<AuthResponseDto>;