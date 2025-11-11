import type {
  SubProductItem,
  ProductWithItems,
  ProductVariant,
  ShopProduct,
  ShopProductItem,
  StandaloneProduct,
  ProductDataItem,
} from "../types/productData";

// Helper function to convert legacy product format to variants format
const createVariantFromLegacy = (
  image: string,
  price: number
): ProductVariant[] => {
  return [{ name: "Default", image, price }];
};

const basketProducts: ProductWithItems[] = [
  {
    id: "1",
    name: "The Dee Basket",
    items: [
      {
        id: "dee-1",
        name: "The Free Writing Journal",
        description:
          "A beautifully crafted 280 lined hardback journal designed for reflection and clarity. The orange fabric spine contrasts the deep blue covers, while the embossed gold quote “I write so I can hear myself think” inspires mindful writing and meditative moments.",
        category: "Stationery",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523713/THE_FREE_WRITING_JOURNAL_f84teh.jpg",
          45
        ),
        details: {
          brand: "Positive Planner",
          weight: "0.725kg",
          dimensions: "24.5 x 17.5 x 2 cm",
          pages: "280",
          paper: "FSC 120gsm",
        },
      },
      {
        id: "dee-2",
        name: "Breckland Orchard Posh Pop",
        description:
          "A refreshing blend of ripe strawberries and tangy rhubarb, perfectly balanced for a bright, crisp taste and finished with a hint of vanilla.",
        category: "Beverages",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523710/BRECKLAND_ORCHARD_POSH_POP_a3f5pf.jpg",
          8
        ),
        details: {
          weight: "39.6 kilograms",
          volume: "275 Millilitres",
        },
      },
      {
        id: "dee-3",
        name: "Maegen Tomato & Mint Leaf Candle",
        description:
          "Bold and contemporary, this colourful striped glass candle features a refreshing scent and can be reused as distinctive glassware once the candle is finished.",
        category: "Home & Living",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523710/MAEGEN_TOMATO_MINT_LEAF_CANDLE_srrcqt.jpg",
          35
        ),
        details: {
          netWeight: "280g / 10oz",
          wax: "Soy Wax",
        },
      },
      {
        id: "dee-4",
        name: "Maegen Green Bubble Matches",
        description:
          "Add a touch of colour to your interiors with these stylish bubble matches housed in a tactile glass bottle—perfect alongside your favourite candle.",
        category: "Home & Living",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523711/MAEGEN_GREEN_BUBBLE_MATCHES_lhjvjx.jpg",
          18
        ),
        details: {
          quantity: "100 long matches",
          dimensions: "Height 15.5cm | Width 10cm | Depth 4.5cm",
        },
      },
      {
        id: "dee-5",
        name: "Frank's Salted Caramel Fudge Shortbread Cookies",
        description:
          "Rich, buttery shortbread enhanced with swirls of salted caramel fudge. Each cookie balances sweetness with subtle saltiness for an irresistible treat.",
        category: "Food & Treats",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523709/SALTED_CARAMEL_FUDGE_SHORTBREAD_COOKIES_f9fy2o.jpg",
          12
        ),
        details: {
          ingredients: [
            "Wheat Flour (Calcium Carbonate, Iron, Nicotinamide, Thiamine)",
            "Salted Butter",
            "Sugar",
            "Caramel and Sea Salt Fudge (8%)",
            "Glucose Syrup",
            "Skimmed Sweetened Condensed Milk",
            "Partly Hydrogenated Palm Kernel Oil",
            "Fondant (Sugar, Glucose Syrup)",
            "Sea Salt (1%)",
            "Emulsifier: Sunflower Lecithin",
            "Flavouring",
          ],
        },
      },
      {
        id: "dee-6",
        name: "Black Wicker Basket",
        description:
          "A medium-sized black wicker basket with a branded removable cotton liner and vegan leather straps. Handmade by skilled weavers, each piece is eco-friendly, designed to last, and easy to repurpose for everyday living.",
        category: "Baskets",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523728/BLACK_WICKER_BASKET_xhdnno.jpg",
          85
        ),
        details: {
          dimensions: "Length: 35cm | Width: 47cm | Height: 21cm",
          materials: [
            "Natural wicker",
            "140g/sqm cotton liner",
            "Vegan leather straps",
          ],
        },
      },
    ],
  },
  {
    id: "2",
    name: "The Duro Basket",
    items: [
      {
        id: "duro-1",
        name: "Shirley Temple Wine by Black Lines",
        description:
          "This non-alcoholic cocktail is a vibrant blend of grenadine, ginger ale, raspberry soda, fresh lemon, blood orange, and bitters. 0.0% ABV | 750ml.",
        category: "Beverages",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523684/SHIRLEY_TEMPLE_WINE_emfamv.jpg",
          25
        ),
        details: {
          alcoholContent: "0.0% ABV",
          volume: "750ml",
          ingredients: [
            "Grenadine",
            "Ginger ale",
            "Raspberry soda",
            "Fresh lemon",
            "Blood orange",
            "Bitters",
          ],
        },
      },
      {
        id: "duro-2",
        name: "Eau Nude Perfume Set",
        description:
          "A medley of lush red fruits, opulent florals, soft musk, and creamy vanilla. This elegant gift set includes a full-size and travel-size perfume plus a vitamin E–enriched body lotion that layers your signature scent throughout the day.",
        category: "Beauty & Fragrance",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523682/EAU_NUDE_PERFRUME_ast4rj.jpg",
          95
        ),
        details: {
          contents: [
            "100ml Eau Nude Eau de Parfum",
            "10ml Eau Nude Eau de Parfum",
            "200ml Eau Nude Body Lotion",
          ],
          fragranceNotes: {
            top: "Raspberry & Mandarin",
            middle: "Jasmine & Rose",
            base: "Patchouli & Amber",
          },
        },
      },
      {
        id: "duro-3",
        name: "Le Creuset Mini Cocotte (Garnet)",
        description:
          "This charming petite casserole is perfect for single servings or small-plate side dishes. Ideal for dips, condiments, and nibbles, it combines playful design with everyday practicality and includes a matching lid for heating sauces or keeping snacks fresh.",
        category: "Kitchen & Dining",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523688/LE_CREUSET_MINI_COCOTTE_IN_GARNET_rnmcgy.jpg",
          65
        ),
        details: {
          material: "Stoneware (Glazed)",
          care: "Dishwasher Safe",
          storage: "Freezer Compatible",
          heatSource: "Grill, Microwave and Oven compatible",
          temperatureRange: "-23℃ to 260℃",
        },
      },
      {
        id: "duro-4",
        name: "Frank's Raspberry Shortbread Cookies",
        description:
          "Hand-baked in Hereford with the finest natural ingredients. Buttery, delicate shortbread infused with the bright, tangy sweetness of real raspberries. Pairs well with tea or coffee.",
        category: "Food & Treats",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523684/FRANK_S_LUXURY_COOKIES_-_RASPBERRY_SHORTBREAD_ffewbl.jpg",
          12
        ),
        details: {
          ingredients: [
            "Wheat Flour (Calcium Carbonate, Iron, Nicotinamide, Thiamine)",
            "Salted Butter (32%)",
            "Sugar",
            "Raspberries (1%) (100% Natural Raspberries)",
            "Natural Raspberry Flavouring (<1%)",
          ],
        },
      },
      {
        id: "duro-5",
        name: "Cartwright & Butler Winter Spiced Orange and Cranberry Shortbread Cookies",
        description:
          "Buttery shortbread infused with orange and studded with cranberries, gently topped with cinnamon sugar for a comforting, festive treat from Cartwright & Butler.",
        category: "Food & Treats",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523685/CARTWRIGHT_BUTLER_COOKIES_-_ORANGE_AND_CRANBERRY_hkkcvc.jpg",
          15
        ),
        details: {
          ingredients: [
            "Wheat Flour (Calcium, Iron, Niacin, Thiamine)",
            "Salted Butter (29%)",
            "Milk",
            "Salt",
            "Sugar",
            "Maize Starch",
            "Cranberries (6%)",
            "Cane Sugar",
            "Sunflower Oil",
            "Cinnamon",
            "Natural Flavouring: Orange Oil (1%)",
          ],
          packageDimensions: "16.9 x 7.5 x 6.7 cm",
          weight: "200g",
          storage:
            "Store in a cool, dry place away from direct sunlight. Once opened, consume within one week.",
        },
      },
      {
        id: "duro-6",
        name: "Natural Wicker Basket",
        description:
          "A medium-sized wicker basket with a branded removable cotton liner and vegan leather straps. Handmade by skilled weavers, each piece is eco-friendly, designed to last, and can be beautifully repurposed for storage, picnics, or home styling.",
        category: "Baskets",
        variants: createVariantFromLegacy(
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523697/WICKER_BASKET_jy5cs6.jpg",
          85
        ),
        details: {
          dimensions: "Length: 35cm | Width: 47cm | Height: 21cm",
          materials: [
            "Natural wicker",
            "140g/sqm cotton liner",
            "Vegan leather straps",
          ],
        },
      },
    ],
  },
];

const getBasketItems = (basketId: string): SubProductItem[] => {
  const basket = basketProducts.find((product) => product.id === basketId);
  return basket ? basket.items : [];
};

const toShopItem = (item: SubProductItem): ShopProductItem => ({
  ...item,
  image: item.image ?? item.variants[0]?.image ?? "",
});

// Extract all sub-products from main shop products
export const getAllSubProducts = (): SubProductItem[] => {
  const allItems = basketProducts.flatMap((product) => product.items);
  const uniqueItems = allItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.name === item.name)
  );
  return uniqueItems;
};

export const getAdditionalProducts = (): StandaloneProduct[] => [
  {
    id: "add-1",
    name: "Ramekins with Lid by Next (2)",
    description:
      "These ceramic, flower-shaped ramekins come in a set of two. Perfect for sauces, dips, sweet treats, nibbles, or soufflés, they bring both style and versatility to your table. Their elegant design and durable craftsmanship make them as delightful to display as they are to use.",
    category: "Kitchen & Dining",
    variants: [
      {
        name: "Yellow",
        image:
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224787/YELLOW_RAMEKIN_ml5qy1.jpg",
        price: 28,
      },
      {
        name: "Pink",
        image:
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224783/PINK_RAMEKIN_knwhct.jpg",
        price: 28,
      },
    ],
    details: {
      dimensions: "Height 11cm | Width 11cm | Depth 11cm",
    },
  },
  {
    id: "add-2",
    name: "Le Creuset Mini Cocotte",
    description:
      "This charming petite casserole is perfect for single servings or small-plate side dishes. Ideal for dips, condiments, and nibbles, it combines playful design with everyday practicality. Finished with a matching lid, it’s perfect for heating sauces or keeping snacks fresh.",
    category: "Kitchen & Dining",
    variants: [
      {
        name: "Chambray",
        image:
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224793/LE_CREUSET_MINI_CASSEROLE_IN_CHAMBRAY_zu5tj8.jpg",
        price: 65,
      },
      {
        name: "Garnet",
        image:
          "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523688/LE_CREUSET_MINI_COCOTTE_IN_GARNET_rnmcgy.jpg",
        price: 65,
      },
    ],
    details: {
      material: "Stoneware (Glazed)",
      care: "Dishwasher Safe",
      storage: "Freezer Compatible",
      heatSource: "Grill, Microwave and Oven compatible",
      temperatureRange: "-23℃ to 260℃",
    },
  },
  {
    id: "add-3",
    name: "Whittard Luxury Hot Chocolate",
    description:
      "Smooth milk chocolate powder sealed in a reusable clip-top tin. Ideal for making hot chocolate or adding to desserts.",
    category: "Food & Treats",
    variants: createVariantFromLegacy(
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224819/WHITTARD_HOT_CHOCOLATE_qzuwcz.jpg",
      22
    ),
    details: {
      ingredients: [
        "Sugar",
        "Cocoa Powder (39%)",
        "Dextrose",
        "Flavouring",
        "Salt",
      ],
      weight: "200g",
      storage: "Best kept in a cool, dry place.",
    },
  },
  {
    id: "add-4",
    name: "Frank's Orange Milk Chocolate Dipped Shortbread",
    description:
      "A buttery, crisp shortbread infused with natural orange flavour and partially dipped in smooth milk chocolate. The zesty citrus notes complement the rich, creamy chocolate.",
    category: "Food & Treats",
    variants: createVariantFromLegacy(
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224821/ORANGE_MILK_CHOCOLATE_wff1dr.jpg",
      14
    ),
    details: {
      ingredients: [
        "Wheat Flour (Calcium Carbonate, Iron, Nicotinamide, Thiamine)",
        "Salted Butter",
        "Sugar",
        "Milk Chocolate (2%)",
        "Cocoa Butter",
        "Cocoa Mass",
        "Emulsifier: Soya Lecithin, Natural Vanilla Flavour",
        "Natural Orange Extract (1%)",
        "Rapeseed Oil",
      ],
    },
  },
  {
    id: "add-5",
    name: "Frank's All Butter Shortbread",
    description:
      "A buttery shortbread made with quality ingredients for a rich, smooth texture and classic taste. Great alongside tea or coffee, or enjoyed on its own.",
    category: "Food & Treats",
    variants: createVariantFromLegacy(
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1762482220/ALL_BUTTER_SHORTBREAD_mmv2km.jpg",
      10
    ),
    details: {
      ingredients: [
        "Wheat Flour (Calcium Carbonate, Iron, Nicotinamide, Thiamine)",
        "Salted Butter (32%)",
        "Sugar",
      ],
    },
  },
  {
    id: "add-6",
    name: "Frank's Chocolate Chunk Shortbread",
    description:
      "Buttery shortbread with generous pieces of milk chocolate throughout. Made with the finest quality ingredients for a rich, consistent texture and flavour in every bite.",
    category: "Food & Treats",
    variants: createVariantFromLegacy(
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1762482443/CHOCOLATE_CHUNK_COOKIES_teb8ib.jpg",
      12
    ),
    details: {
      ingredients: [
        "Wheat Flour (Calcium Carbonate, Iron, Nicotinamide, Thiamine)",
        "Salted Butter",
        "Sugar",
        "Chocolate Chunks (8%)",
        "Cocoa Mass",
        "Emulsifier: Soya Lecithin",
        "Natural Vanilla Flavouring (may contain traces of milk)",
      ],
    },
  },
  {
    id: "add-7",
    name: "Cartwright & Butler Apple Juice",
    description:
      "Made of 100% fresh apples, this pure apple juice is naturally sweet and refreshing. It is ideal for drinking on its own or using in recipes.",
    category: "Beverages",
    variants: createVariantFromLegacy(
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224783/APPLE_JUICE_rp7lzt.jpg",
      6
    ),
    details: {
      ingredients: ["100% fresh apples"],
      volume: "250ml",
      storage:
        "Once opened, keep refrigerated below 7°C and consume within 5 days.",
    },
  },
  {
    id: "add-8",
    name: "Maegen Red Bubble Matches",
    description:
      "Add a touch of colour to your interiors with the Maegen bubble matches. Housed in a stylish, tactile glass bottle, they pair perfectly with your favourite candle.",
    category: "Home & Living",
    variants: createVariantFromLegacy(
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224785/MAEGEN_ATINA_CANDLE_IN_RED_khefmd.jpg",
      18
    ),
    details: {
      quantity: "100 long matches",
      dimensions: "Height 15.5cm | Width 10cm | Depth 4.5cm",
    },
  },
  {
    id: "add-9",
    name: "Cartwright & Butler Butterscotch Crunch Cookies",
    description:
      "Crisp cookies made with butter and brown sugar, baked with pieces of sweet butterscotch for a light crunch and balanced flavour.",
    category: "Food & Treats",
    variants: createVariantFromLegacy(
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224804/BUTTERSCOTCH_CRUNCH_COOKIES_jxseta.jpg",
      15
    ),
    details: {
      ingredients: [
        "Wheat Flour (Calcium, Iron, Niacin, Thiamin)",
        "Salted Butter (25%)",
        "Milk",
        "Salt",
        "Butter Sweets (10%)",
        "Brown Sugar",
        "Glucose Syrup",
        "Natural Flavoring",
        "Rice Flour",
        "Flavorings",
      ],
      packageDimensions: "6.5 x 7.5 x 16.5 cm",
      weight: "200g",
      storage:
        "Store in a cool, dry place away from direct sunlight. Once opened, consume within one week.",
    },
  },
  {
    id: "add-10",
    name: "Cartwright & Butler Strawberry & White Chocolate Cookies",
    description:
      "Baked with chunks of white chocolate and pieces of strawberry, these cookies bring together a mix of gentle sweetness and texture.",
    category: "Food & Treats",
    variants: createVariantFromLegacy(
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224806/STRAWBERRY_COOKIES_yfuvsn.jpg",
      16
    ),
    details: {
      ingredients: [
        "Wheat Flour (Calcium, Iron, Niacin, Thiamine)",
        "Salted Butter",
        "Sugar",
        "White Chocolate Chunks (11%)",
        "Whole Milk Powder",
        "Cocoa Butter",
        "Skimmed Milk Powder",
        "Emulsifier: Soya Lecithin",
        "Natural Vanilla Flavouring",
        "Strawberry Nuggets (5%)",
        "Strawberry Juice",
        "Lemon Pulp",
        "Gelling Agent: Pectin",
        "Oat Fibres",
        "Natural Flavouring",
        "Elderberry",
        "Aronia Juice Concentrate",
      ],
      packageDimensions: "16.6 x 6.6 x 7.3 cm",
      weight: "200g",
      storage:
        "Store in a cool, dry place away from direct sunlight. Once opened, consume within one week.",
    },
  },
  {
    id: "add-11",
    name: "Frank's Dipped Shortbread Vanilla White Chocolate",
    description:
      "A buttery, crisp shortbread infused with natural vanilla flavour and partially dipped in smooth white chocolate. The delicate vanilla notes complement the rich, creamy white chocolate.",
    category: "Food & Treats",
    variants: createVariantFromLegacy(
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761224813/VANILLA_WHITE_CHOCOLATE_xxobpy.jpg",
      14
    ),
    details: {
      ingredients: [
        "Wheat Flour",
        "Salted Butter",
        "Sugar",
        "White Chocolate (2%)",
        "Natural Vanilla Extract (1%)",
      ],
    },
  },
];

export const shopProducts: ShopProduct[] = [
  {
    id: "1",
    name: "The Dee Basket",
    price: 670,
    image:
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523717/COVER_IMAGE_FOR_NYLA_BASKET_ebewca.jpg",
    category: "Baskets",
    description:
      "My personal favourite. This basket mirrors my love for meditative and slow living. It is designed to inspire mindfulness, presence, and moments of reflection throughout the day.",
    isNew: false,
    isFeatured: true,
    items: getBasketItems("1").map(toShopItem),
    details: {
      basketContents: [
        "The Free Writing Journal",
        "Breckland Orchard Posh Pop",
        "Maegen Tomato & Mint Leaf Candle",
        "Maegen Green Bubble Matches",
        "Frank’s Salted Caramel Fudge Shortbread Cookies",
        "Black Wicker Basket",
      ],
      note: "Curated to inspire mindfulness, presence, and moments of reflection throughout the day.",
      basketIncludes:
        "Includes a black wicker basket with removable cotton liner and vegan leather straps.",
    },
  },
  {
    id: "2",
    name: "The Duro Basket",
    price: 670,
    image:
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523685/COVER_IMAGE_FOR_DURO_BASKET_lc3d6w.jpg",
    category: "Baskets",
    description:
      'Derived from the Yoruba name Durojaiye, meaning "to wait and enjoy life." This basket is a meditation on time and resilience. Named after my mother, the Duro basket is a tribute to her strength, grace, love, and enduring spirit.',
    isNew: true,
    isFeatured: false,
    items: getBasketItems("2").map(toShopItem),
    details: {
      basketContents: [
        "Shirley Temple Wine by Black Lines",
        "Eau Nude Perfume Set",
        "Le Creuset Mini Cocotte (Garnet)",
        "Frank’s Raspberry Shortbread Cookies",
        "Cartwright & Butler Winter Spiced Orange and Cranberry Shortbread Cookies",
        "Natural Wicker Basket",
      ],
      note: "A meditation on time and resilience—a tribute to strength, grace, love, and enduring spirit.",
      basketIncludes:
        "Includes a natural wicker basket with removable cotton liner and vegan leather straps.",
    },
  },
  {
    id: "3",
    name: "Build Your Basket",
    price: 0,
    image:
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761542808/IMAGE_ONE_iwncig.jpg",
    category: "Custom",
    description:
      "Create a celebration basket that's uniquely yours. Choose from our range of handpicked products and build a personalised basket for any occasion.",
    isNew: false,
    isFeatured: true,
    isCustom: true,
    items: [],
    customOptions: {
      basketColors: ["Natural Wicker Basket", "Black Wicker Basket"],
      productRange: "Select 3–5 products from our catalogue",
      note: "Our wicker baskets are available exclusively as part of a personalised set and are not available for individual purchase.",
    },
    details: {
      experience:
        "Create a celebration basket that’s uniquely yours with handpicked products for any occasion.",
      selection:
        "Select between three and five products, then choose the wicker basket colour that suits your story.",
      support:
        "Our team is available at info@tasselandwicker.com if you need guidance curating your basket.",
    },
  },
  {
    id: "4",
    name: "Branded Tote Bag",
    price: 120,
    image:
      "https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761525451/BRANDED_TOTE_BAG_jno028.jpg",
    category: "Accessories",
    description:
      "Made from recycled cotton and polyester, this unisex, lightweight and durable bag is built for everyday use. Its simple, timeless design makes it a practical and sustainable choice.",
    isNew: true,
    isFeatured: false,
    details: {
      composition: "80% recycled cotton, 20% recycled polyester canvas",
      dimensions: "37 x 49 x 14cm",
      size: "One size",
      weight: "300 GSM",
    },
  },
];

export const getAllProducts = (): ProductDataItem[] => {
  return [...getAllSubProducts(), ...getAdditionalProducts()];
};
