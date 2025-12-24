import { ContentPage, AboutPageContent } from "@/types/content";
import { CartItem } from "@/types/cart";

const VALID_PAGES: ContentPage[] = [
  "about",
  "cookie-policy",
  "privacy-policy",
  "terms-of-service",
  "returns",
  "shipping",
];

export function isValidPage(page: string): page is ContentPage {
  return VALID_PAGES.includes(page as ContentPage);
}

export function validateAboutContent(content: string): {
  valid: boolean;
  data?: AboutPageContent;
  error?: string;
} {
  try {
    const parsed = JSON.parse(content) as Partial<AboutPageContent>;

    const requiredFields: (keyof AboutPageContent)[] = [
      "heroImage",
      "myWhyTitle",
      "myWhyText1",
      "myWhyText2",
      "myWhyImage",
      "ourStoryTitle",
      "ourStoryText1",
      "ourStoryText2",
      "ourStoryImage",
      "signature",
      "signatureTitle",
      "builtForTitle",
      "builtForVideos",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        !(field in parsed) ||
        parsed[field] === undefined ||
        parsed[field] === null
    );

    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    // Validate builtForVideos is an array
    if (!Array.isArray(parsed.builtForVideos)) {
      return {
        valid: false,
        error: "builtForVideos must be an array",
      };
    }

    // Validate all other fields are strings
    const stringFields = requiredFields.filter((f) => f !== "builtForVideos");
    const invalidFields = stringFields.filter(
      (field) => typeof parsed[field] !== "string"
    );

    if (invalidFields.length > 0) {
      return {
        valid: false,
        error: `Invalid field types (must be strings): ${invalidFields.join(
          ", "
        )}`,
      };
    }

    return {
      valid: true,
      data: parsed as AboutPageContent,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid JSON format",
    };
  }
}

export function validateCartItem(item: Partial<CartItem>): {
  valid: boolean;
  error?: string;
} {
  if (!item.id) {
    return { valid: false, error: "Item ID is required" };
  }
  if (!item.productId) {
    return { valid: false, error: "Product ID is required" };
  }
  if (!item.name) {
    return { valid: false, error: "Product name is required" };
  }
  if (typeof item.price !== "number" || item.price < 0) {
    return { valid: false, error: "Valid price is required" };
  }
  if (typeof item.quantity !== "number" || item.quantity <= 0) {
    return { valid: false, error: "Quantity must be greater than 0" };
  }

  return { valid: true };
}

export function validateFileUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["application/pdf"];

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only PDF files are allowed",
    };
  }

  return { valid: true };
}




