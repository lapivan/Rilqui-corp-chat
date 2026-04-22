using FluentValidation;

namespace RilquiChat.Application.Features.Chats.Commands.RemoveChatMember;

public class RemoveChatMemberValidator : AbstractValidator<RemoveChatMemberCommand>
{
    public RemoveChatMemberValidator()
    {
        RuleFor(c => c.ChatId)
            .NotEmpty();
        
        RuleFor(c => c.UserId)
            .NotEmpty();
    }
}