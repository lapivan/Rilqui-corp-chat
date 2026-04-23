using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Enums;
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
        
        var chat = await unitOfWork.Chats.GetWithDetailsAsync(request.ChatId, cancellationToken);

        if (chat == null)
            throw new Exception("Chat not found.");
        
        if (chat.Members.All(m => m.UserId != currentUserId))
        {
            throw new Exception("Access denied. You are not a member of this chat.");
        }

        var dto = chat.Adapt<ChatDetailDto>();

        if (chat.Type == ChatType.Direct)
        {
            var otherMember = chat.Members.FirstOrDefault(m => m.UserId != currentUserId);
            if (otherMember?.User != null)
            {
                var displayName = !string.IsNullOrWhiteSpace(otherMember.User.Fullname) 
                    ? otherMember.User.Fullname 
                    : otherMember.User.Username;
                
                dto = dto with { Title = displayName };
            }
        }

        return dto;
    }
}