using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Commands.CreateGroupOrChannel;

public class CreateGroupOrChannelHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<CreateGroupOrChannelCommand, ChatDetailDto>
{
    public async Task<ChatDetailDto> Handle(CreateGroupOrChannelCommand request, CancellationToken ct)
    {
        var currentUserId = currentUserService.UserId 
                            ?? throw new UnauthorizedAccessException();
        
        var newChat = new Chat(request.ChatName, request.Type);
        
        var creator = await unitOfWork.Users.GetByIdAsync(currentUserId, ct)
                      ?? throw new Exception("Creator profile not found.");

        newChat.AddMember(creator, UserRole.Admin);

        await unitOfWork.Chats.AddAsync(newChat, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return newChat.Adapt<ChatDetailDto>();
    }
}