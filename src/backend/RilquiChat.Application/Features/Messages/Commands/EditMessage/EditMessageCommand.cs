using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Messages.Commands.EditMessage;

public record EditMessageCommand(Guid MessageId, string NewContent) : IRequest<MessageDto>;