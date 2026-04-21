using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Users.Queries.SearchUsers;

public class SearchUsersHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<SearchUsersQuery, List<UserDto>>
{
    public async Task<List<UserDto>> Handle(SearchUsersQuery request, CancellationToken ct)
    {
        var users = await unitOfWork.Users.SearchByTermAsync(request.SearchTerm, ct);
        var currentUserId = currentUserService.UserId;
        
        var result = users
            .Where(u => u.Id != currentUserId)
            .Adapt<List<UserDto>>();

        return result;
    }
}