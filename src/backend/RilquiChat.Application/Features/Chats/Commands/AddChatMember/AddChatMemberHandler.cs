using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Commands.AddChatMember;

public class AddChatMemberHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    ISignalRService signalRService) : IRequestHandler<AddChatMemberCommand, Unit>
{
    public async Task<Unit> Handle(AddChatMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        
        var chat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, cancellationToken, c => c.Members);
        if (chat == null) throw new Exception("Chat not found.");
    
        if (chat.Members.All(m => m.UserId != currentUserId))
            throw new Exception("You are not a member of this chat.");

        var userToAdd = await unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (userToAdd == null) throw new Exception("User to add not found.");
        
        if (chat.Members.Any(m => m.UserId == request.UserId))
            throw new Exception("User is already a member.");
        
        var newMember = new ChatMember(userToAdd.Id, chat.Id, UserRole.User);
        
        await unitOfWork.ChatMembers.AddAsync(newMember, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var updatedChat = await unitOfWork.Chats.GetByIdAsync(chat.Id, cancellationToken, c => c.Members);
        var memberIds = updatedChat.Members.Select(m => m.UserId).ToList();
        
        await signalRService.NotifyMemberChangeAsync(memberIds, chat.Id, userToAdd.Username, true);

        MessageDto? lastMessageDto = null;
        var messages = await unitOfWork.Messages.GetPagedMessagesAsync(
            chatId: chat.Id, 
            beforeTimestamp: null, 
            take: 1, 
            ct: cancellationToken
        );
        
        var lastMessage = messages.FirstOrDefault();

        if (lastMessage != null)
        {
            lastMessageDto = new MessageDto(
                lastMessage.Id,
                lastMessage.ChatId,
                lastMessage.SenderId,
                lastMessage.Sender?.Username ?? "Unknown", 
                lastMessage.Content,
                lastMessage.Type,
                lastMessage.CreatedAt,
                lastMessage.UpdatedAt,
                lastMessage.IsPinned,
                lastMessage.ParentMessageId,
                lastMessage.FileUrl,
                lastMessage.FileName,
                lastMessage.FileSize
            );
        }
        
        var chatSummary = new ChatSummaryDto(
            updatedChat.Id,
            updatedChat.Title,
            null, 
            updatedChat.Type,
            updatedChat.UpdatedAt,
            lastMessageDto,
            0 
        );

        await signalRService.NotifyMemberAddedAsync(userToAdd.Id, chatSummary);

        return Unit.Value;
    }
}