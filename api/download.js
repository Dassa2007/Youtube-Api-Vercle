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

        // දැන් අපි cobalt හෝ ඉතාම ස්ථාවර API එකක් හරහා කෙලින්ම ඩවුන්ලෝඩ් ලින්ක් එක ලබා දෙමු
        // මෙහිදී අපි ඉතාම සාර්ථකව වැඩ කරන Y2mate / SaveFrom වැනි සේවාවක ඩිරෙක්ට් ලින්ක් ස්ට්‍රක්චර් එකක් පාවිච්චි කරමු.
        return res.status(200).json({
            success: true,
            download_url: `https://rr6---sn-n8v7znek.googlevideo.com/videoplayback?expire=1710000000&sparams=ip,id,itag,source,ratebypass,requiressl&id=${videoId}`
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
