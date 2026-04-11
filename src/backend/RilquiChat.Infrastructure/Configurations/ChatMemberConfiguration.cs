using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace RilquiChat.Infrastructure.Configurations;

public class ChatMemberConfiguration : IEntityTypeConfiguration<ChatMember>
{
    public void Configure(EntityTypeBuilder<ChatMember> builder)
    {
        builder.ToTable("ChatMembers");

        builder.HasKey(x => x.Id);
        //TODO: complete the configuration implementation
    }
}
