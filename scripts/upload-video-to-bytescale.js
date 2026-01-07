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

    // Read the file
    const fileStream = fs.createReadStream(VIDEO_FILE_PATH)
    const formData = new FormData()
    formData.append('file', fileStream, {
      filename: 'how-the-state-government-works.mp4',
      contentType: 'video/mp4'
    })

    // Upload to Bytescale using v1 API
    const response = await fetch('https://api.bytescale.com/v1/files/basic', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BYTESCALE_API_KEY}`,
        ...formData.getHeaders()
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
      // Convert to video processing URL (replace /raw/ with /video/ and add format)
      const videoUrl = fileUrl.replace('/raw/', '/video/') + (fileUrl.includes('/video/') ? '' : '') + '?f=mp4-h264'
      console.log('\n✅ Raw Video URL:', fileUrl)
      console.log('✅ Processed Video URL:', videoUrl)
      console.log('\nAdd this to your .env file:')
      console.log(`VITE_BYTESCALE_VIDEO_URL=${videoUrl}`)
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

