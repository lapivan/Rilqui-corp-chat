using MediatR;

namespace RilquiChat.Application.Features.Chats.Commands.RenameChat;

public record RenameChatCommand(Guid ChatId, string NewTitle) : IRequest<Unit>;