using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RilquiChat.Application.Features.Messages.Commands.DeleteMessage;

public class DeleteMessageHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService, 
    ISignalRService signalRService,
    IFileStorageService fileStorageService) : IRequestHandler<DeleteMessageCommand, Unit>
{
    public async Task<Unit> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId
                            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var message = await unitOfWork.Messages.GetByIdAsync(request.MessageId, cancellationToken);
        if (message == null) 
            throw new Exception("Message not found.");

        if (message.SenderId != currentUserId) 
            throw new Exception("Access denied. You can only delete your own messages.");
        
        if (!string.IsNullOrEmpty(message.FileUrl))
        {
            await fileStorageService.DeleteFileAsync(message.FileUrl, cancellationToken);
        }

        var chatId = message.ChatId;
        
        await unitOfWork.Messages.DeleteAsync(message, cancellationToken);

        var chat = await unitOfWork.Chats.GetByIdAsync(chatId, cancellationToken);
        
        var latestMessages = await unitOfWork.Messages.GetPagedChatMessagesAsync(
            chatId, 
            skip: 0, 
            take: 2, 
            cancellationToken
        );
        
        var latestRemainingMessage = latestMessages
            .Where(m => m.Id != message.Id)
            .FirstOrDefault();

        if (chat != null)
        {
            if (latestRemainingMessage != null)
            {
                chat.UpdateTimestamp(latestRemainingMessage.CreatedAt);
            }
            else
            {
                chat.UpdateTimestamp(chat.CreatedAt);
            }
            await unitOfWork.Chats.UpdateAsync(chat, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        chat = await unitOfWork.Chats.GetByIdAsync(chatId, cancellationToken, c => c.Members);

        MessageDto? nextLastMessageDto = null;
        if (latestRemainingMessage != null)
        {
            nextLastMessageDto = new MessageDto(
                latestRemainingMessage.Id,
                latestRemainingMessage.ChatId,
                latestRemainingMessage.SenderId,
                latestRemainingMessage.Sender?.Username ?? "Unknown", 
                latestRemainingMessage.Content,
                latestRemainingMessage.Type,
                latestRemainingMessage.CreatedAt,
                latestRemainingMessage.UpdatedAt,
                latestRemainingMessage.IsPinned,
                latestRemainingMessage.ParentMessageId,
                latestRemainingMessage.FileUrl,
                latestRemainingMessage.FileName,
                latestRemainingMessage.FileSize
            );
        }

        var memberIds = chat.Members.Select(m => m.UserId).Distinct().ToList();
        
        await signalRService.SendDeletionAsync(memberIds, chatId, message.Id, nextLastMessageDto);
        
        return Unit.Value;
    }
}