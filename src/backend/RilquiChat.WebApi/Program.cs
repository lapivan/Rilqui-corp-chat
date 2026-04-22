using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Infrastructure;
using RilquiChat.WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddOpenApi();
builder.Services.AddScoped<ISignalRService, SignalRService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.Run();