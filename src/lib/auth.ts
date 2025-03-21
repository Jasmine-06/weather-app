import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { connectToDatabase } from './mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET ;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface UserJwtPayload {
  id: string;
  email: string;
  name: string;
}


function getExpirationTime(): number {
  if (JWT_EXPIRES_IN.endsWith('d')) {
    return parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60;
  } else if (JWT_EXPIRES_IN.endsWith('h')) {
    return parseInt(JWT_EXPIRES_IN) * 60 * 60;
  } else {
    return 7 * 24 * 60 * 60;
  }
}


export async function generateToken(user: UserJwtPayload): Promise<string> {
 

  const secret = new TextEncoder().encode(JWT_SECRET);
  
  return await new SignJWT({ 
    id: user.id,
    email: user.email,
    name: user.name 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + getExpirationTime())
    .sign(secret);
}



export async function verifyToken(token: string): Promise<UserJwtPayload | null> {
  try {
    
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UserJwtPayload;
  } catch (error) {

    return null;
  }
}


export async function setAuthCookie(token: string): Promise<void> {
  const maxAge = getExpirationTime();
  
  (await cookies()).set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge
  });
}


export async function deleteAuthCookie(): Promise<void> {
  (await cookies()).delete('auth_token');
}


export async function getUserFromRequest(req: NextRequest) {
  
  const authToken = req.cookies.get('auth_token')?.value;
  
  if (!authToken) {
    return null;
  }
  
  const decoded = await verifyToken(authToken);
  
  if (!decoded) {
    return null;
  }
  
  try {
    await connectToDatabase();
    const user = await User.findById(decoded.id).select('-password');
    return user ? { ...user.toJSON(), id: user._id.toString() } : null;
  } catch (error) {

    return null;
  }
}


export async function getCurrentUser() {
  const authToken = (await cookies()).get('auth_token')?.value;
  
  if (!authToken) {
    return null;
  }
  
  const decoded = await verifyToken(authToken);
  
  if (!decoded) {
    return null;
  }
  
  try {
    await connectToDatabase();
    const user = await User.findById(decoded.id).select('-password');
    return user ? { ...user.toJSON(), id: user._id.toString() } : null;
  } catch (error) {
    return null;
  }
}
