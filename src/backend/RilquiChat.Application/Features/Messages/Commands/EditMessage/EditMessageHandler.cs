using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Messages.Commands.EditMessage;

public class EditMessageHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService, 
    ISignalRService signalRService) : IRequestHandler<EditMessageCommand, MessageDto>
{
    public async Task<MessageDto> Handle(EditMessageCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId 
                            ?? throw new UnauthorizedAccessException();
        
        var message = await unitOfWork.Messages.GetByIdAsync(request.MessageId, cancellationToken);
        
        if (message == null)
            throw new Exception("Message not found.");
        
        if (message.SenderId != currentUserId)
            throw new Exception("You can only edit your own messages.");
        
        message.EditContent(request.NewContent);
        
        await unitOfWork.Messages.UpdateAsync(message, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var sender = await unitOfWork.Users.GetByIdAsync(currentUserId, cancellationToken);
        var dto = message.Adapt<MessageDto>() with 
        { 
            SenderName = sender != null 
                ? (!string.IsNullOrWhiteSpace(sender.Fullname) ? sender.Fullname : sender.Username) 
                : null 
        };
        
        var chat = await unitOfWork.Chats.GetByIdAsync(message.ChatId, cancellationToken, c => c.Members);
        var memberIds = chat.Members.Select(m => m.UserId).ToList();

        await signalRService.SendUpdateAsync(memberIds, dto);
        
        return dto;
    }
}