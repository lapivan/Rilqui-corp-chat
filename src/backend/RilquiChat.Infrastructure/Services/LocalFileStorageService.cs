using Microsoft.AspNetCore.Hosting;
using RilquiChat.Application.Common.Interfaces;

namespace RilquiChat.Infrastructure.Services;

public class LocalFileStorageService(IWebHostEnvironment env) : IFileStorageService
{
    private const string UploadsFolder = "uploads";

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, CancellationToken ct = default)
    {
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";

        var uploadsPath = Path.Combine(env.WebRootPath, UploadsFolder);
        
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        var filePath = Path.Combine(uploadsPath, uniqueFileName);
        
        using var targetStream = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(targetStream, ct);
        return $"/{UploadsFolder}/{uniqueFileName}";
    }

    public Task DeleteFileAsync(string fileUrl, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(fileUrl)) return Task.CompletedTask;
        
        var filePath = Path.Combine(env.WebRootPath, fileUrl.TrimStart('/'));

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }
}