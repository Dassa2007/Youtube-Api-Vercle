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
        // වීඩියෝ ID එක ලබා ගැනීම
        const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        
        if (videoIdMatch && videoIdMatch[1]) {
            const vId = videoIdMatch[1];
            
            // කිසිදු බාහිර fetch එකක් නැතුව සෘජුවම වැඩ කරන ක්‍රමයක් (SaveFrom / Y2Mate හෝ Cobalt වෙත redirect ලින්ක් එක)
            return res.status(200).json({
                success: true,
                download_url: `https://en.loader.to/api/button/?url=https://www.youtube.com/watch?v=${vId}`
            });
        } else {
            return res.status(400).json({ success: false, error: "Invalid YouTube URL!" });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
