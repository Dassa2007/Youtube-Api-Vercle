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
        // වෙනත් නිදහස් Public API එකක් භාවිත කිරීම
        const apiRes = await fetch(`https://pipedapi.kavin.rocks/streams/${encodeURIComponent(videoUrl.split('v=')[1]?.split('&')[0])}`);
        const data = await apiRes.json();

        if (data && data.videoStreams && data.videoStreams.length > 0) {
            // හොඳම ඩවුන්ලෝඩ් ලින්ක් එක තෝරා ගැනීම
            const stream = data.videoStreams.find(s => s.quality === '720p' && s.format === 'mp4') || data.videoStreams[0];
            
            return res.status(200).json({
                success: true,
                download_url: stream.url
            });
        } else {
            return res.status(400).json({ success: false, error: "Could not fetch video streams. Try another link!" });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server connection failed. Try again later." });
    }
}
