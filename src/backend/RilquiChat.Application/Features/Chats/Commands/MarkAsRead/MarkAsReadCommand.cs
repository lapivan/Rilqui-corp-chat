using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Commands.MarkAsRead;

public record MarkAsReadCommand(Guid ChatId) : IRequest<Unit>;

public class MarkAsReadHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    ISignalRService signalRService) : IRequestHandler<MarkAsReadCommand, Unit>
{
    public async Task<Unit> Handle(MarkAsReadCommand request, CancellationToken ct)
    {
        var currentUserId = currentUserService.UserId 
                            ?? throw new UnauthorizedAccessException();
        
        var chat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, ct, c => c.Members);
        
        if (chat == null)
            throw new Exception("Chat not found.");

        var member = chat.Members.FirstOrDefault(m => m.UserId == currentUserId);
        
        if (member == null)
            throw new Exception("You are not a member of this chat.");
        
        member.UpdateLastRead();
        
        await unitOfWork.SaveChangesAsync(ct);
        
        await signalRService.SendMessagesReadAsync(request.ChatId, currentUserId, DateTime.UtcNow);

        return Unit.Value;
    }
}