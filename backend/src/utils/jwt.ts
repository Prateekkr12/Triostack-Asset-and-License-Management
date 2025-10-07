import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'triostack-asset-manager',
    audience: 'triostack-users'
  } as jwt.SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'triostack-asset-manager',
      audience: 'triostack-users'
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return { userId: payload.userId };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header format');
  }

  return parts[1];
};
