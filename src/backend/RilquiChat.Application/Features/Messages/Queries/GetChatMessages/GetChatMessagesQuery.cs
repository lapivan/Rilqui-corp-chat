using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Messages.Queries.GetChatMessages;

public record GetChatMessagesQuery(
    Guid ChatId, 
    DateTime? BeforeTimestamp = null, 
    int Take = 20) : IRequest<List<MessageDto>>;