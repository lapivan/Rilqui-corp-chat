using FluentValidation;

namespace RilquiChat.Application.Features.Chats.Commands.CreateDirectChat;

public class CreateDirectChatValidator : AbstractValidator<CreateDirectChatCommand>
{
    public CreateDirectChatValidator()
    {
        RuleFor(x => x.PartnerId)
            .NotEmpty()
            .WithMessage("Partner ID is required");
    }
}