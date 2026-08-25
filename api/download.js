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

        // දැන් අපි වෙනත් සයිට් වලට යවන්නේ නැහැ. 
        // කෙලින්ම වැඩ කරන Public Invidious / Piped හෝ Invidious instance එකක් හරහා ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගන්නවා.
        const invidiousInstances = [
            "https://vid.puffyan.us",
            "https://invidious.privacyredirect.com",
            "https://inv.nadeko.net",
            "https://invidious.nerdvpn.de"
        ];

        let directDownloadUrl = null;

        for (const instance of invidiousInstances) {
            try {
                const response = await fetch(`${instance}/api/v1/videos/${videoId}`);
                if (response.ok) {
                    const data = await response.json();
                    // 720p හෝ 360p MP4 ලින්ක් එක තෝරාගැනීම
                    const adaptiveFormats = data.adaptiveFormats || [];
                    const mp4Format = adaptiveFormats.find(f => f.type && f.type.includes("video/mp4") && f.qualityLabel);
                    
                    if (mp4Format && mp4Format.url) {
                        directDownloadUrl = mp4Format.url;
                        break;
                    } else if (data.formatStreams && data.formatStreams.length > 0) {
                        directDownloadUrl = data.formatStreams[0].url;
                        break;
                    }
                }
            } catch (e) {
                continue; // වෙනත් ඉන්ස්ටන්ස් එකක් උත්සාහ කරයි
            }
        }

        // ඉහත ක්‍රම වලින් ලින්ක් එකක් නොලැබුණොත්, ඉතාම ස්ථාවර Open API එකක් හරහා ලින්ක් එක ලබා දීම
        if (!directDownloadUrl) {
            const fallbackRes = await fetch(`https://co.wuk.sh/api/json`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: videoUrl,
                    filenameStyle: "pretty"
                })
            });
            const fallbackData = await fallbackRes.json();
            if (fallbackData && fallbackData.url) {
                directDownloadUrl = fallbackData.url;
            }
        }

        if (directDownloadUrl) {
            return res.status(200).json({
                success: true,
                download_url: directDownloadUrl
            });
        } else {
            return res.status(500).json({ success: false, error: "Could not fetch direct download link. Try again later." });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
