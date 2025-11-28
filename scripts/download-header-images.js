const https = require('https');
const fs = require('fs');
const path = require('path');

// Map of image URLs to local filenames
const images = [
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1761524366/PROPOSED_HEADER_IMAGE_FOR_PRODUCT_PAGE_mdcg8y.jpg',
    filename: 'shop-header.jpg'
  },
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1761149638/_2MK9323_vyzwqm.jpg',
    filename: 'contact-header.jpg'
  },
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1761542804/IMAGE_NINE_cdzxti.jpg',
    filename: 'about-header.jpg'
  },
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1764234390/_2MK9067_xy8vh2.jpg',
    filename: 'terms-header-desktop.jpg'
  },
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1764234469/_2MK9038_zdzsag.jpg',
    filename: 'terms-header-mobile.jpg'
  },
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1763661133/COOKIE_POLICY_syh1yx.jpg',
    filename: 'cookie-policy-header.jpg'
  },
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1763661131/PRIVACY_POLICY_ntaqhz.jpg',
    filename: 'privacy-policy-header.jpg'
  },
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1763661126/RETURNS_AND_EXCHANGE_1_oubewa.jpg',
    filename: 'returns-header.jpg'
  },
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1763659377/SHIPPING_INFORMATION_ipsodq.jpg',
    filename: 'shipping-header.jpg'
  },
  {
    url: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1761542830/IMAGE_FIVE_c3hzmh.jpg',
    filename: 'corporate-bespoke-header.jpg'
  }
];

const headersDir = path.join(__dirname, '..', 'assets', 'images', 'headers');

// Ensure directory exists
if (!fs.existsSync(headersDir)) {
  fs.mkdirSync(headersDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(headersDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${filename}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        file.close();
        fs.unlinkSync(filePath);
        downloadImage(response.headers.location, filename).then(resolve).catch(reject);
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

async function downloadAll() {
  console.log('Downloading header images...\n');
  
  for (const image of images) {
    try {
      await downloadImage(image.url, image.filename);
    } catch (error) {
      console.error(`✗ Failed to download ${image.filename}:`, error.message);
    }
  }
  
  console.log('\nDownload complete!');
}

downloadAll();


