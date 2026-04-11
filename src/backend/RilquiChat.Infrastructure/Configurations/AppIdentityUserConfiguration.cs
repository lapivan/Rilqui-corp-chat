using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RilquiChat.Infrastructure.Identity;

namespace RilquiChat.Infrastructure.Configurations;

public class AppIdentityUserConfiguration : IEntityTypeConfiguration<AppIdentityUser>
{
    public void Configure(EntityTypeBuilder<AppIdentityUser> builder)
    {
        builder.Property(u => u.Email)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(u => u.UserName)
            .HasMaxLength(256)
            .IsRequired();

        builder.HasOne<User>()
            .WithOne()
            .HasForeignKey<User>(u => u.Id)
            .OnDelete(DeleteBehavior.Cascade);
    }
}