import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { updatePrice } from '../store/slices/marketSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

interface UseWebSocketOptions {
  onModelUpdate?: (data: any) => void;
  onTrade?: (trade: any) => void;
  subscribeToModels?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();
  const { onModelUpdate, onTrade, subscribeToModels = false } = options;

  // Memoize callbacks
  const handleModelUpdate = useCallback((data: any) => {
    console.log('Model update received:', data);
    if (onModelUpdate) {
      onModelUpdate(data);
    }
  }, [onModelUpdate]);

  const handleTrade = useCallback((trade: any) => {
    console.log('New trade received:', trade);
    if (onTrade) {
      onTrade(trade);
    }
  }, [onTrade]);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      // Subscribe to price updates
      socket.emit('subscribe:prices');
    });

    socket.on('connected', (data) => {
      console.log('Server message:', data.message);
    });

    socket.on('price:initial', (prices: any[]) => {
      console.log('Received initial prices:', prices);
      prices.forEach((price) => {
        dispatch(updatePrice(price));
      });
    });

    socket.on('price:update', (priceData: any) => {
      console.log('Price update:', priceData);
      dispatch(updatePrice(priceData));
    });

    // Listen for model updates
    socket.on('model:update', handleModelUpdate);

    // Listen for new trades
    socket.on('model:trade', handleTrade);

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('unsubscribe:prices');
        socket.off('model:update', handleModelUpdate);
        socket.off('model:trade', handleTrade);
        socket.disconnect();
      }
    };
  }, [dispatch, handleModelUpdate, handleTrade]);

  // Subscribe to specific model updates
  const subscribeToModel = useCallback((modelId: number) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe:model', { modelId });
    }
  }, []);

  const unsubscribeFromModel = useCallback((modelId: number) => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe:model', { modelId });
    }
  }, []);

  return {
    socket: socketRef.current,
    subscribeToModel,
    unsubscribeFromModel,
  };
};
