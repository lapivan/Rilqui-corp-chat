using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace RilquiChat.Infrastructure.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("DomainUsers");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Username)
            .IsRequired()
            .HasMaxLength(50);
    
        builder.HasIndex(x => x.Username).IsUnique();

        builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(150);
        
        builder.HasIndex(x => x.Email).IsUnique();

        builder.Property(x => x.Fullname)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.AvatarUrl)
            .HasMaxLength(500)
            .IsRequired(false);

        builder.Property(x => x.Role)
            .IsRequired()
            .HasConversion<int>();
    }
}