using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Messages.Queries.GetPinnedMessages;

public record GetPinnedMessagesQuery(Guid ChatId) : IRequest<List<MessageDto>>;

public class GetPinnedMessagesHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<GetPinnedMessagesQuery, List<MessageDto>>
{
    public async Task<List<MessageDto>> Handle(GetPinnedMessagesQuery request, CancellationToken ct)
    {
        var currentUserId = currentUserService.UserId 
                            ?? throw new UnauthorizedAccessException();

        var isMember = await unitOfWork.ChatMembers.GetByChatAndUserAsync(request.ChatId, currentUserId, ct);
        if (isMember == null)
            throw new Exception("Access denied.");

        var pinnedMessages = await unitOfWork.Messages.GetPinnedMessagesAsync(request.ChatId, ct);

        return pinnedMessages.Adapt<List<MessageDto>>();
    }
}