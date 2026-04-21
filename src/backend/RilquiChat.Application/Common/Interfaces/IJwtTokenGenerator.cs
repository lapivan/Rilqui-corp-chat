using RilquiChat.Domain.Entities;

namespace RilquiChat.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(Guid userId, string username);
}