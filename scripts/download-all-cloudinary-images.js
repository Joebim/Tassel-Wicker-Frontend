const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

// All unique Cloudinary image URLs found in the codebase
const images = [
  // Header images (already exist but may need update)
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761524366/PROPOSED_HEADER_IMAGE_FOR_PRODUCT_PAGE_mdcg8y.jpg",
    filename: "headers/shop-header.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761149638/_2MK9323_vyzwqm.jpg",
    filename: "headers/contact-header.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761542804/IMAGE_NINE_cdzxti.jpg",
    filename: "headers/about-header.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761542804/IMAGE_SEVEN_w8mzsc.jpg",
    filename: "headers/about-header-alt.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1764234390/_2MK9067_xy8vh2.jpg",
    filename: "headers/terms-header-desktop.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1764506821/TERMS_OF_SERVICE_MOBILE_uhkiez.jpg",
    filename: "headers/terms-header-mobile.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1764234469/_2MK9038_zdzsag.jpg",
    filename: "headers/corporate-bespoke-header-mobile.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763661133/COOKIE_POLICY_syh1yx.jpg",
    filename: "headers/cookie-policy-header.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763661131/PRIVACY_POLICY_ntaqhz.jpg",
    filename: "headers/privacy-policy-header.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763661126/RETURNS_AND_EXCHANGE_1_oubewa.jpg",
    filename: "headers/returns-header.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763659377/SHIPPING_INFORMATION_ipsodq.jpg",
    filename: "headers/shipping-header.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761542830/IMAGE_FIVE_c3hzmh.jpg",
    filename: "headers/corporate-bespoke-header.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/v1763661125/PROPOSED_HEADER_IMAGE_FOR_PRODUCT_PAGE_woxqv9.jpg",
    filename: "headers/countdown-header.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761542808/IMAGE_ONE_iwncig.jpg",
    filename: "products/build-your-basket.jpg",
  },
  
  // Product images
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523697/WICKER_BASKET_jy5cs6.jpg",
    filename: "products/wicker-basket.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523728/BLACK_WICKER_BASKET_xhdnno.jpg",
    filename: "products/black-wicker-basket.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761525451/BRANDED_TOTE_BAG_jno028.jpg",
    filename: "products/branded-tote-bag.jpg",
  },
  
  // About page images
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763659367/UPDATED_ABOUT_IMAGE_ogsr4o.jpg",
    filename: "about/my-why.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1764234195/STACKED_BASKETS_h4nxfk.jpg",
    filename: "about/stacked-baskets.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761149640/_2MK9308_dcgky8.jpg",
    filename: "about/signature-basket.jpg",
  },
  
  // Product item images
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523713/THE_FREE_WRITING_JOURNAL_f84teh.jpg",
    filename: "products/journal.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523710/BRECKLAND_ORCHARD_POSH_POP_a3f5pf.jpg",
    filename: "products/breckland-posh-pop.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523710/MAEGEN_TOMATO_MINT_LEAF_CANDLE_srrcqt.jpg",
    filename: "products/maegen-tomato-candle.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523711/MAEGEN_GREEN_BUBBLE_MATCHES_lhjvjx.jpg",
    filename: "products/maegen-green-matches.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523709/SALTED_CARAMEL_FUDGE_SHORTBREAD_COOKIES_f9fy2o.jpg",
    filename: "products/salted-caramel-cookies.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523684/SHIRLEY_TEMPLE_WINE_emfamv.jpg",
    filename: "products/shirley-temple-wine.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523682/EAU_NUDE_PERFRUME_ast4rj.jpg",
    filename: "products/eau-nude-perfume.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523688/LE_CREUSET_MINI_COCOTTE_IN_GARNET_rnmcgy.jpg",
    filename: "products/le-creuset-cocotte-garnet.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523684/FRANK_S_LUXURY_COOKIES_-_RASPBERRY_SHORTBREAD_ffewbl.jpg",
    filename: "products/frank-raspberry-shortbread.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523685/CARTWRIGHT_BUTLER_COOKIES_-_ORANGE_AND_CRANBERRY_hkkcvc.jpg",
    filename: "products/cartwright-orange-cranberry.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763714626/NEXT_RAMEKINS_phaxjy.jpg",
    filename: "products/ramekins.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224787/YELLOW_RAMEKIN_ml5qy1.jpg",
    filename: "products/yellow-ramekin.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224783/PINK_RAMEKIN_knwhct.jpg",
    filename: "products/pink-ramekin.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224793/LE_CREUSET_MINI_CASSEROLE_IN_CHAMBRAY_zu5tj8.jpg",
    filename: "products/le-creuset-casserole-chambray.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224819/WHITTARD_HOT_CHOCOLATE_qzuwcz.jpg",
    filename: "products/whittard-hot-chocolate.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224821/ORANGE_MILK_CHOCOLATE_wff1dr.jpg",
    filename: "products/orange-milk-chocolate.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1762482220/ALL_BUTTER_SHORTBREAD_mmv2km.jpg",
    filename: "products/all-butter-shortbread.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1762482443/CHOCOLATE_CHUNK_COOKIES_teb8ib.jpg",
    filename: "products/chocolate-chunk-cookies.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224783/APPLE_JUICE_rp7lzt.jpg",
    filename: "products/apple-juice.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224785/MAEGEN_ATINA_CANDLE_IN_RED_khefmd.jpg",
    filename: "products/maegen-atina-candle-red.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224804/BUTTERSCOTCH_CRUNCH_COOKIES_jxseta.jpg",
    filename: "products/butterscotch-crunch-cookies.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224806/STRAWBERRY_COOKIES_yfuvsn.jpg",
    filename: "products/strawberry-cookies.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761224813/VANILLA_WHITE_CHOCOLATE_xxobpy.jpg",
    filename: "products/vanilla-white-chocolate.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523717/COVER_IMAGE_FOR_NYLA_BASKET_ebewca.jpg",
    filename: "products/nyla-basket-cover.jpg",
  },
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523685/COVER_IMAGE_FOR_DURO_BASKET_lc3d6w.jpg",
    filename: "products/duro-basket-cover.jpg",
  },
  
  // Logo for email
  {
    url: "https://res.cloudinary.com/dygrsvya5/image/upload/v1764500935/TASSEL_WICKER_LOGO_PRIMARY_qdzl6u.png",
    filename: "brand/logo-primary.png",
  },
];

const imagesDir = path.join(__dirname, "..", "public", "images");

// Ensure directories exist
function ensureDirectories() {
  const dirs = ["headers", "products", "about", "brand"];
  dirs.forEach((dir) => {
    const fullPath = path.join(imagesDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(imagesDir, filename);
    const dirPath = path.dirname(filePath);
    
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`⊘ Skipped (exists): ${filename}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;

    const request = client
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            const stats = fs.statSync(filePath);
            const sizeInKB = (stats.size / 1024).toFixed(2);
            console.log(`✓ Downloaded: ${filename} (${sizeInKB} KB)`);
            resolve();
          });
        } else if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirects
          file.close();
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          downloadImage(response.headers.location, filename)
            .then(resolve)
            .catch(reject);
        } else {
          file.close();
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(
            new Error(`Failed to download ${filename}: ${response.statusCode}`)
          );
        }
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        reject(err);
      });

    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(new Error(`Timeout downloading ${filename}`));
    });
  });
}

async function downloadAll() {
  console.log("Downloading all Cloudinary images...\n");
  ensureDirectories();

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const image of images) {
    try {
      await downloadImage(image.url, image.filename);
      successCount++;
    } catch (error) {
      if (error.message.includes("Skipped")) {
        skippedCount++;
      } else {
        console.error(`✗ Failed to download ${image.filename}:`, error.message);
        failCount++;
      }
    }
  }

  console.log(`\n=== Download Summary ===`);
  console.log(`✓ Successfully downloaded: ${successCount}`);
  console.log(`⊘ Skipped (already exists): ${skippedCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`Total: ${images.length} images\n`);
}

downloadAll().catch(console.error);

