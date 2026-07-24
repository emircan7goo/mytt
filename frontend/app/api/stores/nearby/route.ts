/**
 * GET /api/stores/nearby?lat=&lng=&radius=
 * PostGIS ile konum bazlı yakın mağaza sorgusu (ST_DWithin / ST_Distance).
 * (backend/src/store/store.service.ts → findNearby'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get('lat'));
  const lng = Number(sp.get('lng'));
  const radiusKm = Number(sp.get('radius'));

  if (!sp.get('lat') || !sp.get('lng') || !sp.get('radius')) {
    return NextResponse.json({ error: 'lat, lng, and radius are required' });
  }

  if (
    !Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusKm) ||
    lat < -90 || lat > 90 || lng < -180 || lng > 180 ||
    radiusKm <= 0 || radiusKm > 500
  ) {
    return NextResponse.json(
      { message: 'Invalid geolocation parameters (lat/lng/radiusKm out of bounds).' },
      { status: 400 },
    );
  }

  const radiusInMeters = radiusKm * 1000;

  const stores = await prisma.$queryRaw`
    SELECT s.id, s.name, s.rating, s.address, s.bio, s."logo", s."ownerId",
           ST_Distance(u.location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) as distance,
           ST_Y(u.location::geometry) as lat,
           ST_X(u.location::geometry) as lng
    FROM "Store" s
    JOIN "User" u ON s."ownerId" = u.id
    WHERE u.location IS NOT NULL
      AND ST_DWithin(
        u.location::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusInMeters}
      )
    ORDER BY distance ASC
  `;

  return NextResponse.json(stores, {
    headers: { 'Content-Type': 'application/json' },
  });
}
