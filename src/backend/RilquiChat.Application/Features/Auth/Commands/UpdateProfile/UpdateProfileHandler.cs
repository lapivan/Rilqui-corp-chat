using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Auth.Commands.UpdateProfile;

public class UpdateProfileHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<UpdateProfileCommand, UserDto>
{
    public async Task<UserDto> Handle(UpdateProfileCommand request, CancellationToken ct)
    {
        var userId = currentUserService.UserId 
                     ?? throw new UnauthorizedAccessException("User not authenticated.");
        
        var user = await unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null)
            throw new Exception("User profile not found.");
        
        if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.Username)
        {
            var isTaken = await unitOfWork.Users.GetByUsernameAsync(request.Username, ct);
            if (isTaken != null)
                throw new Exception("This username is already taken.");

            user.ChangeUsername(request.Username);
        }

        if (!string.IsNullOrWhiteSpace(request.Fullname))
        {
            user.ChangeFullname(request.Fullname);
        }

        if (request.AvatarUrl != user.AvatarUrl)
        {
            user.ChangeAvatarUrl(request.AvatarUrl);
        }
        await unitOfWork.SaveChangesAsync(ct);

        return user.Adapt<UserDto>();
    }
}