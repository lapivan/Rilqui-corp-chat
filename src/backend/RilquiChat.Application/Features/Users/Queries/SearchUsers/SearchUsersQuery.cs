using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Users.Queries.SearchUsers;

public record SearchUsersQuery(string SearchTerm) : IRequest<List<UserDto>>;