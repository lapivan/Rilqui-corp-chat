using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery() : IRequest<UserDto>;