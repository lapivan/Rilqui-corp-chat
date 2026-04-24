using Microsoft.EntityFrameworkCore;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;
using RilquiChat.Infrastructure.Data;

namespace RilquiChat.Infrastructure.Repositories;

public class ChatRepository(AppDbContext context) : RepositoryBase<Chat>(context), IChatRepository
{
    public async Task<Chat?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _entities
            .Include(c => c.Members)
            .ThenInclude(m => m.User)
            .Include(c => c.Messages)
            .ThenInclude(m => m.Sender)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Chat>> GetUserChatsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _entities
            .Include(c => c.Members)
            .ThenInclude(m => m.User)
            .Include(c => c.Messages) 
            .Where(c => c.Members.Any(m => m.UserId == userId))
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Chat?> GetDirectChatByUsersAsync(Guid userId1, Guid userId2, CancellationToken cancellationToken = default)
    {
        return await _entities
            .Where(c => c.Type == ChatType.Direct)
            .Where(c => c.Members.Any(m => m.UserId == userId1) && 
                        c.Members.Any(m => m.UserId == userId2))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Chat>> SearchByTermAsync(string term, CancellationToken cancellationToken = default)
    {
        var lowerTerm = term.ToLower();
        return await _entities
            .Where(c => c.Title != null && c.Title.ToLower().Contains(lowerTerm))
            .ToListAsync(cancellationToken);
    }
}