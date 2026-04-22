using MediatR;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Enums;

namespace RilquiChat.Application.Features.Chats.Commands.CreateGroupOrChannel;

public record CreateGroupOrChannelCommand(string ChatName, ChatType Type) : IRequest<ChatDetailDto>;