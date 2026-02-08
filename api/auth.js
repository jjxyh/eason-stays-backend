/**
 * Vercel Serverless Function: Get BOOM.now Access Token
 * 
 * This function handles authentication with the BOOM.now API
 * Credentials are stored securely in environment variables
 */

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://app.boomnow.com/open_api/v1/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.BOOM_CLIENT_ID,
        client_secret: process.env.BOOM_CLIENT_SECRET,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Authentication failed');
    }

    // Return the access token
    res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      error: 'Failed to authenticate',
      message: error.message 
    });
  }
}
