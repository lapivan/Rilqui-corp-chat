using FluentValidation;

namespace RilquiChat.Application.Features.Messages.Commands.EditMessage;

public class EditMessageValidator : AbstractValidator<EditMessageCommand>
{
    public EditMessageValidator()
    {
        RuleFor(x => x.NewContent)
            .NotEmpty().WithMessage("Message content cannot be empty.")
            .MaximumLength(2000).WithMessage("Message is too long.");
    }
}