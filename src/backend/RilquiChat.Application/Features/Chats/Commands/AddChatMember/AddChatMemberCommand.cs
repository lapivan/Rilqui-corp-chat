using MediatR;

namespace RilquiChat.Application.Features.Chats.Commands.AddChatMember;

public record AddChatMemberCommand(Guid UserId, Guid ChatId) : IRequest<Unit>;