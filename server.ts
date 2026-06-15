import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fetchRSSArticles } from './src/services/rssService.ts';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Load Firebase config
import firebaseConfig from './firebase-applet-config.json';

const app = express();
const PORT = 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const firestoreInstance = admin.firestore();
if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
  firestoreInstance.settings({ databaseId: firebaseConfig.firestoreDatabaseId });
}

const getDb = () => firestoreInstance;

const FEEDS = [
  { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss' },
  { name: 'The Guardian UK News', url: 'https://www.theguardian.com/uk-news/rss' },
  { name: 'The Guardian Technology', url: 'https://www.theguardian.com/technology/rss' },
  { name: 'The Guardian Science', url: 'https://www.theguardian.com/science/rss' },
  { name: 'The Guardian Environment', url: 'https://www.theguardian.com/environment/rss' },
];

/**
 * Task to sync news and process with Gemini
 */
async function syncNews() {
  console.log('Starting News Sync...');
  const currentDb = getDb();
  try {
    const rawArticles = await fetchRSSArticles(FEEDS);
    console.log(`Fetched ${rawArticles.length} raw articles.`);

    const topArticles = rawArticles.slice(0, 10);

    for (const article of topArticles) {
      const articleId = Buffer.from(article.link || article.title).toString('base64').replace(/[/+=]/g, '_').slice(0, 64);
      
      const articleDoc = currentDb.collection('articles').doc(articleId);
      const existing = await articleDoc.get();

      if (!existing.exists) {
        console.log(`New article found: ${article.title}`);
        
        let rewritten = {
          title: article.title,
          content: article.content || 'No content available.',
          excerpt: article.contentSnippet || ''
        };

        if (process.env.GEMINI_API_KEY) {
          try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
              You are an editorial assistant at Dainik Jahan, a high-end English news portal styled after The Guardian.
              Rewrite the following brief or raw news item into a full, analytical, and authoritative news report.
              
              Style Requirements:
              1. Authoritative and objective tone.
              2. Deep context and sophisticated vocabulary.
              3. A punchy, intelligent headline.
              4. The 'excerpt' should be a single, powerful sentence that summarizes why this matters.
              5. The 'content' should be a structured article (3-4 paragraphs) expanding on the facts provided.

              Original Title: ${article.title}
              Original Source Material: ${article.contentSnippet || article.content}

              Respond ONLY with a JSON object:
              {
                "title": "...",
                "content": "...",
                "excerpt": "..."
              }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Extract JSON from potential markdown blocks
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.title) rewritten = parsed;
            }
          } catch (geminiError) {
            console.error('Gemini Rewrite Error:', geminiError);
          }
        }
        
        await articleDoc.set({
          title: rewritten.title,
          content: rewritten.content,
          excerpt: rewritten.excerpt,
          source: article.source,
          originalUrl: article.link,
          imageUrl: article.imageUrl || '',
          publishedAt: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
          category: article.categories?.[0] || 'World',
          editorialStyle: 'Guardian',
          isBreaking: false,
          status: 'published'
        });
      }
    }

    await currentDb.collection('syncState').doc('main').set({
      lastSyncAt: new Date().toISOString()
    });

    console.log('News Sync Completed.');
  } catch (error) {
    console.error('Sync Error:', error);
  }
}

async function startServer() {
  app.use(express.json());

  // API Routes
  app.get('/api/sync', async (req, res) => {
    await syncNews();
    res.json({ status: 'Sync triggered' });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Initial sync
    syncNews();
    
    // Sync every 30 minutes
    setInterval(syncNews, 30 * 60 * 1000);
  });
}

startServer();
