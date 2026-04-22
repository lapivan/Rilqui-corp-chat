using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Chats.Queries.GetChatDetails;

public record GetChatDetailsQuery(Guid ChatId) : IRequest<ChatDetailDto>;