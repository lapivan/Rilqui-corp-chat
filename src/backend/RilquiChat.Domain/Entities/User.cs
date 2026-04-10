using RilquiChat.Domain.Common;
using RilquiChat.Domain.Enums;

namespace RilquiChat.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; private set; }
    public string Fullname { get; private set; }
    public string Email { get; private set; }
    public UserRole Role { get; private set; }
    public string? AvatarUrl { get; set; }

    private readonly List<ChatMember> _chatMembers = new();
    public virtual IReadOnlyCollection<ChatMember> ChatMembers => _chatMembers.AsReadOnly();

    private User() { }

    public User(string username, string fullname, string email, UserRole role, string? avatarUrl)
    {
        ValidateUsername(username);
        ValidateFullname(fullname);
        ValidateEmail(email);
        ValidateRole(role);
        ValidateAvatarUrl(avatarUrl);
        
        Username = username;
        Fullname = fullname;
        Email = email;
        Role = role;
        AvatarUrl = avatarUrl;
    }

    private void ValidateUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username)) throw new ArgumentException("Username cannot be null or whitespace.", nameof(username));
        if (username.Length < 3) throw new ArgumentException("Username must be at least 3 characters long.", nameof(username));
        if (username.Length > 50) throw new ArgumentException("Username cannot exceed 50 characters.", nameof(username));
        if (username.StartsWith("@")) throw new ArgumentException("Username cannot start with a '@' character.", nameof(username));
    }

    private void ValidateFullname(string fullname)
    {
        if (string.IsNullOrWhiteSpace(fullname)) throw new ArgumentException("Fullname cannot be null or whitespace.", nameof(fullname));
        if (fullname.Length < 2) throw new ArgumentException("Fullname must be at least 2 characters long.", nameof(fullname));
        if (fullname.Length > 100) throw new ArgumentException("Fullname cannot exceed 100 characters.", nameof(fullname));
    }

    private void ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email cannot be null or whitespace.", nameof(email));
        if (!email.Contains("@")) throw new ArgumentException("Invalid email format.", nameof(email));
    }

    private void ValidateRole(UserRole role)
    {
        if (!Enum.IsDefined(typeof(UserRole), role)) throw new ArgumentException("Invalid user role.", nameof(role));
    }

    private void ValidateAvatarUrl(string? avatarUrl)
    {
        if (avatarUrl != null && !Uri.TryCreate(avatarUrl, UriKind.Absolute, out _)) throw new ArgumentException("Invalid avatar URL format.", nameof(avatarUrl));
    }

    public void ChangeUsername(string username)
    {
        ValidateUsername(username);
        Username = username;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeFullname(string fullname)
    {
        ValidateFullname(fullname);
        Fullname = fullname;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeEmail(string email)
    {
        ValidateEmail(email);
        Email = email;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeRole(UserRole role)
    {
        ValidateRole(role);
        Role = role;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeAvatarUrl(string? avatarUrl)
    {
        ValidateAvatarUrl(avatarUrl);
        AvatarUrl = avatarUrl;
        UpdatedAt = DateTime.UtcNow;
    }
    
}