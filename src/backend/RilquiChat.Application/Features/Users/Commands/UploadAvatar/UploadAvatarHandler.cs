using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Users.Commands.UploadAvatar;

public class UploadAvatarHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    IFileStorageService fileStorageService) : IRequestHandler<UploadAvatarCommand, string>
{
    public async Task<string> Handle(UploadAvatarCommand request, CancellationToken ct)
    {
        var userId = currentUserService.UserId 
                     ?? throw new UnauthorizedAccessException();

        var user = await unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null) throw new Exception("User not found.");

        var newAvatarUrl = await fileStorageService.UploadFileAsync(request.FileStream, request.FileName, ct);

        if (!string.IsNullOrEmpty(user.AvatarUrl))
        {
            await fileStorageService.DeleteFileAsync(user.AvatarUrl, ct);
        }
        
        user.ChangeAvatarUrl(newAvatarUrl);
        await unitOfWork.SaveChangesAsync(ct);

        return newAvatarUrl;
    }
}