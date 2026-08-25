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
        const response = await fetch('https://co.wuk.sh/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: '720',
                filenamePattern: 'classic'
            })
        });

        const data = await response.json();

        if (data && (data.url || data.picker)) {
            const downloadUrl = data.url || data.picker[0].url;
            return res.status(200).json({
                success: true,
                download_url: downloadUrl
            });
        } else {
            return res.status(400).json({ success: false, error: "Could not fetch video. Try another link!" });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Server error occurred. Please try again." });
    }
}
