using FluentValidation;
using MediatR;

namespace RilquiChat.Application.Features.Chats.Commands.RenameChat;

public class RenameChatValidator : AbstractValidator<RenameChatCommand>
{
    public RenameChatValidator()
    {
        RuleFor(x => x.NewTitle)
            .NotEmpty().WithMessage("New title cannot be empty.")
            .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");
    }
}