using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace RilquiChat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    private IMediator? _mediator;
    
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>();
    
    protected Guid CurrentUserId => 
        User.Identity?.IsAuthenticated == true 
            ? Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!) 
            : Guid.Empty;
}