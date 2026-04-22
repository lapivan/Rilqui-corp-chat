using MediatR;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Enums;

namespace RilquiChat.Application.Features.Messages.Commands.SendFile;

public record SendFileCommand(
    Guid ChatId,
    Stream FileStream,
    string FileName,
    string ContentType,
    MessageType Type,   
    string? Description = null) : IRequest<MessageDto>;