using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Messages.Commands.SendFile;

public class SendFileHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    IFileStorageService fileStorageService,
    ISignalRService signalRService) : IRequestHandler<SendFileCommand, MessageDto>
{
    public async Task<MessageDto> Handle(SendFileCommand request, CancellationToken ct)
    {
        var currentUserId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        
        var chat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, ct, c => c.Members);
        if (chat == null || chat.Members.All(m => m.UserId != currentUserId))
            throw new Exception("Chat not found or access denied.");
        
        var fileUrl = await fileStorageService.UploadFileAsync(request.FileStream, request.FileName, ct);
        
        var message = Message.CreateFileMessage(
            currentUserId,
            chat.Id,
            fileUrl,
            request.FileName,
            request.FileStream.Length,
            request.Type,
            request.Description
        );

        await unitOfWork.Messages.AddAsync(message, ct);
        await unitOfWork.SaveChangesAsync(ct);

        var sender = await unitOfWork.Users.GetByIdAsync(currentUserId, ct);
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