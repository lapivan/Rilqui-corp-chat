using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;
using Mapster;

namespace RilquiChat.Application.Features.Auth.Commands.Register;

public class RegisterUserHandler(
    IIdentityService identityService, 
    IUnitOfWork unitOfWork) : IRequestHandler<RegisterUserCommand, UserDto>
{
    public async Task<UserDto> Handle(RegisterUserCommand request, CancellationToken ct)
    {
        var userId = await identityService.CreateUserAsync(request.Username, request.Password, request.Email);
        
        var domainUser = new User(
            userId, 
            request.Username, 
            request.Fullname, 
            request.Email, 
            UserRole.User, 
            null);

        await unitOfWork.Users.AddAsync(domainUser, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return domainUser.Adapt<UserDto>();
    }
}