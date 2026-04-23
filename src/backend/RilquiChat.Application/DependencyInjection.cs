using System.Reflection;
using FluentValidation;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;
using RilquiChat.Application.Common.Behaviors;
using RilquiChat.Application.DTOs;
using RilquiChat.Domain.Entities;

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
        return services;
    }
}