using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Messages.Commands.SendMessage;

public record SendMessageCommand(
    Guid ChatId, 
    string Content, 
    Guid? ParentMessageId = null) : IRequest<MessageDto>;