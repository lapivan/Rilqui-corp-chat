using System.Linq.Expressions;
using RilquiChat.Domain.Entities;

namespace RilquiChat.Domain.Interfaces;

public interface IMessageRepository
{
    Task<Message?> GetByIdAsync(Guid id, 
        CancellationToken cancellationToken = default, 
        params Expression<Func<Message, object>>[]? includesProperties);

    Task<Message?> FirstOrDefaultAsync(Expression<Func<Message, bool>> filter,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Message>> ListAllAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Message>> ListAsync(Expression<Func<Message, bool>> filter,
        CancellationToken cancellationToken = default,
        params Expression<Func<Message, object>>[]? includesProperties);
    
    Task<IReadOnlyList<Message>> GetPagedChatMessagesAsync(Guid chatId, int skip, int take, CancellationToken cancellationToken = default);
    
    Task<IReadOnlyList<Message>> SearchInChatAsync(Guid chatId, string searchTerm, CancellationToken cancellationToken = default);
    
    Task<IReadOnlyList<Message>> GlobalSearchAsync(Guid userId, string searchTerm, CancellationToken cancellationToken = default);
    
    Task<IReadOnlyList<Message>> GetPinnedMessagesAsync(Guid chatId, CancellationToken cancellationToken = default);

    Task AddAsync(Message entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Message entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Message entity, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Message>> GetPagedMessagesAsync(Guid chatId, DateTime? beforeTimestamp, int take, CancellationToken ct);
}