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
        // Cobalt API එක භාවිත කර සෘජු ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීම
        const response = await fetch("https://co.wuk.sh/api/json", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: "720"
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
            // වෙනත් විකල්ප API එකක් (Invidious instance) මඟින් ලබා ගැනීම
            const invId = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
            if (invId && invId[1]) {
                const pipedRes = await fetch(`https://pipedapi.kavin.rocks/streams/${invId[1]}`);
                const pipedData = await pipedRes.json();
                
                if (pipedData && pipedData.videoStreams) {
                    const stream = pipedData.videoStreams.find(s => s.quality === '720p' && s.format === 'mp4') || pipedData.videoStreams[0];
                    if (stream && stream.url) {
                        return res.status(200).json({ success: true, download_url: stream.url });
                    }
                }
            }

            return res.status(400).json({ success: false, error: "Could not fetch download link. Try another video!" });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
