using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using RilquiChat.Application.Common.Interfaces;

namespace RilquiChat.WebAPI.Hubs;

[Authorize]
public class ChatHub : Hub<IChatClient>
{
    public async Task JoinChat(Guid chatId) 
        => await Groups.AddToGroupAsync(Context.ConnectionId, chatId.ToString());

    public async Task LeaveChat(Guid chatId) 
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId.ToString());
    
    public async Task SendTyping(Guid chatId)
    {
        var username = Context.User?.Identity?.Name ?? "Unknown";
        await Clients.GroupExcept(chatId.ToString(), Context.ConnectionId)
            .UserIsTyping(chatId, username);
    }
}