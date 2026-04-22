using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Messages.Commands.DeleteMessage;

public class DeleteMessageHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService, 
    ISignalRService signalRService) : IRequestHandler<DeleteMessageCommand, Unit>
{
    public async Task<Unit> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.UserId
                            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var message = await unitOfWork.Messages.GetByIdAsync(request.MessageId, cancellationToken);
        if (message == null) 
            throw new Exception("Message not found.");

        if(message.SenderId != currentUserId) 
            throw new Exception("Access denied. You can only delete your own messages.");

        await unitOfWork.Messages.DeleteAsync(message, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        await signalRService.SendDeletionAsync(message.ChatId, message.Id);
        
        return Unit.Value;
    }
}