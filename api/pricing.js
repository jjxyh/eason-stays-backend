/**
 * Vercel Serverless Function: Get Listing Pricing
 * 
 * Gets pricing information for a specific listing and date range
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { listing_id, check_in, check_out, adults, children } = req.query;

  // Validate required parameters
  if (!listing_id || !check_in || !check_out) {
    return res.status(400).json({ 
      error: 'Missing required parameters: listing_id, check_in, check_out' 
    });
  }

  try {
    // Get access token
    const authResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth`, {
      method: 'POST',
    });
    
    const authData = await authResponse.json();
    
    if (!authResponse.ok) {
      throw new Error('Failed to authenticate');
    }

    // Build query parameters
    const params = new URLSearchParams({
      check_in: check_in,
      check_out: check_out,
      adults: adults || '2',
    });

    if (children) params.append('children', children);

    // Call BOOM.now pricing API
    const pricingResponse = await fetch(
      `https://app.boomnow.com/open_api/v1/listings/${listing_id}/pricing?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const pricingData = await pricingResponse.json();

    if (!pricingResponse.ok) {
      throw new Error(pricingData.message || 'Failed to fetch pricing');
    }

    res.status(200).json(pricingData);

  } catch (error) {
    console.error('Pricing error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pricing',
      message: error.message 
    });
  }
}
