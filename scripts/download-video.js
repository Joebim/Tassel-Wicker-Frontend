const https = require('https');
const fs = require('fs');
const path = require('path');

// Video URL and filename
const video = {
  url: 'https://res.cloudinary.com/dygrsvya5/video/upload/v1761149777/LOOP_VIDEO_isr7h3.mp4',
  filename: 'loop-video.mp4'
};

const videosDir = path.join(__dirname, '..', 'public', 'videos');

// Ensure directory exists
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

function downloadVideo(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(videosDir, filename);
    const file = fs.createWriteStream(filePath);
    
    console.log(`Downloading video from: ${url}`);
    console.log(`Saving to: ${filePath}`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;
        
        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const percent = ((downloadedSize / totalSize) * 100).toFixed(2);
          process.stdout.write(`\rDownloading: ${percent}%`);
        });
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`\n✓ Downloaded: ${filename}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        file.close();
        fs.unlinkSync(filePath);
        downloadVideo(response.headers.location, filename).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filePath);
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}

async function download() {
  console.log('Downloading video...\n');
  
  try {
    await downloadVideo(video.url, video.filename);
    console.log('\nDownload complete!');
  } catch (error) {
    console.error(`\n✗ Failed to download video:`, error.message);
    process.exit(1);
  }
}

download();

