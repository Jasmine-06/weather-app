import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Favorite from '@/models/Favorite';
import { getUserFromRequest } from '@/lib/auth';


export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const favorites = await Favorite.find({ userId: user.id });
    
    return NextResponse.json(favorites);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch favorites' }, 
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    const { cityName, countryCode, lat, lon } = await request.json();
    
    if (!cityName || !countryCode || lat === undefined || lon === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    

    const existingFavorite = await Favorite.findOne({
      userId: user.id,
      cityName: cityName
    });
    
    if (existingFavorite) {
      return NextResponse.json(
        { error: 'City is already in favorites', existingId: existingFavorite._id }, 
        { status: 409 }
      );
    }
    
    const favorite = new Favorite({
      userId: user.id,
      cityName,
      countryCode,
      lat,
      lon
    });
    
    await favorite.save();
    
    return NextResponse.json(favorite);
  } catch (error: any) {
  

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'City is already in favorites' }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add favorite' }, 
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    const { cityName, countryCode } = await request.json();
    
    if (!cityName || !countryCode) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const result = await Favorite.findOneAndDelete({
      userId: user.id,
      cityName,
      countryCode
    });
    
    if (!result) {
      return NextResponse.json(
        { error: 'Favorite not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete favorite' }, 
      { status: 500 }
    );
  }
}
