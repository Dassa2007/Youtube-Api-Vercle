export default function handler(req, res) {
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

        // කිසිදු බාහිර fetch එකක් හෝ වෙනත් සයිට් වලට යැවීමක් නැත.
        // මෙය මඟින් කෙලින්ම වීඩියෝ එකේ සෘජු ඩවුන්ලෝඩ් ලින්ක් එක JSON ලෙස ලබා දේ.
        return res.status(200).json({
            success: true,
            title: "YouTube Video",
            download_url: `https://invidious.projectsegfau.lt/latest_version?id=${videoId}&itag=22`
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
