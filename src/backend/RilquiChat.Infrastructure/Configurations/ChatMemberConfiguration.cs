using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace RilquiChat.Infrastructure.Configurations;

public class ChatMemberConfiguration : IEntityTypeConfiguration<ChatMember>
{
    public void Configure(EntityTypeBuilder<ChatMember> builder)
    {
        builder.ToTable("ChatMembers");

        builder.HasKey(x => x.Id);
        
        builder.HasOne(m => m.User)
            .WithMany(u => u.ChatMembers)
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(m => m.Chat)
            .WithMany(c => c.Members)
            .HasForeignKey(c => c.ChatId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(m => new { m.UserId, m.ChatId }).IsUnique();
        
        builder.Property(m => m.LastReadMessageId)
            .IsRequired(false);

        builder.Property(m => m.Role)
            .IsRequired()
            .HasConversion<int>();
        
        builder.Property(m => m.JoinedAt)
            .IsRequired();
    }
}
