using Microsoft.EntityFrameworkCore;

namespace RilquiChat.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
    
    public DbSet<Chat> Chats { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        
    }
}