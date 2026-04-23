using Microsoft.EntityFrameworkCore.Storage;
using RilquiChat.Domain.Interfaces;
using RilquiChat.Infrastructure.Data;

namespace RilquiChat.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IDbContextTransaction? _currentTransaction;
    
    private readonly Lazy<IUserRepository> _userRepository;
    private readonly Lazy<IChatRepository> _chatRepository;
    private readonly Lazy<IMessageRepository> _messageRepository;
    private readonly Lazy<IChatMemberRepository> _chatMemberRepository;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        _userRepository = new Lazy<IUserRepository>(() => new UserRepository(_context));
        _chatRepository = new Lazy<IChatRepository>(() => new ChatRepository(_context));
        _messageRepository = new Lazy<IMessageRepository>(() => new MessageRepository(_context));
        _chatMemberRepository = new Lazy<IChatMemberRepository>(() => new ChatMemberRepository(_context));
    }

    public IUserRepository Users => _userRepository.Value;
    public IChatRepository Chats => _chatRepository.Value;
    public IMessageRepository Messages => _messageRepository.Value;
    public IChatMemberRepository ChatMembers => _chatMemberRepository.Value;

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync()
    {
        if (_currentTransaction != null) return;
        _currentTransaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
            if (_currentTransaction != null)
            {
                await _currentTransaction.CommitAsync();
            }
        }
        catch
        {
            await RollbackTransactionAsync();
            throw;
        }
        finally
        {
            if (_currentTransaction != null)
            {
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_currentTransaction != null)
        {
            await _currentTransaction.RollbackAsync();
            _currentTransaction.Dispose();
            _currentTransaction = null;
        }
    }

    public void Dispose()
    {
        _currentTransaction?.Dispose();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}