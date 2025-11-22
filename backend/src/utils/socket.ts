import { Server } from 'socket.io';

let io: Server;

/**
 * 设置 Socket.IO 实例
 */
export function setIo(ioInstance: Server): void {
  io = ioInstance;
}

/**
 * 获取 Socket.IO 实例
 */
export function getIo(): Server {
  if (!io) {
    throw new Error('Socket.IO 未初始化。请先调用 setIo()');
  }
  return io;
}
