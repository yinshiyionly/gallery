import mongoose from 'mongoose';

// 定义全局类型
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// 缓存数据库连接
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

interface ConnectionOptions {
  maxPoolSize?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
}

/**
 * 连接到 MongoDB 数据库
 * @param {ConnectionOptions} options - 连接选项
 * @returns {Promise<mongoose.Connection>} Mongoose 连接实例
 */
export async function connectToDatabase(
  options: ConnectionOptions = {}
): Promise<mongoose.Connection> {
  const {
    maxPoolSize = 10,
    serverSelectionTimeoutMS = 5000,
    socketTimeoutMS = 45000,
  } = options;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize,
      serverSelectionTimeoutMS,
      socketTimeoutMS,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose: typeof import('mongoose')) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * 断开与 MongoDB 的连接
 * @returns {Promise<void>}
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('Disconnected from MongoDB');
  }
}

/**
 * 检查数据库连接状态
 * @returns {boolean} 连接状态
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * 获取当前数据库连接状态
 * @returns {number} 连接状态码
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
export function getConnectionState(): number {
  return mongoose.connection.readyState;
}

/**
 * 重置数据库连接
 * @returns {Promise<void>}
 */
export async function resetConnection(): Promise<void> {
  await disconnectFromDatabase();
  cached.conn = null;
  cached.promise = null;
}

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err: Error) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// 应用关闭时断开连接
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});