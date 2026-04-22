using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Messages.Commands.PinMessage;

public record UnpinMessageCommand(Guid MessageId) : IRequest<Unit>;

public class UnpinMessageHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService, 
    ISignalRService signalRService) : IRequestHandler<UnpinMessageCommand, Unit>
{
    public async Task<Unit> Handle(UnpinMessageCommand request, CancellationToken ct)
    {
        var currentUserId = currentUserService.UserId 
                            ?? throw new UnauthorizedAccessException();
        
        var message = await unitOfWork.Messages.GetByIdAsync(request.MessageId, ct);
        if (message == null) 
            throw new Exception("Message not found.");

        var chat = await unitOfWork.Chats.GetByIdAsync(message.ChatId, ct, c => c.Members);
        if (chat == null) 
            throw new Exception("Chat not found.");

        var member = chat.Members.FirstOrDefault(m => m.UserId == currentUserId);
        if (member == null) 
            throw new Exception("You are not a member of this chat.");
        
        bool canUnpin = chat.Type != ChatType.Channel || member.Role == UserRole.Admin;

        if (!canUnpin)
        {
            throw new Exception("In channels, only administrators can unpin messages.");
        }

        message.Unpin();

        await unitOfWork.SaveChangesAsync(ct);
        
        await signalRService.SendUpdateAsync(message.ChatId, message.Adapt<MessageDto>());

        return Unit.Value;
    }
}