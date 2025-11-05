# AI Organic Marketing Agent

An autonomous AI system that generates ready-to-copy marketing assets (images/prompts + captions) for Twitter, Pinterest, Instagram, LinkedIn, and Reddit.

## Live Demo

🚀 **[https://agentic-1cdb37a3.vercel.app](https://agentic-1cdb37a3.vercel.app)**

## Features

- **Multi-Platform Support**: Generates optimized content for Twitter, Pinterest, Instagram, LinkedIn, and Reddit
- **AI-Powered Content**: Uses Claude AI for viral marketing copy and research insights
- **Image Prompt Generation**: Creates detailed prompts for AI image generation (DALL-E/Midjourney)
- **Platform-Specific Optimization**: Respects character limits, hashtag rules, and image ratios
- **Variant Generation**: Creates multiple variants per platform for A/B testing
- **Research Insights**: Analyzes trends, target audience, pain points, and viral hooks
- **Copy-to-Clipboard**: Easy copying of captions, hashtags, and image prompts
- **Download Assets**: Export all generated content as JSON

## Input Format

```json
{
  "product_name": "Your Product Name",
  "landing_url": "https://your-landing-page.com",
  "niche": "productivity",
  "max_images": 5,
  "variants_per_platform": 3,
  "human_review_required": true
}
```

Optional: Upload product file (PDF/TXT/ZIP) for deeper content analysis.

## Output Format

```json
{
  "product_id": "<uuid>",
  "status": "success",
  "research_insights": {
    "trends": ["..."],
    "target_audience": "...",
    "pain_points": ["..."],
    "viral_hooks": ["..."]
  },
  "assets": [
    {
      "platform": "twitter",
      "variant_id": 1,
      "caption": "...",
      "hashtags": ["#tag1", "#tag2"],
      "image_prompt": "...",
      "cta_text": "...",
      "optimal_posting_time": "Mon-Fri 12-1pm EST",
      "character_count": 250
    }
  ]
}
```

## Platform Specifications

- **Twitter**: 280 chars, 2 hashtags, 16:9 images
- **Pinterest**: 500 chars, 20 hashtags, 2:3 images
- **Instagram**: 2200 chars, 30 hashtags, 1:1 images
- **LinkedIn**: 3000 chars, 3 hashtags, 1.91:1 images
- **Reddit**: 40000 chars, 0 hashtags, 4:3 images

## Setup (Local Development)

```bash
# Install dependencies
npm install

# Create environment variables (optional)
cp .env.local.example .env.local

# Add your API keys to .env.local
# ANTHROPIC_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here

# Run development server
npm run dev

# Build for production
npm run build
```

## API Endpoints

### POST /api/generate

Generates marketing assets for all platforms.

**Request**: Multipart form data
- `data`: JSON string with product info
- `file`: Optional product file (PDF/TXT/ZIP)

**Response**: JSON with generated assets

## Environment Variables

All environment variables are optional. The system works with fallback content if no API keys are provided.

- `ANTHROPIC_API_KEY`: For AI-powered content generation
- `OPENAI_API_KEY`: For actual image generation (future feature)
- `AWS_ACCESS_KEY_ID`: For S3 storage (future feature)
- `AWS_SECRET_ACCESS_KEY`: For S3 storage (future feature)

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Anthropic Claude**: AI content generation
- **Vercel**: Deployment platform

## Usage

1. Visit [https://agentic-1cdb37a3.vercel.app](https://agentic-1cdb37a3.vercel.app)
2. Fill in your product details
3. (Optional) Upload product file for deeper analysis
4. Click "Generate Marketing Assets"
5. Copy captions, hashtags, and image prompts
6. Download JSON for archiving

## Future Enhancements

- [ ] Direct image generation via DALL-E/Stable Diffusion
- [ ] S3 storage integration
- [ ] Batch processing for multiple products
- [ ] Custom platform selection
- [ ] A/B testing analytics
- [ ] Scheduled publishing (via API)
- [ ] User authentication
- [ ] Asset history/library

## License

MIT
