using MediatR;
using RilquiChat.Application.DTOs;

namespace RilquiChat.Application.Features.Chats.Commands.CreateDirectChat;

public record CreateDirectChatCommand(Guid PartnerId) : IRequest<ChatDetailDto>;