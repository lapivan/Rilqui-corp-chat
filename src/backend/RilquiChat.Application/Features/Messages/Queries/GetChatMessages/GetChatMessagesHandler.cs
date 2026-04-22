using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Messages.Queries.GetChatMessages;

public class GetChatMessagesHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<GetChatMessagesQuery, List<MessageDto>>
{
    public async Task<List<MessageDto>> Handle(GetChatMessagesQuery request, CancellationToken ct)
    {
        var currentUserId = currentUserService.UserId 
                            ?? throw new UnauthorizedAccessException();
        var chat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, ct, c => c.Members);
        
        if (chat == null)
            throw new Exception("Chat not found.");

        if (chat.Members.All(m => m.UserId != currentUserId))
            throw new Exception("Access denied. You are not a member of this chat.");
        
        var messages = await unitOfWork.Messages.GetPagedMessagesAsync(
            request.ChatId, 
            request.BeforeTimestamp, 
            request.Take, 
            ct);

        return messages.Adapt<List<MessageDto>>();
    }
}