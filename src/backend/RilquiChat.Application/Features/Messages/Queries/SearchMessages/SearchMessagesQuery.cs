using MediatR;
using Mapster;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Messages.Queries.SearchMessages;

public record SearchMessagesQuery(Guid ChatId, string SearchTerm) : IRequest<List<MessageDto>>;

public class SearchMessagesHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<SearchMessagesQuery, List<MessageDto>>
{
    public async Task<List<MessageDto>> Handle(SearchMessagesQuery request, CancellationToken ct)
    {
        var currentUserId = currentUserService.UserId 
                            ?? throw new UnauthorizedAccessException();
        
        var chat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, ct, c => c.Members);
        
        if (chat == null)
            throw new Exception("Chat not found.");
        
        if (chat.Members.All(m => m.UserId != currentUserId))
        {
            throw new Exception("Access denied. You are not a member of this chat.");
        }

        if (string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            return new List<MessageDto>();
        }
        
        var messages = await unitOfWork.Messages.SearchInChatAsync(
            request.ChatId, 
            request.SearchTerm, 
            ct);
        
        return messages.Adapt<List<MessageDto>>();
    }
}