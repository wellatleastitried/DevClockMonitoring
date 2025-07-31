import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  connect(onConnected) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: () => {},
      onConnect: () => {
        this.connected = true;
        console.log('WebSocket connected');
        if (onConnected) onConnected();
      },
      onStompError: (error) => {
        console.error('WebSocket STOMP error:', error);
        this.connected = false;
      },
      onWebSocketError: (error) => {
        console.error('WebSocket connection error:', error);
        this.connected = false;
      }
    });
    
    this.client.activate();
  }

  disconnect() {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }

  subscribe(destination, callback) {
    if (this.client && this.connected) {
      this.client.subscribe(destination, (message) => {
        const data = JSON.parse(message.body);
        callback(data);
      });
    }
  }

  send(destination, data) {
    if (this.client && this.connected) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(data)
      });
    }
  }
}

export const websocketService = new WebSocketService();
