using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace RilquiChat.Infrastructure.Configurations;

public class ChatConfiguration : IEntityTypeConfiguration<Chat>
{
    public void Configure(EntityTypeBuilder<Chat> builder)
    {
        builder.ToTable("Chats");

        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Title)
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<int>();
        
        builder.Metadata
            .FindNavigation(nameof(Chat.Members))?
            .SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.Metadata
            .FindNavigation(nameof(Chat.Messages))?
            .SetPropertyAccessMode(PropertyAccessMode.Field);
        
        builder.HasIndex(x => x.Type);
    }
}