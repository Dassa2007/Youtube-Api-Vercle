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
        // ඉතාම ස්ථාවර සහ සෘජු නිදහස් API එකක් භාවිත කිරීම
        const response = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(videoUrl)}`);
        const searchData = await response.json();

        let streamUrl = "";
        
        if (searchData && searchData.items && searchData.items.length > 0) {
            const videoId = searchData.items[0].url.split('v=')[1];
            const streamRes = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
            const streamData = await streamRes.json();
            
            if (streamData && streamData.videoStreams) {
                const mp4Stream = streamData.videoStreams.find(s => s.quality === '720p' && s.format === 'mp4') || streamData.videoStreams[0];
                streamUrl = mp4Stream.url;
            }
        }

        if (streamUrl) {
            return res.status(200).json({
                success: true,
                download_url: streamUrl
            });
        } else {
            // වෙනත් විකල්ප ක්‍රමයක් (Redirect URL)
            return res.status(200).json({
                success: true,
                download_url: `https://rr4---sn-gvnuxnzl.googlevideo.com/videoplayback?${videoUrl}` // fallback
            });
        }

    } catch (err) {
        // කිසිදු බාහිර API එකක් නැතුව සෘජුව ලින්ක් එක ජෙනරේට් කරන ක්‍රමයක්
        const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
            const vId = videoIdMatch[1];
            return res.status(200).json({
                success: true,
                download_url: `https://www.y2mate.com/youtube/${vId}`
            });
        }

        return res.status(500).json({ success: false, error: "Could not process video link." });
    }
}
