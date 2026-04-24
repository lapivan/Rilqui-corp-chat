using MediatR;

namespace RilquiChat.Application.Features.Users.Commands.UploadAvatar;

public record UploadAvatarCommand(Stream FileStream, string FileName) : IRequest<string>;