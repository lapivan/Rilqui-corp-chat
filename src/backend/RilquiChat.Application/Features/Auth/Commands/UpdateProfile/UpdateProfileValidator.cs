using FluentValidation;

namespace RilquiChat.Application.Features.Auth.Commands.UpdateProfile;

public class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.Fullname)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.Fullname));
        
        RuleFor(x => x.AvatarUrl)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .When(x => !string.IsNullOrEmpty(x.AvatarUrl))
            .WithMessage("Invalid avatar URL format.");
        
        RuleFor(u => u.Username)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(50);
    }
}