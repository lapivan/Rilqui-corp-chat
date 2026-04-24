using FluentValidation;

namespace RilquiChat.Application.Features.Users.Commands.UpdateProfile;

public class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.Fullname)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.Fullname));
        
        RuleFor(u => u.Username)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(50);
    }
}