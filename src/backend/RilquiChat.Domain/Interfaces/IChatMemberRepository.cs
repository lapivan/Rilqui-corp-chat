using RilquiChat.Domain.Entities;

namespace RilquiChat.Domain.Interfaces;
public interface IChatMemberRepository 
{
    Task AddAsync(ChatMember member, CancellationToken ct);
    void Remove(ChatMember member);
    Task<ChatMember?> GetByChatAndUserAsync(Guid chatId, Guid userId, CancellationToken ct);
}