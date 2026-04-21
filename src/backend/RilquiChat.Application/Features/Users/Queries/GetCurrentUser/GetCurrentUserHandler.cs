using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Users.Queries.GetCurrentUser;

public class GetCurrentUserHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<GetCurrentUserQuery, UserDto>
{
    public async Task<UserDto> Handle(GetCurrentUserQuery request, CancellationToken ct)
    {
        var userId = currentUserService.UserId 
                     ?? throw new UnauthorizedAccessException("You are not authorized.");
        
        var user = await unitOfWork.Users.GetByIdAsync(userId, ct);
        
        if (user == null)
            throw new Exception("User profile not found in database.");
        
        return user.Adapt<UserDto>();
    }
}