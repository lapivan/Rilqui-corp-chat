using Mapster;
using MediatR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Features.Auth.Commands.Login;

public class LoginUserHandler(
    IIdentityService identityService,
    IUnitOfWork unitOfWork,
    IJwtTokenGenerator tokenGenerator) : IRequestHandler<LoginUserCommand, AuthResponseDto>
{
    public async Task<AuthResponseDto> Handle(LoginUserCommand request, CancellationToken ct)
    {
        var (isValid, userId) = await identityService.ValidateUserAsync(request.Email, request.Password);
        
        if (!isValid)
            throw new Exception("Incorrect email or password.");
        
        var domainUser = await unitOfWork.Users.GetByIdAsync(userId, ct);
        if (domainUser == null)
            throw new Exception("User profile not found.");
        
        var token = tokenGenerator.GenerateToken(domainUser.Id, domainUser.Username);
        
        return new AuthResponseDto(
            domainUser.Adapt<UserDto>(),
            token);
    }
}