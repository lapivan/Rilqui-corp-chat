using Microsoft.AspNetCore.SignalR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.WebAPI.Hubs;

namespace RilquiChat.WebApi.Services;

public class SignalRService(IHubContext<ChatHub, IChatClient> hubContext) : ISignalRService
{
    public async Task SendMessageAsync(Guid chatId, MessageDto message)
        => await hubContext.Clients.Group(chatId.ToString()).ReceiveMessage(message);

    public async Task SendUpdateAsync(Guid chatId, MessageDto message)
        => await hubContext.Clients.Group(chatId.ToString()).MessageUpdated(message);

    public async Task SendDeletionAsync(Guid chatId, Guid messageId)
        => await hubContext.Clients.Group(chatId.ToString()).MessageDeleted(chatId, messageId);

    public async Task SendMessagesReadAsync(Guid chatId, Guid readerId, DateTime readAt)
        => await hubContext.Clients.Group(chatId.ToString()).MessagesRead(chatId, readerId, readAt);

    public async Task NotifyChatCreatedAsync(Guid userId, ChatSummaryDto chat)
        => await hubContext.Clients.User(userId.ToString()).ChatCreated(chat);

    public async Task NotifyChatRenameAsync(Guid chatId, string newName)
        => await hubContext.Clients.Group(chatId.ToString()).ChatUpdated(chatId, newName);

    public async Task NotifyMemberChangeAsync(Guid chatId, string username, bool joined)
    {
        if (joined) await hubContext.Clients.Group(chatId.ToString()).MemberJoined(chatId, username);
        else await hubContext.Clients.Group(chatId.ToString()).MemberLeft(chatId, username);
    }
}