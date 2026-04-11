namespace RilquiChat.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IChatRepository Chats { get; }
    IMessageRepository Messages { get; }
    IUserRepository Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
    
}