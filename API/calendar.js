// api/calendar.js
// Place this file at: your-repo/api/calendar.js
// Vercel automatically deploys any file in /api as a serverless function.
// This runs server-side (Node.js) — no CORS restrictions apply.

const ICS_URL =
  'https://calendar.google.com/calendar/ical/' +
  'c_2b41b79c5b77e64bb81f0b88359832d27157b1259aed7ab0b02ce3960b9143b5' +
  '%40group.calendar.google.com/public/basic.ics';

export default async function handler(req, res) {
  // Allow the browser to call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch(ICS_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/calendar, text/plain, */*',
      },
      // Follow redirects
      redirect: 'follow',
    });

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: `Google Calendar returned ${response.status}` });
    }

    const icsText = await response.text();

    if (!icsText.includes('BEGIN:VCALENDAR')) {
      return res.status(502).json({ error: 'Response is not a valid ICS feed' });
    }

    // Cache on Vercel edge for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(icsText);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
