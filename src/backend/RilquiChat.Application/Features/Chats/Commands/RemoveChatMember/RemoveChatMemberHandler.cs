using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Commands.RemoveChatMember;

public class RemoveChatMemberHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    ISignalRService signalRService) : IRequestHandler<RemoveChatMemberCommand, Unit>
{
    public async Task<Unit> Handle(RemoveChatMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        
        var memberToRemove = await unitOfWork.ChatMembers.GetByChatAndUserAsync(request.ChatId, request.UserId, cancellationToken);
        if (memberToRemove == null) throw new Exception("User is not a member of this chat.");

        var usernameForNotify = memberToRemove.User.Username;
        bool isSelfRemoval = currentUserId == request.UserId;

        if (!isSelfRemoval)
        {
            var adminMember = await unitOfWork.ChatMembers.GetByChatAndUserAsync(request.ChatId, currentUserId, cancellationToken);
            if (adminMember == null || adminMember.Role != UserRole.Admin)
            {
                throw new Exception("Only admins can remove other members.");
            }
        }
        
        unitOfWork.ChatMembers.Remove(memberToRemove);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        var chat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, cancellationToken, c => c.Members);
        var memberIds = chat.Members.Select(m => m.UserId).ToList();

        await signalRService.NotifyMemberChangeAsync(memberIds, request.ChatId, usernameForNotify, false);
        await signalRService.NotifyMemberRemovedAsync(request.ChatId, request.UserId);

        return Unit.Value;
    }
}