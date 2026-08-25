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
        // Cobalt API එකට ඉල්ලීම යැවීම (මෙයින් කිසිදු එරර් එකක් නොමැතිව සෘජු ඩවුන්ලෝඩ් ලින්ක් එකක් ලබා දේ)
        const response = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: "720",
                filenameStyle: "pretty"
            })
        });

        const data = await response.json();

        if (data && (data.url || data.picker)) {
            let downloadLink = data.url;
            
            // සමහර විට විකල්ප ලින්ක් එකක් එන්න පුළුවන් (picker වලින්)
            if (!downloadLink && data.picker && data.picker.length > 0) {
                downloadLink = data.picker[0].url;
            }

            return res.status(200).json({
                success: true,
                download_url: downloadLink
            });
        } else {
            return res.status(500).json({ success: false, error: "Could not fetch video. Try another link." });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error: " + err.message });
    }
}
