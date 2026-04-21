namespace RilquiChat.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<(bool IsValid, Guid UserId)> ValidateUserAsync(string email, string password);
    Task<Guid> CreateUserAsync(string username, string password, string email);
    Task<bool> UserExistsAsync(string email);
}