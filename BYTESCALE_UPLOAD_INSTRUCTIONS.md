# Bytescale Video Upload Instructions

## Issue
The API upload is storing files incorrectly (returning `multipart/form-data` instead of `video/mp4`).

## Solution: Manual Upload via Bytescale Dashboard

1. **Go to Bytescale Dashboard**: https://www.bytescale.com/dashboard

2. **Upload the video file**:
   - Navigate to your account (Account ID: `G22nj67`)
   - Click "Upload" or use the upload widget
   - Upload `public/how-the-state-government-works.mp4` (209MB)

3. **Get the file URL**:
   - After upload, you'll get a URL like: `https://upcdn.io/G22nj67/raw/path/to/file.mp4`
   - Copy this URL

4. **Update environment variable**:
   - Add to `.env` file: `VITE_BYTESCALE_VIDEO_URL=<your-url-here>`
   - Add to Vercel environment variables in project settings

5. **Optional: Use processed video** (for better compression):
   - Replace `/raw/` with `/video/` and add `?f=mp4-h264`
   - Example: `https://upcdn.io/G22nj67/video/path/to/file.mp4?f=mp4-h264`
   - Note: This requires transcoding which may take time for large files

## Alternative: Use Raw File Directly
If the uploaded file works, you can use the raw URL directly in the video player without processing.

