using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RilquiChat.Application.DTOs;
using RilquiChat.Application.Features.Messages.Commands.DeleteMessage;
using RilquiChat.Application.Features.Messages.Commands.EditMessage;
using RilquiChat.Application.Features.Messages.Commands.PinMessage;
using RilquiChat.Application.Features.Messages.Commands.SendFile;
using RilquiChat.Application.Features.Messages.Commands.SendMessage;
using RilquiChat.Application.Features.Messages.Queries.GetChatMessages;
using RilquiChat.Application.Features.Messages.Queries.SearchMessages;
using RilquiChat.Domain.Enums;

namespace RilquiChat.WebAPI.Controllers;

[Authorize]
public class MessagesController : BaseApiController
{
    [HttpGet("{chatId:guid}")]
    public async Task<ActionResult<List<MessageDto>>> GetHistory(
        Guid chatId, 
        [FromQuery] DateTime? before = null, 
        [FromQuery] int take = 20)
    {
        return Ok(await Mediator.Send(new GetChatMessagesQuery(chatId, before, take)));
    }

    [HttpPost("file")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<MessageDto>> SendFile([FromForm] SendFileRequest request)
    {
        var messageType = request.File.ContentType.ToLower().StartsWith("audio/") 
            ? MessageType.Voice 
            : MessageType.File;

        using var stream = request.File.OpenReadStream();
        
        var command = new SendFileCommand(
            request.ChatId, 
            stream, 
            request.File.FileName, 
            request.File.ContentType, 
            messageType, 
            request.Description, 
            request.ParentMessageId);
        
        return Ok(await Mediator.Send(command));
    }
    [HttpPost]
    public async Task<ActionResult<MessageDto>> Send(SendMessageCommand command)
    {
        return Ok(await Mediator.Send(command));
    }
    
    
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MessageDto>> Edit(Guid id, [FromBody] string newContent)
    {
        return Ok(await Mediator.Send(new EditMessageCommand(id, newContent)));
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteMessageCommand(id));
        return NoContent();
    }

    [HttpPatch("{id:guid}/pin")]
    public async Task<ActionResult> Pin(Guid id)
    {
        await Mediator.Send(new PinMessageCommand(id));
        return Ok();
    }

    [HttpPatch("{id:guid}/unpin")]
    public async Task<ActionResult> Unpin(Guid id)
    {
        await Mediator.Send(new UnpinMessageCommand(id));
        return Ok();
    }
    
    [HttpGet("{chatId:guid}/search")]
    public async Task<ActionResult<List<MessageDto>>> Search(Guid chatId, [FromQuery] string query)
    {
        return Ok(await Mediator.Send(new SearchMessagesQuery(chatId, query)));
    }
    public class SendFileRequest
    {
        public Guid ChatId { get; set; }
        public IFormFile File { get; set; } = null!;
        public string? Description { get; set; }
        public Guid? ParentMessageId { get; set; }
    }
}