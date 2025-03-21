import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();


    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }
    

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await newUser.save();
    
    
    const token = await generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name
    });
    
    
    await setAuthCookie(token);
   
    return NextResponse.json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    });
  } catch (error) {

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
