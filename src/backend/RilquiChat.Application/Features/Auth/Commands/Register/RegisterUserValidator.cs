using FluentValidation;

namespace RilquiChat.Application.Features.Auth.Commands.Register;

public class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserValidator()
    {
        RuleFor(u => u.Username).NotEmpty().MinimumLength(3).MaximumLength(50);
        RuleFor(u => u.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Fullname).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).WithMessage("Password must be at least 6 characters.");
    }
}