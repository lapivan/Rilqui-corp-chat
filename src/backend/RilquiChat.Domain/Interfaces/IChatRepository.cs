using System.Linq.Expressions;
using RilquiChat.Domain.Entities;

namespace RilquiChat.Domain.Interfaces;

public interface IChatRepository
{
    Task<Chat?> GetByIdAsync(Guid id, 
        CancellationToken cancellationToken = default, 
        params Expression<Func<Chat, object>>[]? includesProperties);

    Task<Chat?> FirstOrDefaultAsync(Expression<Func<Chat, bool>> filter,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Chat>> ListAllAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Chat>> ListAsync(Expression<Func<Chat, bool>> filter,
        CancellationToken cancellationToken = default,
        params Expression<Func<Chat, object>>[]? includesProperties);
    
    Task<IReadOnlyList<Chat>> GetUserChatsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Chat?> GetDirectChatByUsersAsync(Guid userId1, Guid userId2, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Chat>> SearchByTermAsync(string term, CancellationToken cancellationToken = default);

    Task AddAsync(Chat entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Chat entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Chat entity, CancellationToken cancellationToken = default);
}