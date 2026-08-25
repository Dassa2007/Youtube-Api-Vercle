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
        // Cobalt API එකේ වෙනත් ක්‍රියාත්මක වන නිල සේවාවක් (Cobalt instance) හරහා සෘජු ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීම
        const response = await fetch("https://cobalt.api.red-stone.workers.dev/", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
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
            // වෙනත් විකල්ප සෘජු ක්‍රමයක් (SaveFrom හෝ SnapSave වැනි සේවාවකට හරවන සරල ලින්ක් එකක්)
            const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
            const vId = videoIdMatch ? videoIdMatch[1] : "";

            return res.status(200).json({
                success: true,
                download_url: `https://ssyoutube.com/watch?v=${vId}`
            });
        }

    } catch (err) {
        // ෆේල් වුණොත් සෘජුවම ssyoutube වෙත යොමු කිරීම
        const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const vId = videoIdMatch ? videoIdMatch[1] : "";
        
        return res.status(200).json({
            success: true,
            download_url: `https://ssyoutube.com/watch?v=${vId}`
        });
    }
}
