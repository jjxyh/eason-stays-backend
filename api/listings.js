/**
 * Vercel Serverless Function: Search Nearby Listings
 * 
 * Searches for BOOM.now listings near specified coordinates
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lng, radius, adults, children, check_in, check_out } = req.query;

  // Validate required parameters
  if (!lat || !lng) {
    return res.status(400).json({ 
      error: 'Missing required parameters: lat, lng' 
    });
  }

  try {
    // First, get an access token
    const authResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth`, {
      method: 'POST',
    });
    
    const authData = await authResponse.json();
    
    if (!authResponse.ok) {
      throw new Error('Failed to authenticate');
    }

    // Build query parameters
    const params = new URLSearchParams({
      nearby: 'true',
      lat: lat,
      lng: lng,
      rad: radius || '50000', // Default 50km radius
    });

    // Add optional parameters
    if (adults) params.append('adults', adults);
    if (children) params.append('children', children);
    if (check_in) params.append('check_in', check_in);
    if (check_out) params.append('check_out', check_out);

    // Call BOOM.now API
    const listingsResponse = await fetch(
      `https://app.boomnow.com/open_api/v1/listings?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const listingsData = await listingsResponse.json();

    if (!listingsResponse.ok) {
      throw new Error(listingsData.message || 'Failed to fetch listings');
    }

    res.status(200).json(listingsData);

  } catch (error) {
    console.error('Listings error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch listings',
      message: error.message 
    });
  }
}
