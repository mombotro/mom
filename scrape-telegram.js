const fs = require('fs');

const TELEGRAM_CHANNEL = 'mombotpro';
const OUTPUT_FILE = 'posts.json';

async function scrapeTelegram() {
    const url = `https://t.me/s/${TELEGRAM_CHANNEL}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const html = await response.text();
        const posts = [];

        // Match each message widget
        const messageRegex = /<div class="tgme_widget_message[^"]*"[^>]*data-post="mombotpro\/(\d+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;

        let match;
        while ((match = messageRegex.exec(html)) !== null) {
            const postId = match[1];
            const content = match[2];

            // Extract time
            const timeMatch = content.match(/<time[^>]*datetime="([^"]*)"[^>]*>([^<]*)<\/time>/);
            const datetime = timeMatch ? timeMatch[1] : '';
            const time = timeMatch ? timeMatch[2].trim() : '';

            // Extract text content (with HTML preserved for links)
            const textMatch = content.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
            const textHtml = textMatch ? textMatch[1].trim() : '';
            const textPlain = textHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

            // Extract images from background-image style
            const images = [];
            const imgRegex = /tgme_widget_message_photo_wrap[^>]*style="[^"]*background-image:\s*url\('([^']+)'\)/g;
            let imgMatch;
            while ((imgMatch = imgRegex.exec(content)) !== null) {
                images.push(imgMatch[1]);
            }

            // Extract video thumbnails
            const vidRegex = /tgme_widget_message_video_thumb[^>]*style="[^"]*background-image:\s*url\('([^']+)'\)/g;
            while ((imgMatch = vidRegex.exec(content)) !== null) {
                images.push(imgMatch[1]);
            }

            // Extract document title
            const docMatch = content.match(/tgme_widget_message_document_title[^>]*>([^<]+)</);
            const document = docMatch ? docMatch[1].trim() : null;

            if (postId && (textPlain || images.length > 0 || document)) {
                posts.push({
                    id: postId,
                    datetime,
                    time,
                    text: textPlain,
                    html: textHtml,
                    images,
                    document
                });
            }
        }

        // Group posts by exact timestamp
        const timestampMap = new Map();
        posts.forEach(post => {
            const key = post.datetime;
            if (timestampMap.has(key)) {
                const existing = timestampMap.get(key);
                existing.text = [existing.text, post.text].filter(Boolean).join('\n\n');
                existing.html = [existing.html, post.html].filter(Boolean).join('<br><br>');
                existing.images = [...existing.images, ...post.images];
                if (post.document) existing.document = post.document;
            } else {
                timestampMap.set(key, { ...post });
            }
        });

        const finalPosts = Array.from(timestampMap.values());

        // Sort by datetime descending (newest first)
        finalPosts.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalPosts, null, 2));
        console.log(`Scraped ${finalPosts.length} posts from @${TELEGRAM_CHANNEL}`);

    } catch (error) {
        console.error('Error scraping Telegram:', error);
        process.exit(1);
    }
}

scrapeTelegram();
