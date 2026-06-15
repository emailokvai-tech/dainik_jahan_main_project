import Parser from 'rss-parser';

/**
 * Interface representing a raw article fetched from an RSS feed.
 */
export interface RawArticle {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  categories?: string[];
  creator?: string;
  summary?: string;
  enclosure?: {
    url: string;
    type: string;
  };
  imageUrl?: string;
  source: string;
}

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  }
});

/**
 * Fetches news articles from a list of RSS feed URLs.
 * @param feeds Array of RSS feed URLs to fetch from.
 * @returns A promise that resolves to an array of RawArticle objects.
 */
export async function fetchRSSArticles(feeds: { url: string; name: string }[]): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = [];

  for (const feed of feeds) {
    try {
      console.log(`Fetching feed: ${feed.name} (${feed.url})`);
      const feedData = await parser.parseURL(feed.url);

      const items = feedData.items.map(item => {
        // Try to extract an image URL from common RSS extensions
        let imageUrl = item.enclosure?.url;
        
        // Handle media:content if present
        if (!imageUrl && (item as any).mediaContent && (item as any).mediaContent.length > 0) {
          imageUrl = (item as any).mediaContent[0].$.url;
        }

        // Handle media:thumbnail
        if (!imageUrl && (item as any).mediaThumbnail) {
          imageUrl = (item as any).mediaThumbnail.$.url;
        }

        return {
          title: item.title || 'Untitled',
          link: item.link || '',
          pubDate: item.pubDate,
          content: (item as any).contentEncoded || item.content || item.contentSnippet,
          contentSnippet: item.contentSnippet,
          categories: item.categories,
          creator: item.creator,
          imageUrl: imageUrl,
          source: feed.name,
        } as RawArticle;
      });

      allArticles.push(...items);
    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error);
    }
  }

  // Sort by date descending if pubDate exists
  return allArticles.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });
}
