export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const videoUrl = req.query.url;
    
    if (!videoUrl) {
        return res.status(400).json({ success: false, error: "කරුණාකර YouTube ලින්ක් එකක් ඇතුළත් කරන්න!" });
    }

    try {
        // ඉතාම සාර්ථකව MP3 ලින්ක් ලබා දෙන වෙනත් නිදහස් API එකක් භාවිතය
        const apiRes = await fetch(`https://api.vkrnetserver.com/api/v1/convert?url=${encodeURIComponent(videoUrl)}`);
        const data = await apiRes.json();

        if (data && (data.status === "success" || data.url)) {
            return res.status(200).json({
                success: true,
                download_url: data.url || data.dl_url
            });
        } else {
            // වෙනත් විකල්ප API එකකට මාරුවීම
            const altRes = await fetch(`https://p.oceansaver.in/ajax/download.php?copyright=0&url=${encodeURIComponent(videoUrl)}&format=mp3`);
            const altData = await altRes.json();

            if (altData && altData.success) {
                return res.status(200).json({
                    success: true,
                    download_url: altData.id ? `https://p.oceansaver.in/download.php?id=${altData.id}` : altData.link
                });
            }

            return res.status(500).json({ success: false, error: "සින්දුව ලබා ගැනීමට නොහැකි විය. කරුණාකර වෙනත් ලින්ක් එකක් උත්සාහ කරන්න." });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: "සර්වර් දෝෂයක් සිදු විය: " + err.message });
    }
}
