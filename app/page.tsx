'use client'

import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    product_name: '',
    landing_url: '',
    niche: '',
    max_images: 5,
    variants_per_platform: 3,
    human_review_required: true
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formDataObj = new FormData()
      if (file) {
        formDataObj.append('file', file)
      }
      formDataObj.append('data', JSON.stringify(formData))

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formDataObj,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate marketing assets')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadAsset = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          AI Organic Marketing Agent
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Generate viral marketing assets for Twitter, Pinterest, Instagram, LinkedIn & Reddit
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="My Awesome Product"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landing URL *
              </label>
              <input
                type="url"
                required
                value={formData.landing_url}
                onChange={(e) => setFormData({ ...formData, landing_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/product"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niche *
              </label>
              <input
                type="text"
                required
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., productivity, fitness, education"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product File (PDF/TXT/ZIP - Optional)
              </label>
              <input
                type="file"
                accept=".pdf,.txt,.zip"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Images per Platform
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.max_images}
                  onChange={(e) => setFormData({ ...formData, max_images: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variants per Platform
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.variants_per_platform}
                  onChange={(e) => setFormData({ ...formData, variants_per_platform: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="review"
                checked={formData.human_review_required}
                onChange={(e) => setFormData({ ...formData, human_review_required: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="review" className="ml-2 text-sm text-gray-700">
                Require human review
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating Marketing Assets...' : 'Generate Marketing Assets'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Generated Assets</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                result.status === 'success' ? 'bg-green-100 text-green-800' :
                result.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {result.status}
              </span>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Product ID:</strong> {result.product_id}
              </p>
            </div>

            {result.research_insights && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Research Insights</h3>
                <div className="bg-blue-50 p-4 rounded-md text-sm text-gray-700">
                  <p><strong>Trends:</strong> {result.research_insights.trends.join(', ')}</p>
                  <p className="mt-2"><strong>Target Audience:</strong> {result.research_insights.target_audience}</p>
                  <p className="mt-2"><strong>Pain Points:</strong> {result.research_insights.pain_points.join(', ')}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {result.assets?.map((asset: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 capitalize">
                      {asset.platform}
                    </h3>
                    <span className="text-xs text-gray-500">
                      Variant {asset.variant_id}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Caption:</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-800">
                        {asset.caption}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(asset.caption)
                          alert('Caption copied!')
                        }}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        📋 Copy Caption
                      </button>
                    </div>

                    {asset.hashtags && asset.hashtags.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Hashtags:</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                          {asset.hashtags.join(' ')}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(asset.hashtags.join(' '))
                            alert('Hashtags copied!')
                          }}
                          className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          📋 Copy Hashtags
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700">Image Prompt:</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                        {asset.image_prompt}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(asset.image_prompt)
                          alert('Image prompt copied!')
                        }}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        📋 Copy Image Prompt
                      </button>
                    </div>

                    {asset.image_url && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Generated Image:</label>
                        <img
                          src={asset.image_url}
                          alt={asset.platform}
                          className="w-full max-w-md rounded-md border border-gray-300"
                        />
                        <a
                          href={asset.image_url}
                          download={`${asset.platform}_${asset.variant_id}.png`}
                          className="mt-2 inline-block text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          ⬇️ Download Image
                        </a>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <p><strong>CTA:</strong> {asset.cta_text}</p>
                      <p><strong>Best Time:</strong> {asset.optimal_posting_time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => downloadAsset(JSON.stringify(result, null, 2), 'marketing_assets.json')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                Download All Assets (JSON)
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
