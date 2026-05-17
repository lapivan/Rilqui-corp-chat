using Microsoft.AspNetCore.SignalR;
using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.DTOs;
using RilquiChat.WebAPI.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RilquiChat.WebApi.Services;

public class SignalRService(IHubContext<ChatHub, IChatClient> hubContext) : ISignalRService
{
    public async Task SendMessageAsync(IEnumerable<Guid> userIds, MessageDto message)
    {
        var stringIds = userIds.Select(id => id.ToString()).ToList();
        await hubContext.Clients.Users(stringIds).ReceiveMessage(message);
    }
    
    public async Task SendUpdateAsync(IEnumerable<Guid> userIds, MessageDto message)
    {
        var stringIds = userIds.Select(id => id.ToString()).ToList();
        await hubContext.Clients.Users(stringIds).MessageUpdated(message);
    }

    public async Task SendDeletionAsync(IEnumerable<Guid> userIds, Guid chatId, Guid messageId)
    {
        var stringIds = userIds.Select(id => id.ToString()).ToList();
        await hubContext.Clients.Users(stringIds).MessageDeleted(chatId, messageId);
    }

    public async Task SendMessagesReadAsync(IEnumerable<Guid> userIds, Guid chatId, Guid readerId, DateTime readAt)
    {
        var stringIds = userIds.Select(id => id.ToString()).ToList();
        await hubContext.Clients.Users(stringIds).MessagesRead(chatId, readerId, readAt);
    }

    public async Task NotifyChatCreatedAsync(Guid userId, ChatSummaryDto chat)
        => await hubContext.Clients.User(userId.ToString()).ChatCreated(chat);

    public async Task NotifyChatRenameAsync(IEnumerable<Guid> userIds, Guid chatId, string newName)
    {
        var stringIds = userIds.Select(id => id.ToString()).ToList();
        await hubContext.Clients.Users(stringIds).ChatUpdated(chatId, newName);
    }

    public async Task NotifyMemberChangeAsync(IEnumerable<Guid> userIds, Guid chatId, string username, bool joined)
    {
        var stringIds = userIds.Select(id => id.ToString()).ToList();
        if (joined) await hubContext.Clients.Users(stringIds).MemberJoined(chatId, username);
        else await hubContext.Clients.Users(stringIds).MemberLeft(chatId, username);
    }

    public async Task NotifyMemberRemovedAsync(Guid chatId, Guid userId)
        => await hubContext.Clients.User(userId.ToString()).ChatRemoved(chatId);

    public async Task NotifyMemberAddedAsync(Guid userId, ChatSummaryDto chatSummary)
        => await hubContext.Clients.User(userId.ToString()).ChatCreated(chatSummary);

    public async Task SendMessageToParticipantsAsync(IEnumerable<Guid> userIds, MessageDto message)
    {
        var stringIds = userIds.Select(id => id.ToString()).ToList();
        await hubContext.Clients.Users(stringIds).ReceiveMessage(message);
    }
    public async Task SendDeletionAsync(IEnumerable<Guid> userIds, Guid chatId, Guid messageId, MessageDto? nextLastMessage)
    {
        var stringIds = userIds.Select(id => id.ToString()).ToList();
        await hubContext.Clients.Users(stringIds).MessageDeleted(chatId, messageId, nextLastMessage);
    }
}