using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RilquiChat.Application.Features.Auth.Commands.Login;
using RilquiChat.Application.Features.Auth.Commands.Register;
using RilquiChat.Application.Features.Users.Commands.UpdateProfile;
using RilquiChat.Application.Features.Users.Queries.GetCurrentUser;
using RilquiChat.Application.Features.Users.Queries.SearchUsers;
using RilquiChat.Application.DTOs;

namespace RilquiChat.WebAPI.Controllers;

public class UserController : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<Guid>> Register(RegisterUserCommand command)
    {
        return Ok(await Mediator.Send(command));
    }
    
    [HttpPost("login")]
    public async Task<ActionResult<string>> Login(LoginUserCommand command)
    {
        return Ok(await Mediator.Send(command));
    }
    
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        return Ok(await Mediator.Send(new GetCurrentUserQuery()));
    }
    
    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile(UpdateProfileCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }
    
    [Authorize]
    [HttpGet("search")]
    public async Task<ActionResult<List<UserDto>>> Search([FromQuery] string term)
    {
        return Ok(await Mediator.Send(new SearchUsersQuery(term)));
    }
}