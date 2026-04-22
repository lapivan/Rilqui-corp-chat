using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Commands.CreateDirectChat;

public class CreateDirectChatHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    ISignalRService signalRService
    ) : IRequestHandler<CreateDirectChatCommand, ChatDetailDto>
{
    public async Task<ChatDetailDto> Handle(CreateDirectChatCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId ?? throw new UnauthorizedAccessException("User is not authenticated.");
        
        if (currentUserId == request.PartnerId) throw new InvalidOperationException("You cannot create a direct chat with yourself.");

        var existingChat = await unitOfWork.Chats.GetDirectChatByUsersAsync(currentUserId, request.PartnerId, cancellationToken);

        if (existingChat != null)
        {
            return existingChat.Adapt<ChatDetailDto>();
        }
        
        var currentUser = await unitOfWork.Users.GetByIdAsync(currentUserId, cancellationToken)
                          ?? throw new Exception("Current user profile not found.");

        var partnerUser = await unitOfWork.Users.GetByIdAsync(request.PartnerId, cancellationToken)
                          ?? throw new Exception("Partner user not found.");

        var newChat = new Chat(null, ChatType.Direct);

        newChat.AddMember(currentUser, UserRole.User);
        newChat.AddMember(partnerUser, UserRole.User);

        await unitOfWork.Chats.AddAsync(newChat, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        await signalRService.NotifyChatCreatedAsync(request.PartnerId, newChat.Adapt<ChatSummaryDto>());

        return newChat.Adapt<ChatDetailDto>();
    }
}