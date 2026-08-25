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

        // දැන් ඉතාම සාර්ථකව සහ ස්ථාවරව වැඩ කරන වෙනත් නිදහස් ඩවුන්ලෝඩ් සේවාවකට (SaveTheVideo හෝ Y2mate වැනි ක්‍රමයක්) යොමු කිරීම
        return res.status(200).json({
            success: true,
            download_url: `https://www.y2mate.is/youtube/${videoId}`
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
