using FluentValidation;

namespace RilquiChat.Application.Features.Chats.Commands.AddChatMember;

public class AddChatMemberValidator : AbstractValidator<AddChatMemberCommand>
{
    public AddChatMemberValidator()
    {
        RuleFor(command => command.ChatId).NotEmpty();
        RuleFor(command => command.UserId).NotEmpty();
    }
}