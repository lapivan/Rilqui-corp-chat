using System.Reflection;
using FluentValidation;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;
using RilquiChat.Application.Common.Behaviors;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Enums;

namespace RilquiChat.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();
        
        services.AddMediatR(cfg => {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            cfg.AddOpenBehavior(typeof(TransactionBehavior<,>));
        });
        
        services.AddValidatorsFromAssembly(assembly);
        
        var config = TypeAdapterConfig.GlobalSettings;
        config.Scan(assembly);
        services.AddSingleton(config);
        services.AddScoped<IMapper, ServiceMapper>();
        TypeAdapterConfig<ChatMember, ChatMemberDto>.NewConfig()
            .Map(dest => dest.Username, src => src.User.Username)
            .Map(dest => dest.Fullname, src => src.User.Fullname)
            .Map(dest => dest.AvatarUrl, src => src.User.AvatarUrl);

        TypeAdapterConfig<Message, MessageDto>.NewConfig()
            .Map(dest => dest.SenderName, src => 
                !string.IsNullOrEmpty(src.Sender.Fullname) 
                    ? src.Sender.Fullname 
                    : src.Sender.Username);
        
        TypeAdapterConfig<Message, MessageDto>.NewConfig()
            .Map(dest => dest.SenderName, src => 
                src.Sender != null 
                    ? (!string.IsNullOrWhiteSpace(src.Sender.Fullname) ? src.Sender.Fullname : src.Sender.Username) 
                    : null)
            .Map(dest => dest.SenderId, src => src.SenderId);
        
        
        TypeAdapterConfig<ChatMember, ChatMemberDto>.NewConfig()
            .Map(dest => dest.Username, src => src.User.Username)
            .Map(dest => dest.Fullname, src => src.User.Fullname)
            .Map(dest => dest.AvatarUrl, src => src.User.AvatarUrl);

        TypeAdapterConfig<Message, MessageDto>.NewConfig()
            .Map(dest => dest.SenderName, src => 
                src.Sender != null 
                    ? (!string.IsNullOrWhiteSpace(src.Sender.Fullname) ? src.Sender.Fullname : src.Sender.Username) 
                    : null);
        
        TypeAdapterConfig<Chat, ChatSummaryDto>.NewConfig()
            .Map(dest => dest.LastMessage, src => src.Messages
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefault())

            .Map(dest => dest.UnreadCount, src => MapContext.Current!.Parameters.ContainsKey("UserId") 
                ? src.Messages.Count(m => 
                    m.CreatedAt > src.Members.First(me => me.UserId == (Guid)MapContext.Current!.Parameters["UserId"]).LastReadAt &&
                    m.SenderId != (Guid)MapContext.Current!.Parameters["UserId"])
                : 0)
            .Map(dest => dest.Title, src => src.Type == ChatType.Direct && string.IsNullOrEmpty(src.Title)
                ? GetDirectChatTitle(src, (Guid)MapContext.Current!.Parameters["UserId"])
                : src.Title);
        return services;
    }
    
    private static string GetDirectChatTitle(Chat chat, Guid currentUserId)
    {
        var other = chat.Members.FirstOrDefault(m => m.UserId != currentUserId);
        if (other?.User == null) return "Deleted User";
        return !string.IsNullOrWhiteSpace(other.User.Fullname) ? other.User.Fullname : other.User.Username;
    }
}
