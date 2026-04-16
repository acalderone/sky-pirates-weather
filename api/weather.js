// Vercel Serverless Function — /api/weather
// Fetches the Sky Pirates weather station page server-side and returns parsed JSON.

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '');
}

function decodeEntities(s) {
  return s.replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&deg;/g, '°')
          .replace(/&nbsp;/g, ' ');
}

function parseWeatherHTML(html) {
  const rows = {};
  const rowRe = /<td[^>]*class="label"[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*class="data"[^>]*>([\s\S]*?)<\/td>/gi;
  let m;
  while ((m = rowRe.exec(html)) !== null) {
    const label = stripTags(m[1]).trim();
    const value = decodeEntities(stripTags(m[2])).trim();
    if (label) rows[label] = value;
  }

  const tsMatch = html.match(/<p[^>]*class="lastupdate"[^>]*>([\s\S]*?)<\/p>/i);
  const timestamp = tsMatch ? stripTags(tsMatch[1]).trim() : null;

  const windRaw = rows['Wind'] || null;
  let windSpeed = null, windDir = null, windCardinal = null;
  if (windRaw) {
    if (/calm/i.test(windRaw)) {
      windSpeed = 0;
    } else {
      const sm = windRaw.match(/([\d.]+)\s*mph/i);
      const cm = windRaw.match(/mph\s+([A-Z]+)/i);
      const dm = windRaw.match(/\(([\d.]+)/);
      windSpeed    = sm ? parseFloat(sm[1]) : null;
      windCardinal = cm ? cm[1].toUpperCase() : null;
      windDir      = dm ? parseFloat(dm[1])   : null;
    }
  }

  const gustRaw = rows['Gust Speed'] || null;
  let gustSpeed = null, gustDir = null;
  if (gustRaw && !/calm/i.test(gustRaw)) {
    const sm = gustRaw.match(/([\d.]+)\s*mph/i);
    const dm = gustRaw.match(/\(([\d.]+)/);
    gustSpeed = sm ? parseFloat(sm[1]) : null;
    gustDir   = dm ? parseFloat(dm[1])   : null;
  }

  return {
    timestamp, windSpeed, windDir, windCardinal, windRaw,
    gustSpeed, gustDir, gustRaw,
    temperature: rows['Outside Temperature'] || null,
    humidity:    rows['Humidity']            || null,
    barometer:   rows['Barometer']           || null,
    rainRate:    rows['Rain Rate']           || null,
    heatIndex:   rows['Heat Index']          || null,
    dewPoint:    rows['Dew Point']           || null,
  };
}

export default async function handler(req, res) {
  try {
    const response = await fetch('http://spfieldweather.com/', {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Weather station returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const data = parseWeatherHTML(html);

    // Cache for 60 seconds on Vercel's edge + browsers
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(data);
  } catch (err) {
    console.error('Weather fetch error:', err);
    res.status(502).json({ error: 'Could not reach weather station', detail: err.message });
  }
}
