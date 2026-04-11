using Microsoft.EntityFrameworkCore;
using RilquiChat.Infrastructure.Data;

namespace RilquiChat.Infrastructure.Repositories;

public class UserRepository(AppDbContext context) : RepositoryBase<User>(context), IUserRepository
{
    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _entities.FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _entities.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<IReadOnlyList<User>> SearchByTermAsync(string term, CancellationToken cancellationToken = default)
    {
        var lowerTerm = term.ToLower();
        return await _entities.Where(u => u.Username.ToLower().Contains(lowerTerm) || u.Fullname.ToLower().Contains(lowerTerm))
            .ToListAsync(cancellationToken);
    }
}