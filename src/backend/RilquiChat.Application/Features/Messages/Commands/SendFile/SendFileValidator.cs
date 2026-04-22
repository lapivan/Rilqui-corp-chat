using FluentValidation;
using RilquiChat.Domain.Enums;

namespace RilquiChat.Application.Features.Messages.Commands.SendFile;

public class SendFileValidator : AbstractValidator<SendFileCommand>
{
    public SendFileValidator()
    {
        RuleFor(x => x.ChatId).NotEmpty();

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required.")
            .MaximumLength(255).WithMessage("File name is too long.");

        RuleFor(x => x.FileStream)
            .NotNull().WithMessage("File data is missing.")
            .Must(s => s.Length > 0).WithMessage("File cannot be empty.")
            .Must(s => s.Length <= 50 * 1024 * 1024)
            .WithMessage("File size exceeds the 50MB limit.");

        RuleFor(x => x.Type)
            .Must(t => t != MessageType.Text)
            .WithMessage("Use SendMessageCommand for text messages.");

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .Must((cmd, contentType) => 
                cmd.Type != MessageType.Voice || contentType.StartsWith("audio/"))
            .WithMessage("Voice messages must have an audio content type.");
        
        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description is too long.");
    }
}