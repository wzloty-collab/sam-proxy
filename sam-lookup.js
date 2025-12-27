export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Allow only Federal Bid Partners LLC site
    const allowedOrigin = "https://www.federalbidpartners.com";
    const origin = req.headers.origin;

    if (origin === allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    } else if (origin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { uei = "", cage = "", name = "" } = req.query;

    const u = String(uei).trim();
    const c = String(cage).trim();
    const n = String(name).trim();

    if (!u && !c && !n) {
      return res.status(400).json({ error: "Provide UEI, CAGE, or name" });
    }

    const apiKey = process.env.SAM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing SAM API key" });
    }

    const base = "https://api.sam.gov/entity-information/v4/entities";
    const url = new URL(base);

    if (u) url.searchParams.set("ueiSAM", u);
    if (c) url.searchParams.set("cageCode", c);
    if (n && !u && !c) url.searchParams.set("q", n);

    url.searchParams.set("includeSections", "entityRegistration,coreData");
    url.searchParams.set("api_key", apiKey);

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" }
    });

    const text = await response.text();
    res.setHeader("Content-Type", "application/json");
    return res.status(response.status).send(text);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
