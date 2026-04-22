using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Chats.Commands.RenameChat;

public class RenameChatHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    ISignalRService signalRService) : IRequestHandler<RenameChatCommand, Unit>
{
    public async Task<Unit> Handle(RenameChatCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        
        var chat = await unitOfWork.Chats.GetByIdAsync(request.ChatId, cancellationToken, c => c.Members);
        if (chat == null) throw new Exception("Chat not found.");
        var member = chat.Members.FirstOrDefault(m => m.UserId == currentUserId);
        
        if (member == null || member.Role != UserRole.Admin)
        {
            throw new Exception("Only admins can rename the chat.");
        }
        
        chat.Rename(request.NewTitle);
        
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        await signalRService.NotifyChatRenameAsync(chat.Id, chat.Title);

        return Unit.Value;
    }
}