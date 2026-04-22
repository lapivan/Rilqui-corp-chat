using FluentValidation;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Enums;

namespace RilquiChat.Application.Features.Chats.Commands.CreateGroupOrChannel;

public class CreateGroupOrChannelValidator : AbstractValidator<ChatDetailDto>
{
    public CreateGroupOrChannelValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Chat title is required.")
            .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");

        RuleFor(x => x.Type)
            .Must(t => t == ChatType.Group || t == ChatType.Channel)
            .WithMessage("Invalid chat type for this command.");
    }
}