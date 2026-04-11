using Microsoft.EntityFrameworkCore;
using RilquiChat.Infrastructure.Data;

namespace RilquiChat.Infrastructure.Repositories;

public class MessageRepository(AppDbContext context) : RepositoryBase<Message>(context), IMessageRepository
{
    public async Task<IReadOnlyList<Message>> GetPagedChatMessagesAsync(Guid chatId, int skip, int take, CancellationToken cancellationToken = default)
    {
        return await _entities
            .Where(m => m.ChatId == chatId)
            .OrderByDescending(m => m.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Message>> SearchInChatAsync(Guid chatId, string searchTerm, CancellationToken cancellationToken = default)
    {
        var lowerTerm = searchTerm.ToLower();

        return await _entities
            .Where(m => m.ChatId == chatId)
            .Where(m => (m.Content != null && m.Content.ToLower().Contains(lowerTerm)) || 
                        (m.FileName != null && m.FileName.ToLower().Contains(lowerTerm)))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Message>> GlobalSearchAsync(Guid userId, string searchTerm, CancellationToken cancellationToken = default)
    {
        var lowerTerm = searchTerm.ToLower();
        return await _entities
            .Where(m => m.Chat.Members.Any(member => member.UserId == userId))
            .Where(m => (m.Content != null && m.Content.ToLower().Contains(lowerTerm)) || 
                        (m.FileName != null && m.FileName.ToLower().Contains(lowerTerm)))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Message>> GetPinnedMessagesAsync(Guid chatId, CancellationToken cancellationToken = default)
    {
        return await _entities
            .Where(m => m.ChatId == chatId && m.IsPinned)
            .OrderByDescending(m => m.CreatedAt) 
            .ToListAsync(cancellationToken);
    }
}