using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Queries.GetChatDetails;

public class GetChatDetailsHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<GetChatDetailsQuery, ChatDetailDto>
{
    public async Task<ChatDetailDto> Handle(GetChatDetailsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId 
                            ?? throw new UnauthorizedAccessException();
        
        var chat = await unitOfWork.Chats.GetByIdAsync(
            request.ChatId, 
            cancellationToken, 
            c => c.Members,
            c => c.Messages
        );

        if (chat == null)
            throw new Exception("Chat not found.");
        
        if (chat.Members.All(m => m.UserId != currentUserId))
        {
            throw new Exception("Access denied. You are not a member of this chat.");
        }

        var dto = chat.Adapt<ChatDetailDto>();

        return dto;
    }
}