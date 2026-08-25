export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const videoUrl = req.query.url;
    
    if (!videoUrl) {
        return res.status(400).json({ success: false, error: "Please provide a YouTube URL!" });
    }

    try {
        // නව සහ ස්ථාවර Public API එකක් භාවිත කිරීම
        const response = await fetch(`https://youtube-dl.yupp.bar/api/info?url=${encodeURIComponent(videoUrl)}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch from API');
        }

        const data = await response.json();

        if (data && data.url) {
            return res.status(200).json({
                success: true,
                download_url: data.url,
                title: data.title || "YouTube Video"
            });
        } else {
            // වෙනත් විකල්ප API එකකට මාරුවීම
            const altRes = await fetch(`https://api.cobalt.tools/api/json`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: videoUrl })
            });
            
            const altData = await altRes.json();
            if (altData && (altData.url || altData.picker)) {
                return res.status(200).json({
                    success: true,
                    download_url: altData.url || altData.picker[0].url
                });
            }

            return res.status(400).json({ success: false, error: "Could not retrieve download link." });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: "Error: " + err.message });
    }
}
