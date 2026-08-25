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
        // Cobalt API එක හරහා කෙලින්ම MP3 (Audio) පමණක් ඉල්ලීම
        const response = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: videoUrl,
                downloadMode: "audio", // මෙතැනදී ඕඩියෝ පමණක් ලබා ගැනීමට නියම කරයි
                audioFormat: "mp3",    // MP3 ෆෝමැට් එක
                filenameStyle: "pretty"
            })
        });

        const data = await response.json();

        if (data && (data.url || data.picker)) {
            let downloadLink = data.url;
            
            if (!downloadLink && data.picker && data.picker.length > 0) {
                downloadLink = data.picker[0].url;
            }

            return res.status(200).json({
                success: true,
                download_url: downloadLink
            });
        } else {
            return res.status(500).json({ success: false, error: "සින්දුව ලබා ගැනීමට නොහැකි විය. වෙනත් ලින්ක් එකක් උත්සාහ කරන්න." });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: "සර්වර් දෝෂයක් සිදු විය: " + err.message });
    }
}
