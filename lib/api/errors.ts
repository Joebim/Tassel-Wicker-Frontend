import { NextResponse } from "next/server";

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export const ErrorCodes = {
  // Cart errors
  CART_NOT_FOUND: "CART_NOT_FOUND",
  CART_ITEM_NOT_FOUND: "CART_ITEM_NOT_FOUND",
  INVALID_QUANTITY: "INVALID_QUANTITY",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  PRODUCT_OUT_OF_STOCK: "PRODUCT_OUT_OF_STOCK",
  PRICE_MISMATCH: "PRICE_MISMATCH",
  SYNC_CONFLICT: "SYNC_CONFLICT",

  // Content errors
  CONTENT_NOT_FOUND: "CONTENT_NOT_FOUND",
  INVALID_CONTENT_FORMAT: "INVALID_CONTENT_FORMAT",
  INVALID_PAGE: "INVALID_PAGE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  UPLOAD_FAILED: "UPLOAD_FAILED",

  // Auth errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // General errors
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;



