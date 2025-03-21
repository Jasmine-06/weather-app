import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Favorite from '@/models/Favorite';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  context: { params: { favoriteId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    const favoriteId = context.params.favoriteId;
    
    if (!mongoose.isValidObjectId(favoriteId)) {
      return NextResponse.json(
        { error: 'Invalid favorite ID' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const favorite = await Favorite.findOne({
      _id: favoriteId,
      userId: user.id
    });
    
    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(favorite);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch favorite' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { favoriteId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    const favoriteId = context.params.favoriteId;
    
    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
      return NextResponse.json(
        { error: 'Invalid favorite ID format' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const result = await Favorite.findOneAndDelete({
      _id: favoriteId,
      userId: user.id
    });
    
    if (!result) {
      return NextResponse.json(
        { error: 'Favorite not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json(
      { error: 'Failed to delete favorite' }, 
      { status: 500 }
    );
  }
}
