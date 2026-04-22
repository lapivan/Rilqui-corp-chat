using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Chats.Queries.GetUserChats;

public record GetUserChatsQuery() : IRequest<IReadOnlyCollection<ChatSummaryDto>>;