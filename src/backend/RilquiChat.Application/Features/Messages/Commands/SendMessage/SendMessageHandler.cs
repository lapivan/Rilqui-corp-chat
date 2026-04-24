using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Messages.Commands.SendMessage;

public class SendMessageHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    ISignalRService signalRService) : IRequestHandler<SendMessageCommand, MessageDto>
{
    public async Task<MessageDto> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        
        var chat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, cancellationToken, c => c.Members);
        if (chat == null) throw new Exception("Chat not found.");
        
        if (chat.Members.All(m => m.UserId != currentUserId)) 
            throw new Exception("You are not a member of this chat.");

        if (request.ParentMessageId.HasValue)
        {
            var parentExists = await unitOfWork.Messages.FirstOrDefaultAsync(
                m => m.Id == request.ParentMessageId && m.ChatId == request.ChatId, cancellationToken);
            
            if (parentExists == null)
                throw new Exception("Parent message not found in this chat.");
        }

        var message = new Message(request.Content, currentUserId, chat.Id, request.ParentMessageId);

        await unitOfWork.Messages.AddAsync(message, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var sender = await unitOfWork.Users.GetByIdAsync(currentUserId, cancellationToken);
        var dto = message.Adapt<MessageDto>() with 
        { 
            SenderName = sender != null 
                ? (!string.IsNullOrWhiteSpace(sender.Fullname) ? sender.Fullname : sender.Username) 
                : null 
        };

        await signalRService.SendMessageAsync(message.ChatId, dto);

        return dto;
    }
}