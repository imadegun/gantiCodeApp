import { Server } from 'socket.io';

// Global io instance for API routes to access
let ioInstance: Server | null = null;

// Set the io instance (called from server.ts)
export const setIO = (io: Server) => {
  ioInstance = io;
};

// Get the io instance (called from API routes)
export const getIO = () => ioInstance;

// Store connected clients
const connectedClients = new Set<string>();

export const setupSocket = (io: Server) => {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    connectedClients.add(socket.id);
    
    // Handle messages
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only to client who send message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      connectedClients.delete(socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};

// Helper function to broadcast stock updates to all connected clients
export const broadcastStockUpdate = (data: {
  type: 'stock_updated' | 'stock_created' | 'stock_deleted' | 'reservation_created' | 'reservation_cancelled' | 'reservation_approved' | 'reservation_updated';
  stock?: any;
  stockId?: string;
}) => {
  if (ioInstance) {
    ioInstance.emit('stock_update', data);
    console.log('Stock update broadcasted:', data.type, 'to', connectedClients.size, 'clients');
  }
};
