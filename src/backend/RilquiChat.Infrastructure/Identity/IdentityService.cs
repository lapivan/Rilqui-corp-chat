using Microsoft.AspNetCore.Identity;
using RilquiChat.Application.Common.Interfaces;

namespace RilquiChat.Infrastructure.Identity;

public class IdentityService(
    UserManager<AppIdentityUser> userManager,
    SignInManager<AppIdentityUser> signInManager) : IIdentityService
{
    public async Task<(bool IsValid, Guid UserId)> ValidateUserAsync(string email, string password)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null) 
            return (false, Guid.Empty);
        var result = await signInManager.CheckPasswordSignInAsync(user, password, false);
        
        if (!result.Succeeded)
            return (false, Guid.Empty);

        return (true, user.Id);
    }

    public async Task<Guid> CreateUserAsync(string username, string password, string email)
    {
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser != null)
            throw new Exception("User with this email already exists.");

        var user = new AppIdentityUser 
        { 
            Id = Guid.NewGuid(), 
            UserName = username, 
            Email = email 
        };

        var result = await userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Identity registration failed: {errors}");
        }

        return user.Id;
    }

    public async Task<bool> UserExistsAsync(string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        return user != null;
    }
}