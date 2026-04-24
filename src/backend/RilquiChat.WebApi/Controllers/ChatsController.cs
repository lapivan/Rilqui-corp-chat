using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RilquiChat.Application.DTOs;
using RilquiChat.Application.Features.Chats.Commands.AddChatMember;
using RilquiChat.Application.Features.Chats.Commands.CreateDirectChat;
using RilquiChat.Application.Features.Chats.Commands.CreateGroupOrChannel;
using RilquiChat.Application.Features.Chats.Commands.MarkAsRead;
using RilquiChat.Application.Features.Chats.Commands.RemoveChatMember;
using RilquiChat.Application.Features.Chats.Commands.RenameChat;
using RilquiChat.Application.Features.Chats.Queries.GetChatDetails;
using RilquiChat.Application.Features.Chats.Queries.GetUserChats;
using RilquiChat.Application.Features.Messages.Queries.GetPinnedMessages;

namespace RilquiChat.WebAPI.Controllers;

[Authorize]
public class ChatsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<ChatSummaryDto>>> GetMyChats()
    {
        return Ok(await Mediator.Send(new GetUserChatsQuery()));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ChatDetailDto>> GetDetails(Guid id)
    {
        return Ok(await Mediator.Send(new GetChatDetailsQuery(id)));
    }
    
    [HttpPost("direct")]
    public async Task<ActionResult<Guid>> CreateDirect(CreateDirectChatCommand command)
    {
        return Ok(await Mediator.Send(command));
    }
    
    [HttpPost("group")]
    public async Task<ActionResult<Guid>> CreateGroup(CreateGroupOrChannelCommand command)
    {
        return Ok(await Mediator.Send(command));
    }

    [HttpPost("{id:guid}/members")]
    public async Task<ActionResult> AddMember(Guid id, [FromBody] Guid userId)
    {
        return Ok(await Mediator.Send(new AddChatMemberCommand(userId, id)));
    }
    
    [HttpDelete("{id:guid}/members/{userId:guid}")]
    public async Task<ActionResult> RemoveMember(Guid id, Guid userId)
    {
        return Ok(await Mediator.Send(new RemoveChatMemberCommand(id, userId)));
    }

    [HttpPatch("{id:guid}/rename")]
    public async Task<ActionResult> Rename(Guid id, [FromBody] string newName)
    {
        return Ok(await Mediator.Send(new RenameChatCommand(id, newName)));
    }
    
    [HttpPost("{id:guid}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        return Ok(await Mediator.Send(new MarkAsReadCommand(id)));
    }
    [HttpGet("{id:guid}/pinned")]
    public async Task<ActionResult<List<MessageDto>>> GetPinnedMessages(Guid id)
    {
        return Ok(await Mediator.Send(new GetPinnedMessagesQuery(id)));
    }
}