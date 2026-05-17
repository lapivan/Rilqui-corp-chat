using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;
using MediatR;

using RilquiChat.Application.Common.Interfaces;
using RilquiChat.Application.Features.Auth.Commands.Login;
using RilquiChat.Application.Features.Auth.Commands.Register;
using RilquiChat.Application.Features.Chats.Commands.AddChatMember;
using RilquiChat.Application.Features.Chats.Commands.CreateDirectChat;
using RilquiChat.Application.Features.Chats.Commands.CreateGroupOrChannel;
using RilquiChat.Application.Features.Chats.Commands.RemoveChatMember;
using RilquiChat.Application.Features.Chats.Commands.RenameChat;
using RilquiChat.Application.Features.Chats.Queries.GetChatDetails;
using RilquiChat.Application.Features.Chats.Queries.GetUserChats;
using RilquiChat.Application.Features.Messages.Commands.DeleteMessage;
using RilquiChat.Application.Features.Messages.Commands.EditMessage;
using RilquiChat.Application.Features.Messages.Commands.SendFile;
using RilquiChat.Application.Features.Messages.Commands.SendMessage;
using RilquiChat.Application.Features.Messages.Queries.GetChatMessages;
using RilquiChat.Application.Features.Users.Commands.UpdateProfile;
using RilquiChat.Application.Features.Users.Commands.UploadAvatar;
using RilquiChat.Application.Features.Users.Queries.GetCurrentUser;
using RilquiChat.Application.Features.Users.Queries.SearchUsers;
using RilquiChat.Domain.Entities;
using RilquiChat.Domain.Enums;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Tests;

public static class TestData
{
    public static User CreateUser(string username = "john") =>
        new(
            Guid.NewGuid(),
            username,
            "John Doe",
            $"{username}@test.com",
            UserRole.User,
            null);

    public static Message CreateMessage() =>
        new("hello", Guid.NewGuid(), Guid.NewGuid());
}

public class LoginUserHandlerTests
{
    [Fact]
    public async Task Handle_Should_Return_Auth_Response()
    {
        var identity = new Mock<IIdentityService>();
        var uow = new Mock<IUnitOfWork>();
        var token = new Mock<IJwtTokenGenerator>();
        var users = new Mock<IUserRepository>();

        var user = TestData.CreateUser();

        identity
            .Setup(x => x.ValidateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((true, user.Id));

        users
            .Setup(x => x.GetByIdAsync(user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        uow.Setup(x => x.Users).Returns(users.Object);

        token
            .Setup(x => x.GenerateToken(user.Id, user.Username))
            .Returns(Guid.NewGuid().ToString());

        var handler = new LoginUserHandler(identity.Object, uow.Object, token.Object);

        var result = await handler.Handle(
            new LoginUserCommand(user.Email, "123456"),
            CancellationToken.None);

        result.Should().NotBeNull();
        result.User.Username.Should().Be(user.Username);
    }
}

public class SearchUsersHandlerTests
{
    [Fact]
    public async Task Handle_Should_Return_Users()
    {
        var uow = new Mock<IUnitOfWork>();
        var current = new Mock<ICurrentUserService>();
        var users = new Mock<IUserRepository>();

        current.Setup(x => x.UserId).Returns(Guid.NewGuid());

        users
            .Setup(x => x.SearchByTermAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User>
            {
                TestData.CreateUser()
            });

        uow.Setup(x => x.Users).Returns(users.Object);

        var handler = new SearchUsersHandler(uow.Object, current.Object);

        var result = await handler.Handle(
            new SearchUsersQuery("john"),
            CancellationToken.None);

        result.Should().HaveCount(1);
    }
}


public class RenameChatHandlerTests
{
    [Fact]
    public async Task Handle_Should_Rename_Chat()
    {
        var uow = new Mock<IUnitOfWork>();
        var current = new Mock<ICurrentUserService>();
        var signalr = new Mock<ISignalRService>();
        var chats = new Mock<IChatRepository>();

        var admin = TestData.CreateUser("admin");

        var chat = new Chat("old-name", ChatType.Group);
        chat.AddMember(admin, UserRole.Admin);

        current.Setup(x => x.UserId).Returns(admin.Id);

        chats
            .Setup(x => x.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Chat, object>>[]>()))
            .ReturnsAsync(chat);

        uow.Setup(x => x.Chats).Returns(chats.Object);

        var handler = new RenameChatHandler(
            uow.Object,
            current.Object,
            signalr.Object);

        await handler.Handle(
            new RenameChatCommand(Guid.NewGuid(), "new-name"),
            CancellationToken.None);

        chat.Title.Should().Be("new-name");
    }
}



public class SendFileHandlerTests
{
    [Fact]
    public async Task Handle_Should_Send_File()
    {
        var uow = new Mock<IUnitOfWork>();
        var current = new Mock<ICurrentUserService>();
        var storage = new Mock<IFileStorageService>();
        var signalr = new Mock<ISignalRService>();

        var chats = new Mock<IChatRepository>();
        var users = new Mock<IUserRepository>();
        var messages = new Mock<IMessageRepository>();

        var user = TestData.CreateUser();

        var chat = new Chat("group", ChatType.Group);
        chat.AddMember(user, UserRole.User);

        current.Setup(x => x.UserId).Returns(user.Id);

        chats
            .Setup(x => x.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Chat, object>>[]>()))
            .ReturnsAsync(chat);

        users
            .Setup(x => x.GetByIdAsync(user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        storage
            .Setup(x => x.UploadFileAsync(
                It.IsAny<Stream>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync("https://cdn/file.png");

        uow.Setup(x => x.Chats).Returns(chats.Object);
        uow.Setup(x => x.Users).Returns(users.Object);
        uow.Setup(x => x.Messages).Returns(messages.Object);

        var handler = new SendFileHandler(
            uow.Object,
            current.Object,
            storage.Object,
            signalr.Object);

        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        var result = await handler.Handle(
            new SendFileCommand(
                Guid.NewGuid(),
                stream,
                "file.png",
                "image/png",
                MessageType.File,
                "description"),
            CancellationToken.None);

        result.Should().NotBeNull();
    }
}

public class GetChatMessagesHandlerTests
{
    [Fact]
    public async Task Handle_Should_Return_Messages()
    {
        var uow = new Mock<IUnitOfWork>();
        var current = new Mock<ICurrentUserService>();

        var chats = new Mock<IChatRepository>();
        var messages = new Mock<IMessageRepository>();

        var user = TestData.CreateUser();

        var chat = new Chat("group", ChatType.Group);
        chat.AddMember(user, UserRole.User);

        current.Setup(x => x.UserId).Returns(user.Id);

        chats
            .Setup(x => x.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Chat, object>>[]>()))
            .ReturnsAsync(chat);

        messages
            .Setup(x => x.GetPagedMessagesAsync(
                It.IsAny<Guid>(),
                It.IsAny<DateTime>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Message>
            {
                TestData.CreateMessage()
            });

        uow.Setup(x => x.Chats).Returns(chats.Object);
        uow.Setup(x => x.Messages).Returns(messages.Object);

        var handler = new GetChatMessagesHandler(
            uow.Object,
            current.Object);

        var result = await handler.Handle(
            new GetChatMessagesQuery(Guid.NewGuid(), It.IsAny<DateTime>(), 20),
            CancellationToken.None);

        result.Should().HaveCount(1);
    }
}

public class UploadAvatarHandlerTests
{
    [Fact]
    public async Task Handle_Should_Upload_Avatar()
    {
        var uow = new Mock<IUnitOfWork>();
        var current = new Mock<ICurrentUserService>();
        var storage = new Mock<IFileStorageService>();
        var users = new Mock<IUserRepository>();

        var user = TestData.CreateUser();

        current.Setup(x => x.UserId).Returns(user.Id);

        users
            .Setup(x => x.GetByIdAsync(user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        storage
            .Setup(x => x.UploadFileAsync(
                It.IsAny<Stream>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync("https://cdn/avatar.png");

        uow.Setup(x => x.Users).Returns(users.Object);

        var handler = new UploadAvatarHandler(
            uow.Object,
            current.Object,
            storage.Object);

        using var stream = new MemoryStream(new byte[] { 1, 2, 3 });

        var result = await handler.Handle(
            new UploadAvatarCommand(stream, "avatar.png"),
            CancellationToken.None);

        result.Should().NotBeNull();
    }
    public class UserDomainTests
{
    [Fact]
    public void Constructor_Should_Create_Valid_User()
    {
        var user = new User(
            Guid.NewGuid(),
            "john123",
            "John Doe",
            "john@test.com",
            UserRole.User,
            null);

        user.Username.Should().Be("john123");
        user.Fullname.Should().Be("John Doe");
        user.Email.Should().Be("john@test.com");
        user.Role.Should().Be(UserRole.User);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("ab")]
    [InlineData("@admin")]
    public void Constructor_Should_Throw_When_Username_Invalid(string username)
    {
        var act = () => new User(
            Guid.NewGuid(),
            username,
            "John Doe",
            "john@test.com",
            UserRole.User,
            null);

        act.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("a")]
    public void Constructor_Should_Throw_When_Fullname_Invalid(string fullname)
    {
        var act = () => new User(
            Guid.NewGuid(),
            "john123",
            fullname,
            "john@test.com",
            UserRole.User,
            null);

        act.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid-email")]
    [InlineData("test.com")]
    public void Constructor_Should_Throw_When_Email_Invalid(string email)
    {
        var act = () => new User(
            Guid.NewGuid(),
            "john123",
            "John Doe",
            email,
            UserRole.User,
            null);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Constructor_Should_Throw_When_Username_Too_Long()
    {
        var username = new string('a', 51);

        var act = () => new User(
            Guid.NewGuid(),
            username,
            "John Doe",
            "john@test.com",
            UserRole.User,
            null);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Constructor_Should_Throw_When_Fullname_Too_Long()
    {
        var fullname = new string('a', 101);

        var act = () => new User(
            Guid.NewGuid(),
            "john123",
            fullname,
            "john@test.com",
            UserRole.User,
            null);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void ChangeUsername_Should_Update_Username()
    {
        var user = CreateUser();

        user.ChangeUsername("new_username");

        user.Username.Should().Be("new_username");
    }

    [Fact]
    public void ChangeFullname_Should_Update_Fullname()
    {
        var user = CreateUser();

        user.ChangeFullname("New Fullname");

        user.Fullname.Should().Be("New Fullname");
    }

    [Fact]
    public void ChangeEmail_Should_Update_Email()
    {
        var user = CreateUser();

        user.ChangeEmail("new@test.com");

        user.Email.Should().Be("new@test.com");
    }

    [Fact]
    public void ChangeRole_Should_Update_Role()
    {
        var user = CreateUser();

        user.ChangeRole(UserRole.Admin);

        user.Role.Should().Be(UserRole.Admin);
    }

    [Theory]
    [InlineData("/avatars/user.png")]
    [InlineData("https://cdn.test.com/avatar.png")]
    public void ChangeAvatarUrl_Should_Update_Avatar(string avatar)
    {
        var user = CreateUser();

        user.ChangeAvatarUrl(avatar);

        user.AvatarUrl.Should().Be(avatar);
    }

    [Theory]
    [InlineData("avatar")]
    public void ChangeAvatarUrl_Should_Throw_When_Invalid(string avatar)
    {
        var user = CreateUser();

        var act = () => user.ChangeAvatarUrl(avatar);

        act.Should().Throw<ArgumentException>();
    }

    private static User CreateUser() =>
        new(
            Guid.NewGuid(),
            "john123",
            "John Doe",
            "john@test.com",
            UserRole.User,
            null);
}

public class ChatDomainTests
{
    [Fact]
    public void Constructor_Should_Create_Group_Chat()
    {
        var chat = new Chat("Developers", ChatType.Group);

        chat.Title.Should().Be("Developers");
        chat.Type.Should().Be(ChatType.Group);
    }

    [Fact]
    public void Constructor_Should_Create_Direct_Chat()
    {
        var chat = new Chat(null, ChatType.Direct);

        chat.Type.Should().Be(ChatType.Direct);
        chat.Title.Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void Constructor_Should_Throw_When_Group_Title_Empty(string title)
    {
        var act = () => new Chat(title, ChatType.Group);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Constructor_Should_Throw_When_Title_Too_Long()
    {
        var title = new string('a', 101);

        var act = () => new Chat(title, ChatType.Group);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Rename_Should_Update_Title()
    {
        var chat = new Chat("Old", ChatType.Group);

        chat.Rename("New");

        chat.Title.Should().Be("New");
    }

    [Fact]
    public void Rename_Should_Throw_For_Direct_Chat()
    {
        var chat = new Chat(null, ChatType.Direct);

        var act = () => chat.Rename("New");

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void AddMember_Should_Add_User()
    {
        var chat = new Chat("Developers", ChatType.Group);
        var user = CreateUser();

        chat.AddMember(user, UserRole.User);

        chat.Members.Should().HaveCount(1);
    }

    [Fact]
    public void AddMember_Should_Throw_When_Duplicate()
    {
        var chat = new Chat("Developers", ChatType.Group);
        var user = CreateUser();

        chat.AddMember(user, UserRole.User);

        var act = () => chat.AddMember(user, UserRole.User);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Direct_Chat_Should_Not_Have_More_Than_2_Members()
    {
        var chat = new Chat(null, ChatType.Direct);

        chat.AddMember(CreateUser("user1"), UserRole.User);
        chat.AddMember(CreateUser("user2"), UserRole.User);

        var act = () =>
            chat.AddMember(CreateUser("user3"), UserRole.User);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void RemoveMember_Should_Remove_User()
    {
        var chat = new Chat("Group", ChatType.Group);
        var user = CreateUser();

        chat.AddMember(user, UserRole.User);

        chat.RemoveMember(user.Id);

        chat.Members.Should().BeEmpty();
    }

    [Fact]
    public void RemoveMember_Should_Do_Nothing_When_User_Not_Exists()
    {
        var chat = new Chat("Group", ChatType.Group);

        var act = () => chat.RemoveMember(Guid.NewGuid());

        act.Should().NotThrow();
    }

    [Fact]
    public void RemoveMember_Should_Throw_For_Direct_Chat()
    {
        var chat = new Chat(null, ChatType.Direct);

        var user1 = CreateUser("user1");
        var user2 = CreateUser("user2");

        chat.AddMember(user1, UserRole.User);
        chat.AddMember(user2, UserRole.User);

        var act = () => chat.RemoveMember(user1.Id);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void AddMessage_Should_Add_Message()
    {
        var chat = new Chat("Group", ChatType.Group);

        var message = new Message(
            "hello",
            Guid.NewGuid(),
            Guid.NewGuid());

        chat.AddMessage(message);

        chat.Messages.Should().Contain(message);
    }

    [Fact]
    public void PinMessage_Should_Pin_Message()
    {
        var chat = new Chat("Group", ChatType.Group);

        typeof(Chat)
            .GetProperty(nameof(Chat.Id))!
            .SetValue(chat, Guid.NewGuid());

        var message = new Message(
            "hello",
            Guid.NewGuid(),
            chat.Id);

        chat.AddMessage(message);

        chat.PinMessage(message);

        message.IsPinned.Should().BeTrue();
    }

    [Fact]
    public void PinMessage_Should_Throw_When_Message_From_Another_Chat()
    {
        var chat = new Chat("Group", ChatType.Group);

        var message = new Message(
            "hello",
            Guid.NewGuid(),
            Guid.NewGuid());

        var act = () => chat.PinMessage(message);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void PinMessage_Should_Throw_When_Limit_Exceeded()
    {
        var chat = new Chat("Group", ChatType.Group);

        typeof(Chat)
            .GetProperty(nameof(Chat.Id))!
            .SetValue(chat, Guid.NewGuid());

        for (int i = 0; i < 10; i++)
        {
            var msg = new Message(
                $"msg-{i}",
                Guid.NewGuid(),
                chat.Id);

            chat.AddMessage(msg);
            chat.PinMessage(msg);
        }

        var extra = new Message(
            "overflow",
            Guid.NewGuid(),
            chat.Id);

        chat.AddMessage(extra);

        var act = () => chat.PinMessage(extra);

        act.Should().Throw<InvalidOperationException>();
    }

    private static User CreateUser(string username = "john") =>
        new(
            Guid.NewGuid(),
            username,
            "John Doe",
            $"{username}@test.com",
            UserRole.User,
            null);
}

public class ChatMemberDomainTests
{
    [Fact]
    public void Constructor_Should_Create_ChatMember()
    {
        var member = new ChatMember(
            Guid.NewGuid(),
            Guid.NewGuid(),
            UserRole.User);

        member.Role.Should().Be(UserRole.User);
    }

    [Fact]
    public void Constructor_Should_Throw_When_UserId_Empty()
    {
        var act = () => new ChatMember(
            Guid.Empty,
            Guid.NewGuid(),
            UserRole.User);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Constructor_Should_Throw_When_ChatId_Empty()
    {
        var act = () => new ChatMember(
            Guid.NewGuid(),
            Guid.Empty,
            UserRole.User);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void ChangeRole_Should_Update_Role()
    {
        var member = new ChatMember(
            Guid.NewGuid(),
            Guid.NewGuid(),
            UserRole.User);

        member.ChangeRole(UserRole.Admin);

        member.Role.Should().Be(UserRole.Admin);
    }

    [Fact]
    public void UpdateLastReadMessage_Should_Update_MessageId()
    {
        var member = new ChatMember(
            Guid.NewGuid(),
            Guid.NewGuid(),
            UserRole.User);

        var messageId = Guid.NewGuid();

        member.UpdateLastReadMessage(messageId);

        member.LastReadMessageId.Should().Be(messageId);
    }

    [Fact]
    public void UpdateLastRead_Should_Update_Date()
    {
        var member = new ChatMember(
            Guid.NewGuid(),
            Guid.NewGuid(),
            UserRole.User);

        var before = member.LastReadAt;

        Thread.Sleep(5);

        member.UpdateLastRead();

        member.LastReadAt.Should().BeAfter(before);
    }
}

public class MessageDomainTests
{
    [Fact]
    public void Constructor_Should_Create_Text_Message()
    {
        var message = new Message(
            "hello",
            Guid.NewGuid(),
            Guid.NewGuid());

        message.Content.Should().Be("hello");
        message.Type.Should().Be(MessageType.Text);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void Constructor_Should_Throw_When_Text_Empty(string text)
    {
        var act = () => new Message(
            text,
            Guid.NewGuid(),
            Guid.NewGuid());

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Constructor_Should_Throw_When_SenderId_Empty()
    {
        var act = () => new Message(
            "hello",
            Guid.Empty,
            Guid.NewGuid());

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Constructor_Should_Throw_When_ChatId_Empty()
    {
        var act = () => new Message(
            "hello",
            Guid.NewGuid(),
            Guid.Empty);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void EditContent_Should_Update_Content()
    {
        var message = CreateMessage();

        message.EditContent("edited");

        message.Content.Should().Be("edited");
    }

    [Fact]
    public void Pin_Should_Set_IsPinned_True()
    {
        var message = CreateMessage();

        message.Pin();

        message.IsPinned.Should().BeTrue();
    }

    [Fact]
    public void Unpin_Should_Set_IsPinned_False()
    {
        var message = CreateMessage();

        message.Pin();

        message.Unpin();

        message.IsPinned.Should().BeFalse();
    }

    [Fact]
    public void SetReplyTo_Should_Update_ParentMessageId()
    {
        var message = CreateMessage();

        var parentId = Guid.NewGuid();

        message.SetReplyTo(parentId);

        message.ParentMessageId.Should().Be(parentId);
    }

    [Fact]
    public void CreateFileMessage_Should_Create_File_Message()
    {
        var message = Message.CreateFileMessage(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "/uploads/file.png",
            "file.png",
            1024,
            MessageType.File,
            "description");

        message.Type.Should().Be(MessageType.File);
        message.FileName.Should().Be("file.png");
        message.FileSize.Should().Be(1024);
    }

    [Fact]
    public void CreateFileMessage_Should_Throw_When_Type_Text()
    {
        var act = () => Message.CreateFileMessage(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "/uploads/file.png",
            "file.png",
            100,
            MessageType.Text);

        act.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData(MessageType.File)]
    [InlineData(MessageType.Voice)]
    public void CreateFileMessage_Should_Create_Different_File_Types(
        MessageType type)
    {
        var message = Message.CreateFileMessage(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "/file.dat",
            "file.dat",
            500,
            type);

        message.Type.Should().Be(type);
    }

    private static Message CreateMessage() =>
        new(
            "hello",
            Guid.NewGuid(),
            Guid.NewGuid());
}
}

