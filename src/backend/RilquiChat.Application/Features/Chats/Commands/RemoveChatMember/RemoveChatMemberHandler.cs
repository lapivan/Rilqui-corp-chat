using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Commands.RemoveChatMember;

public class RemoveChatMemberHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<RemoveChatMemberCommand, Unit>
{
    public async Task<Unit> Handle(RemoveChatMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        
        var currentChat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, cancellationToken, c => c.Members);
        
        if(currentChat == null) throw new Exception("Chat not found.");

        var memberToRemove = currentChat.Members.FirstOrDefault(m => m.UserId == request.UserId);
        if (memberToRemove == null) throw new Exception("User is not a member of this chat.");
        
        bool isSelfRemoval = currentUserId == request.UserId;

        if (!isSelfRemoval)
        {
            var currentUserInChat = currentChat.Members.FirstOrDefault(m => m.UserId == currentUserId);
            
            if (currentUserInChat == null || currentUserInChat.Role != UserRole.Admin)
            {
                throw new Exception("Only admins can remove other members from the chat.");
            }
        }
        
        currentChat.RemoveMember(request.UserId);
        
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}