using Microsoft.EntityFrameworkCore;
using RilquiChat.Infrastructure.Data;

namespace RilquiChat.Infrastructure.Repositories;

public class ChatMemberRepository(AppDbContext context) : IChatMemberRepository
{
    public async Task AddAsync(ChatMember member, CancellationToken ct) => 
        await context.Set<ChatMember>().AddAsync(member, ct);

    public void Remove(ChatMember member) => 
        context.Set<ChatMember>().Remove(member);

    public async Task<ChatMember?> GetByChatAndUserAsync(Guid chatId, Guid userId, CancellationToken ct) =>
        await context.Set<ChatMember>()
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.ChatId == chatId && m.UserId == userId, ct);
}