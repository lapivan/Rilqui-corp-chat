using System.Linq.Expressions;
using RilquiChat.Domain.Entities;

namespace RilquiChat.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, 
        CancellationToken cancellationToken = default, 
        params Expression<Func<User, object>>[]? includesProperties);

    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> FirstOrDefaultAsync(Expression<Func<User, bool>> filter,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<User>> ListAllAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<User>> ListAsync(Expression<Func<User, bool>> filter,
        CancellationToken cancellationToken = default,
        params Expression<Func<User, object>>[]? includesProperties);
    
    Task<IReadOnlyList<User>> SearchByTermAsync(string term, CancellationToken cancellationToken = default);

    Task AddAsync(User entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(User entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(User entity, CancellationToken cancellationToken = default);
}