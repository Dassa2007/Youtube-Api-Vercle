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
        const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        
        if (!videoIdMatch || !videoIdMatch[1]) {
            return res.status(400).json({ success: false, error: "Invalid YouTube URL!" });
        }

        const videoId = videoIdMatch[1];

    // බාහිර fetch බ්ලොක් වීම් මඟහරවා ගැනීමට සහ ඇඩ්ස් වලින් තොර සෘජු ලින්ක් එකක් ලබා දීමට Cobalt Public API එකේ විකල්ප ක්‍රමයක්
        const response = await fetch("https://co.wuk.sh/api/json", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            body: JSON.stringify({
                url: `https://www.youtube.com/watch?v=${videoId}`,
                vQuality: "720",
                filenamePattern: "classic"
            })
        });

        const data = await response.json();

        if (data && (data.url || data.picker)) {
            const directUrl = data.url || data.picker[0].url;
            return res.status(200).json({
                success: true,
                download_url: directUrl
            });
        } else {
            // Cobalt වැඩ නොකළහොත්, කිසිදු ඇඩ් එකක් නැති පිරිසිදු Invidious API එකක් හරහා සෘජු ලින්ක් එක ලබා ගැනීම
            const invidiousRes = await fetch(`https://invidious.projectsegfau.lt/api/v1/videos/${videoId}`);
            const invData = await invidiousRes.json();

            if (invData && invData.adaptiveFormats) {
                const mp4Format = invData.adaptiveFormats.find(f => f.type && f.type.includes('video/mp4') && f.qualityLabel === '720p') || invData.adaptiveFormats.find(f => f.type && f.type.includes('video/mp4'));
                
                if (mp4Format && mp4Format.url) {
                    return res.status(200).json({
                        success: true,
                        download_url: mp4Format.url
                    });
                }
            }

            return res.status(400).json({ success: false, error: "Could not generate direct download link. Please try again." });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
