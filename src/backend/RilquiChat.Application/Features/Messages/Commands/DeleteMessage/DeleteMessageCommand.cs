using MediatR;

namespace RilquiChat.Application.Features.Messages.Commands.DeleteMessage;

public record DeleteMessageCommand(Guid MessageId) : IRequest<Unit>;