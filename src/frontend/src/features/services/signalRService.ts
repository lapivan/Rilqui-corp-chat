import * as signalR from '@microsoft/signalr';

class SignalRService {
    private connection: signalR.HubConnection | null = null;

    public async init(token: string): Promise<void> {
        if (this.connection) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5100/chatHub', {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        this.connection.onreconnecting(() => {
            console.log('SignalR: Connection lost. Reconnecting...');
        });

        this.connection.onreconnected(() => {
            console.log('SignalR: Connection restored.');
        });

        try {
            await this.connection.start();
            console.log('SignalR: Connected successfully!');
        } catch (err) {
            console.error('SignalR: Connection error:', err);
        }
    }

    public on(eventName: string, callback: (...args: unknown[]) => void): void {
        this.connection?.on(eventName, callback);
    }

    public off(eventName: string): void {
        this.connection?.off(eventName);
    }

    public async stop(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }
}

export const signalRService = new SignalRService();