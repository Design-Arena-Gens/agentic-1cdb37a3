import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import Anthropic from '@anthropic-ai/sdk'

interface RequestData {
  product_name: string
  landing_url: string
  niche: string
  max_images: number
  variants_per_platform: number
  human_review_required: boolean
}

interface PlatformAsset {
  platform: string
  variant_id: number
  caption: string
  hashtags: string[]
  image_prompt: string
  image_url?: string
  cta_text: string
  optimal_posting_time: string
  character_count: number
}

const PLATFORMS = ['twitter', 'pinterest', 'instagram', 'linkedin', 'reddit']

const PLATFORM_SPECS = {
  twitter: { max_chars: 280, image_ratio: '16:9', hashtag_limit: 2 },
  pinterest: { max_chars: 500, image_ratio: '2:3', hashtag_limit: 20 },
  instagram: { max_chars: 2200, image_ratio: '1:1', hashtag_limit: 30 },
  linkedin: { max_chars: 3000, image_ratio: '1.91:1', hashtag_limit: 3 },
  reddit: { max_chars: 40000, image_ratio: '4:3', hashtag_limit: 0 }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const dataString = formData.get('data') as string
    const file = formData.get('file') as File | null

    const data: RequestData = JSON.parse(dataString)

    const product_id = uuidv4()
    const user_id = uuidv4()

    let fileContent = ''
    if (file) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        fileContent = buffer.toString('utf-8')
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        fileContent = '[PDF file uploaded - content would be extracted in production]'
      } else if (file.name.endsWith('.zip')) {
        fileContent = '[ZIP file uploaded - content would be extracted in production]'
      }
    }

    const researchInsights = await generateResearchInsights(data, fileContent)

    const assets: PlatformAsset[] = []

    for (const platform of PLATFORMS) {
      for (let variant = 1; variant <= data.variants_per_platform; variant++) {
        const asset = await generatePlatformAsset(
          platform,
          variant,
          data,
          researchInsights,
          fileContent
        )
        assets.push(asset)
      }
    }

    const response = {
      product_id,
      user_id,
      status: 'success',
      research_insights: researchInsights,
      assets,
      master_assets_s3: `https://example-bucket.s3.amazonaws.com/${product_id}/master_assets.json`,
      research_insights_s3: `https://example-bucket.s3.amazonaws.com/${product_id}/research_insights.json`,
      generated_at: new Date().toISOString(),
      human_review_required: data.human_review_required
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate marketing assets' },
      { status: 500 }
    )
  }
}

async function generateResearchInsights(data: RequestData, fileContent: string) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicKey) {
    return {
      trends: ['User engagement', 'Visual storytelling', 'Authentic content'],
      target_audience: `${data.niche} enthusiasts and professionals`,
      pain_points: ['Time management', 'Quality content creation', 'ROI tracking'],
      viral_hooks: ['Problem-solution narratives', 'Before/after comparisons', 'Expert tips'],
      content_pillars: ['Educational', 'Inspirational', 'Entertaining']
    }
  }

  try {
    const client = new Anthropic({ apiKey: anthropicKey })

    const prompt = `Analyze this product for viral marketing potential:

Product: ${data.product_name}
Niche: ${data.niche}
Landing URL: ${data.landing_url}
${fileContent ? `Product Details: ${fileContent.substring(0, 2000)}` : ''}

Provide a JSON response with:
1. trends: Array of 3-5 current trends in this niche
2. target_audience: Description of ideal customer
3. pain_points: Array of 3-5 pain points this product solves
4. viral_hooks: Array of 3-5 proven viral content strategies
5. content_pillars: Array of 3-5 content themes

Format as valid JSON only.`

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('Research insights error:', error)
  }

  return {
    trends: ['User engagement', 'Visual storytelling', 'Authentic content'],
    target_audience: `${data.niche} enthusiasts and professionals`,
    pain_points: ['Time management', 'Quality content creation', 'ROI tracking'],
    viral_hooks: ['Problem-solution narratives', 'Before/after comparisons', 'Expert tips'],
    content_pillars: ['Educational', 'Inspirational', 'Entertaining']
  }
}

async function generatePlatformAsset(
  platform: string,
  variant: number,
  data: RequestData,
  insights: any,
  fileContent: string
): Promise<PlatformAsset> {
  const specs = PLATFORM_SPECS[platform as keyof typeof PLATFORM_SPECS]

  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicKey) {
    return generateFallbackAsset(platform, variant, data, insights, specs)
  }

  try {
    const client = new Anthropic({ apiKey: anthropicKey })

    const prompt = `Create viral ${platform} marketing content (variant ${variant}):

Product: ${data.product_name}
Niche: ${data.niche}
Landing URL: ${data.landing_url}
Target Audience: ${insights.target_audience}
Pain Points: ${insights.pain_points.join(', ')}

Platform specs:
- Max characters: ${specs.max_chars}
- Hashtag limit: ${specs.hashtag_limit}
- Image ratio: ${specs.image_ratio}

Create a JSON response with:
1. caption: Viral, engaging copy optimized for ${platform} (under ${specs.max_chars} chars)
2. hashtags: Array of ${specs.hashtag_limit} relevant hashtags (empty array if 0)
3. image_prompt: Detailed DALL-E/Midjourney prompt for ${specs.image_ratio} image
4. cta_text: Strong call-to-action
5. optimal_posting_time: Best time to post (e.g., "Mon-Fri 9-11am EST")

Make it conversion-focused and platform-specific. Include the landing URL naturally.
Format as valid JSON only.`

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        platform,
        variant_id: variant,
        caption: parsed.caption,
        hashtags: parsed.hashtags || [],
        image_prompt: parsed.image_prompt,
        cta_text: parsed.cta_text,
        optimal_posting_time: parsed.optimal_posting_time,
        character_count: parsed.caption.length
      }
    }
  } catch (error) {
    console.error(`Error generating ${platform} asset:`, error)
  }

  return generateFallbackAsset(platform, variant, data, insights, specs)
}

function generateFallbackAsset(
  platform: string,
  variant: number,
  data: RequestData,
  insights: any,
  specs: any
): PlatformAsset {
  const captions = [
    `Transform your ${data.niche} journey with ${data.product_name}! 🚀\n\nDiscover why thousands trust us: ${data.landing_url}`,
    `${insights.pain_points[0]}? We've got you covered.\n\n${data.product_name} - ${data.landing_url}`,
    `The ultimate ${data.niche} solution is here! ✨\n\n${data.product_name} changes everything.\n\nLearn more: ${data.landing_url}`
  ]

  const hashtags = specs.hashtag_limit > 0 ? [
    '#' + data.niche.replace(/\s+/g, ''),
    '#' + data.product_name.replace(/\s+/g, ''),
    '#marketing',
    '#growth',
    '#productivity'
  ].slice(0, specs.hashtag_limit) : []

  const imagePrompts = [
    `Professional ${specs.image_ratio} marketing image for ${data.niche} product, modern minimalist design, vibrant colors, high-quality, no text`,
    `Stunning ${specs.image_ratio} visual showcasing ${data.niche} success, lifestyle photography, bright and aspirational, professional lighting`,
    `Eye-catching ${specs.image_ratio} graphic design for ${data.product_name}, bold typography, gradient background, modern aesthetic`
  ]

  const caption = captions[variant - 1] || captions[0]

  return {
    platform,
    variant_id: variant,
    caption,
    hashtags,
    image_prompt: imagePrompts[variant - 1] || imagePrompts[0],
    cta_text: 'Learn More →',
    optimal_posting_time: getOptimalPostingTime(platform),
    character_count: caption.length
  }
}

function getOptimalPostingTime(platform: string): string {
  const times: { [key: string]: string } = {
    twitter: 'Mon-Fri 12-1pm, 5-6pm EST',
    pinterest: 'Sat-Sun 8-11pm EST',
    instagram: 'Wed 11am, Fri 10-11am EST',
    linkedin: 'Tue-Thu 10-11am EST',
    reddit: 'Mon-Fri 6-8am, 12-2pm EST'
  }
  return times[platform] || 'Weekdays 9am-5pm EST'
}
