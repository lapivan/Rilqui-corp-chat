using Mapster;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;
using MediatR;
using RilquiChat.Domain.Entities;

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
        
        if (chat.Members.All(m => m.UserId != currentUserId)) throw new Exception("You are not a member of this chat.");

        if (request.ParentMessageId.HasValue)
        {
            var parentExists = await unitOfWork.Messages.FirstOrDefaultAsync(
                m => m.Id == request.ParentMessageId && m.ChatId == request.ChatId, cancellationToken);
            
            if (parentExists == null)
                throw new Exception("Parent message not found in this chat.");
        }

        var message = new Message(request.Content, currentUserId, chat.Id);

        if (request.ParentMessageId.HasValue)
        {
            message.SetReplyTo(request.ParentMessageId.Value);
        }

        chat.AddMessage(message);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await signalRService.SendMessageAsync(message.ChatId, message.Adapt<MessageDto>());

        return message.Adapt<MessageDto>();
    }
}