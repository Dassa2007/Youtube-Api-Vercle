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
        // vidssave.com සයිට් එකේ සර්ච් පරාමිතිය (query parameter) හරියටම වැඩ කරන විදිහට ලින්ක් එක සැකසීම
        // උදාහරණයක් ලෙස: https://vidssave.com/?url=... හෝ vidssave ලින්ක් ස්ට්‍රක්චර් එකට ගැලපෙන ලෙස
        const encodedUrl = encodeURIComponent(videoUrl);
        
        return res.status(200).json({
            success: true,
            download_url: `https://vidssave.com/?url=${encodedUrl}`
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
