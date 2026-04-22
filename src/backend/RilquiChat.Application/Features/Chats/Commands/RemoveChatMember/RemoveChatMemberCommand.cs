using MediatR;

namespace RilquiChat.Application.Features.Chats.Commands.RemoveChatMember;

public record RemoveChatMemberCommand(Guid ChatId, Guid UserId) : IRequest<Unit>;