using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Commands.AddChatMember;

public class AddChatMemberHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService): IRequestHandler<AddChatMemberCommand, Unit>
{
    public async Task<Unit> Handle(AddChatMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId 
                            ?? throw new UnauthorizedAccessException();
        
        var chat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, cancellationToken, c => c.Members);
        if (chat == null)
            throw new Exception("Chat not found.");
        
        var isMember = chat.Members.Any(m => m.UserId == currentUserId);
        if (!isMember)
            throw new Exception("You are not a member of this chat and cannot invite others.");

        var userToAdd = await unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (userToAdd == null)
            throw new Exception("User to add not found.");

        chat.AddMember(userToAdd, UserRole.User);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}