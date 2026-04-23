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
        
        await signalRService.NotifyMemberChangeAsync(request.ChatId, usernameForNotify, false);

        return Unit.Value;
    }
}