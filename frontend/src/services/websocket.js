import io from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        if (this.socket && this.connected) {
            return;
        }

        this.socket = io('http://localhost:8080', {
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('WebSocket Connected');
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket Disconnected');
            this.connected = false;
        });

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    subscribe(testId, callback) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return null;
        }

        // Listen for test-progress events
        const handler = (progress) => {
            // Only process events for this testId or broadcast events
            if (!progress.testId || progress.testId === testId) {
                callback(progress);
            }
        };

        this.socket.on('test-progress', handler);

        // Return unsubscribe function
        return () => {
            this.socket.off('test-progress', handler);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }
}

const websocketService = new WebSocketService();
export default websocketService;
