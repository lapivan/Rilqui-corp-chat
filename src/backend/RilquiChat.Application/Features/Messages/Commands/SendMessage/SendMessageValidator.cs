using FluentValidation;

namespace RilquiChat.Application.Features.Messages.Commands.SendMessage;

public class SendMessageValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Message content cannot be empty.")
            .MaximumLength(2000).WithMessage("Message is too long (max 2000 characters).");

        RuleFor(x => x.ChatId).NotEmpty();
    }
}