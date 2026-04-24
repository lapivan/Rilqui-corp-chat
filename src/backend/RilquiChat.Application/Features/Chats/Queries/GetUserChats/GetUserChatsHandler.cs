using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Queries.GetUserChats;

public class GetUserChatsHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<GetUserChatsQuery, IReadOnlyCollection<ChatSummaryDto>>
{
    public async Task<IReadOnlyCollection<ChatSummaryDto>> Handle(GetUserChatsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
    
        var chats = await unitOfWork.Chats.GetUserChatsAsync(userId, cancellationToken);
        
        return chats.BuildAdapter()
            .AddParameters("UserId", userId)
            .AdaptToType<List<ChatSummaryDto>>();
    }
}