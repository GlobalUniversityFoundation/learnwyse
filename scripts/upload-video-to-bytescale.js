import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BYTESCALE_API_KEY = 'public_G22nj67Ba8soFuYjYVrey2tRYWMy'
const VIDEO_FILE_PATH = path.join(__dirname, '../public/how-the-state-government-works.mp4')

async function uploadVideo() {
  try {
    console.log('Uploading video to Bytescale...')
    console.log('File path:', VIDEO_FILE_PATH)
    
    // Check if file exists
    if (!fs.existsSync(VIDEO_FILE_PATH)) {
      throw new Error(`Video file not found at: ${VIDEO_FILE_PATH}`)
    }

    const fileStats = fs.statSync(VIDEO_FILE_PATH)
    console.log(`File size: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`)

    // Read the file as buffer to ensure proper upload
    const fileBuffer = fs.readFileSync(VIDEO_FILE_PATH)
    const formData = new FormData()
    
    // Append file with proper metadata - use 'file' as the field name
    formData.append('file', fileBuffer, {
      filename: 'how-the-state-government-works.mp4',
      contentType: 'video/mp4',
      knownLength: fileStats.size
    })

    // Get headers from formData
    const headers = formData.getHeaders()
    
    // Upload to Bytescale using v1 API
    console.log('Uploading with headers:', headers)
    const response = await fetch('https://api.bytescale.com/v1/files/basic', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BYTESCALE_API_KEY}`,
        ...headers
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('Upload successful!')
    console.log('Result:', JSON.stringify(result, null, 2))
    
    // Extract the file URL - Bytescale returns different formats
    let fileUrl = result.fileUrl || result.url || result.file?.url || result.path
    
    if (!fileUrl && result.accountId && result.filePath) {
      // Construct URL from accountId and filePath
      fileUrl = `https://upcdn.io/${result.accountId}/raw${result.filePath}`
    }
    
    if (fileUrl) {
      // Test if the raw URL is accessible
      console.log('\n🔍 Testing raw URL accessibility...')
      const testResponse = await fetch(fileUrl, { method: 'HEAD' })
      const contentType = testResponse.headers.get('content-type')
      console.log(`Content-Type: ${contentType}`)
      
      if (contentType && contentType.includes('video')) {
        console.log('✅ Raw URL is serving video correctly!')
      } else {
        console.log('⚠️  Raw URL content-type is:', contentType)
        console.log('   This might still work - browsers can be forgiving')
      }
      
      // Use raw URL directly - Bytescale should serve MP4 files directly
      const rawVideoUrl = fileUrl
      const processedVideoUrl = fileUrl.replace('/raw/', '/video/') + '?f=mp4-h264'
      
      console.log('\n✅ Raw Video URL:', rawVideoUrl)
      console.log('✅ Processed Video URL (requires transcoding):', processedVideoUrl)
      console.log('\n📝 Add this to your .env file:')
      console.log(`VITE_BYTESCALE_VIDEO_URL=${rawVideoUrl}`)
      console.log('\n💡 If raw URL doesn\'t work, try uploading via Bytescale Dashboard instead')
    } else {
      console.log('\n⚠️  Could not extract file URL from response')
      console.log('Please check the response above and manually construct the URL')
    }

  } catch (error) {
    console.error('Error uploading video:', error.message)
    process.exit(1)
  }
}

uploadVideo()

