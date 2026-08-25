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

        // දැන් සාර්ථකව වැඩ කරන සහ ලින්ක් එක ස්වයංක්‍රීයව පාස් කරන හොඳම ක්‍රමය
        return res.status(200).json({
            success: true,
            download_url: `https://youtubepp.com/watch?v=${videoId}`
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
