using Microsoft.EntityFrameworkCore;
using RilquiChat.Domain.Common;
using RilquiChat.Infrastructure.Data;
using System.Linq.Expressions;

namespace RilquiChat.Infrastructure.Repositories;

public abstract class RepositoryBase<T> where T: BaseEntity
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _entities;

    protected RepositoryBase(AppDbContext context)
    {
        _context = context;
        _entities = _context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id, 
        CancellationToken cancellationToken = default,
        params Expression<Func<T, object>>[]? includesProperties)
    {
        IQueryable<T>? query = _entities.AsQueryable();
        return await ApplyIncludes(query, includesProperties).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }
    
    public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> filter, 
        CancellationToken cancellationToken = default)
    {
        return await _entities.FirstOrDefaultAsync(filter, cancellationToken);
    }

    public async Task<IReadOnlyList<T>> ListAllAsync(CancellationToken cancellationToken = default)
    {
        return await _entities.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>> filter,
        CancellationToken cancellationToken = default,
        params Expression<Func<T, object>>[]? includesProperties)
    {
        IQueryable<T>? query = _entities.AsQueryable();
        query = ApplyIncludes(query, includesProperties);
        
        query = query.Where(filter);
        return await query.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _entities.AddAsync(entity, cancellationToken);
    }

    public Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        _context.Entry(entity).State = EntityState.Modified;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
    {
        _entities.Remove(entity);
        return Task.CompletedTask;
    }
    
    protected IQueryable<T> ApplyIncludes(IQueryable<T> query, params Expression<Func<T, object>>[]? includesProperties)
    {
        if (includesProperties != null && includesProperties.Any())
        {
            foreach (Expression<Func<T, object>>? included in includesProperties)
            {
                query = query.Include(included);
            }
        }
        return query;
    }
}