using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RilquiChat.Domain.Entities;

namespace RilquiChat.Infrastructure.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("Messages");
        
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Content)
            .IsRequired(false) 
            .HasMaxLength(4000);
        
        builder.Property(x => x.FileUrl)
            .HasMaxLength(1000);
        
        builder.Property(x => x.FileName)
            .HasMaxLength(255);
        
        builder.Property(x => x.FileSize)
            .IsRequired(false);
        
        builder.Property(x => x.Type)
            .HasConversion<int>()
            .IsRequired();
        
        builder.Property(x => x.IsPinned)
            .HasDefaultValue(false)
            .IsRequired();
        
        builder.HasOne(x => x.Chat)
            .WithMany(c => c.Messages)
            .HasForeignKey(x => x.ChatId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Sender)
            .WithMany()
            .HasForeignKey(x => x.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(x => x.ParentMessage)
            .WithMany()
            .HasForeignKey(x => x.ParentMessageId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(x => x.ChatId);
    }
}