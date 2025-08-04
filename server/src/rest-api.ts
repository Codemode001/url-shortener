import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { createShortenedUrl, getBySlug } from "./db/models/shortened-urls";
dotenv.config();

const app = express();
import { db } from "./db/knex";

//middleware
app.use(cors());
app.use(express.json());

/*
##################################################
||                                              ||
||              Example endpoints               ||
||                                              ||
##################################################
*/

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

app.post("/shorten", async (req: Request, res: Response): Promise<any> => {
  try {
    const { original_url } = req.body;

    if (!original_url) {
      return res.status(400).json({ 
        error: "original_url is required" 
      });
    }

    if (!isValidUrl(original_url)) {
      return res.status(400).json({ 
        error: "Invalid URL format" 
      });
    }

    const shortenedUrl = await createShortenedUrl({ original_url });

    res.status(201).json({ 
      success: true,
      data: {
        id: shortenedUrl.id,
        original_url: shortenedUrl.original_url,
        slug: shortenedUrl.slug,
        short_url: `${req.protocol}://${req.get('host')}/${shortenedUrl.slug}`,
        created_at: shortenedUrl.created_at
      }
    });

  } catch (error) {
    console.error('Error creating shortened URL:', error);
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
});

app.get("/:slug", async (req: Request, res: Response): Promise<any> => {
  try {
    const { slug } = req.params;

    // Find the URL by slug
    const urlRecord = await getBySlug(slug);

    if (!urlRecord) {
      return res.status(404).json({ 
        error: "Shortened URL not found" 
      });
    }

    // Check if URL has expired (if you implement expiration later)
    // if (urlRecord.expires_at && new Date() > new Date(urlRecord.expires_at)) {
    //   return res.status(410).json({ 
    //     error: "Shortened URL has expired" 
    //   });
    // }

    // Optional: Track click/analytics here
    // await incrementClickCount(slug);

    // Redirect to original URL
    res.redirect(301, urlRecord.original_url);

  } catch (error) {
    console.error('Error redirecting URL:', error);
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
});

// Root endpoint - Returns a simple hello world message and default client port
app.get("/", async (_req, res) => {
  res.json({ hello: "world", "client-default-port": 3000 });
});

// GET /examples - Fetches all records from the example_foreign_table
app.get("/examples", async (_req, res) => {
  const docs = await db("example_foreign_table").select("*");
  res.json({ docs });
});

// POST /examples - Creates a new record with auth method and name, returns the created document
app.post("/examples", async (req, res) => {
  const { authMethod, name } = req.body;
  const [doc] = await db("example_foreign_table")
    .insert({
      authMethod,
      name,
    })
    .returning("*");
  res.json({ doc });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
