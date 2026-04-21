using FluentValidation;

namespace RilquiChat.Application.Features.Users.Queries.SearchUsers;

public class SearchUsersValidator : AbstractValidator<SearchUsersQuery>
{
    public SearchUsersValidator()
    {
        RuleFor(x => x.SearchTerm)
            .NotEmpty().WithMessage("Search term cannot be empty.")
            .MinimumLength(2).WithMessage("Enter at least 2 characters to search.");
    }
}