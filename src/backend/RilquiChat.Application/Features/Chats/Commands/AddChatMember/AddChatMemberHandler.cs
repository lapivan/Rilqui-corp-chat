using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Commands.AddChatMember;

public class AddChatMemberHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    ISignalRService signalRService): IRequestHandler<AddChatMemberCommand, Unit>
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
    
        await signalRService.NotifyMemberChangeAsync(chat.Id, userToAdd.Username, true);

        return Unit.Value;
    }
}