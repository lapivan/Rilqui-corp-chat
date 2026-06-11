# RilquiChat

[![Dotnet 10](https://img.shields.io/badge/.NET_10-512BD4?style=flat-square&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-239120?style=flat-square&logo=c-sharp&logoColor=white)](https://learn.microsoft.com/en-us/dotnet/csharp/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![EF Core 10](https://img.shields.io/badge/EF_Core_10-512BD4?style=flat-square&logo=dotnet&logoColor=white)](https://learn.microsoft.com/en-us/ef/core/)
[![SignalR](https://img.shields.io/badge/SignalR-512BD4?style=flat-square&logo=dotnet&logoColor=white)](https://learn.microsoft.com/en-us/aspnet/core/signalr/)
[![Clean Architecture](https://img.shields.io/badge/Clean-Architecture-blue?style=flat-square&logo=codeforces&logoColor=white)](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
[![CQRS / MediatR](https://img.shields.io/badge/CQRS_/_MediatR-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://github.com/jbogard/MediatR)
[![JWT Auth](https://img.shields.io/badge/JWT-Authentication-black?style=flat-square&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Manager-orange?style=flat-square&logo=shikimori&logoColor=white)](https://github.com/pmndrs/zustand)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

Современное многопользовательское чат-приложение, работающее в режиме реального времени. Архитектура построена на разделении зон ответственности: высокопроизводительный бэкенд на .NET 10 с использованием принципов Clean Architecture и отзывчивый фронтенд на React + TypeScript с эффективным управлением состоянием.

---

| Главное окно чата | Панель чатов |
|-------------------|---------------------|
| <img src="../Rilqui-corp-chat/docs/chat.svg"/> | <img src="../Rilqui-corp-chat/docs/chats.svg"> |

---

# Основные сценарии использования

1. Регистрация пользователя.
2. Авторизация в системе.
3. Создание личного диалога.
4. Создание группового чата или канала.
5. Отправка сообщений в режиме реального времени.
6. Редактирование сообщений.
7. Удаление сообщений.
8. Ответ на сообщение.
9. Закрепление сообщений.
10. Управление участниками чата.

---

# Структура проекта

```text
📁 RilquiChat
└── 📁 src
    ├── 📁 backend
    │   ├── 📄 RilquiChat.sln
    │   ├── 📁 RilquiChat.Domain          # Слой домена (сущности, интерфейсы)
    │   ├── 📁 RilquiChat.Application     # Слой приложения (Use Cases, CQRS, MediatR)
    │   ├── 📁 RilquiChat.Infrastructure  # Слой инфраструктуры (PostgreSQL, EF Core)
    │   └── 📁 RilquiChat.WebAPI          # Слой представления (Контроллеры, SignalR хабы)
    │
    └── 📁 frontend
        ├── 📄 package.json
        ├── 📄 vite.config.ts
        ├── 📁 public                     # Статические ресурсы
        └── 📁 src                        # Исходный код React приложения
            ├── 📁 api                    # Настройка Axios и эндпоинты API
            ├── 📁 assets                 # Стили, картинки, шрифты
            ├── 📁 components             # Глобальные переиспользуемые UI-компоненты
            ├── 📁 features               # Изолированные фичи/модули приложения
            ├── 📁 hooks                  # Кастомные React-хуки
            ├── 📁 store                  # Zustand сторы (состояние приложения)
            ├── 📁 types                  # TypeScript интерфейсы, типы и DTO
            ├── 📁 utils                  # Вспомогательные функции и утилиты
            ├── 📄 App.css                # Глобальные стили корневого компонента
            ├── 📄 App.tsx                # Корневой компонент приложения
            ├── 📄 index.css              # Базовые стили приложения
            └── 📄 main.tsx               # Точка входа в React приложение
```

---

# Установка и запуск

## 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/RilquiChat.git
cd RilquiChat
```

---

## 2. Настройка и запуск Backend

Перейдите в директорию API:

```bash
cd RilquiChat.WebAPI
```

Настройте строку подключения PostgreSQL в файле:

```text
appsettings.json
```

или

```text
appsettings.Development.json
```

Примените миграции:

```bash
dotnet ef database update
```

Запустите сервер:

```bash
dotnet run
```

По умолчанию сервер запускается по адресу:

```text
http://localhost:5100
```

---

## 3. Настройка и запуск Frontend

Откройте новый терминал:

```bash
cd ../RilquiChat.Client
```

Установите зависимости:

```bash
npm install
```

Создайте файл `.env`:

```env
VITE_API_URL=http://localhost:5100
```

Запустите приложение:

```bash
npm run dev
```

После запуска откройте адрес, указанный Vite (обычно):

```text
http://localhost:5173
```

---