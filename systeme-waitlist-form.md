# Tassel & Wicker Waitlist Form - Systeme.io

## HTML & CSS Code

```html
<style>
  /* Base font family */
  * {
    font-family: "Balgin", "Mathilda", "Inter", system-ui, sans-serif;
  }

  /* Main Section - Dark gradient background */
  #section-96d6a3a5 {
    position: relative !important;
    width: 100% !important;
    min-height: 100vh !important;
    background: linear-gradient(
      135deg,
      #1a1a1a 0%,
      #2d0318 50%,
      #1a1a1a 100%
    ) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 60px 20px !important;
    overflow: hidden !important;
  }

  /* Subtle glow effect */
  #section-96d6a3a5::before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 800px !important;
    height: 800px !important;
    background: radial-gradient(
      circle,
      rgba(76, 6, 44, 0.3) 0%,
      transparent 70%
    ) !important;
    pointer-events: none !important;
    z-index: 0 !important;
  }

  /* Outer Row Container */
  #row-62980640 {
    position: relative !important;
    z-index: 1 !important;
    width: 100% !important;
    max-width: 600px !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 40px !important;
  }

  /* Welcome Text Row */
  #row-5391a5fc {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-bottom: 10px !important;
  }

  #text-09ab7064,
  #text-09ab7064 * {
    font-size: 14px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.3em !important;
    color: rgba(255, 255, 255, 0.7) !important;
    text-align: center !important;
    line-height: 1.6 !important;
    margin: 0 !important;
  }

  /* Main Heading Row */
  #row-c0a7c5fb {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-bottom: 10px !important;
  }

  #text-2519d4c4,
  #text-2519d4c4 * {
    font-size: 32px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.15em !important;
    color: #ffffff !important;
    text-align: center !important;
    line-height: 1.4 !important;
    margin: 0 !important;
  }

  /* Description Text Row */
  #row-680b7735 {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-bottom: 10px !important;
  }

  #text-c9d92f2b,
  #text-c9d92f2b * {
    font-size: 16px !important;
    font-weight: 200 !important;
    color: rgba(255, 255, 255, 0.85) !important;
    text-align: center !important;
    line-height: 1.8 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }

  /* CTA Text Row */
  #row-303c7d89 {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-bottom: 30px !important;
  }

  #text-ed83b9fa,
  #text-ed83b9fa * {
    font-size: 14px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.2em !important;
    color: rgba(255, 255, 255, 0.8) !important;
    text-align: center !important;
    line-height: 1.6 !important;
    margin: 0 !important;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    #section-96d6a3a5 {
      padding: 40px 16px !important;
    }

    #row-62980640 {
      gap: 30px !important;
    }

    #text-2519d4c4,
    #text-2519d4c4 * {
      font-size: 26px !important;
      letter-spacing: 0.12em !important;
    }

    #text-c9d92f2b,
    #text-c9d92f2b * {
      font-size: 15px !important;
    }
  }

  @media (max-width: 640px) {
    #section-96d6a3a5 {
      padding: 30px 12px !important;
    }

    #row-62980640 {
      gap: 24px !important;
    }

    #text-09ab7064,
    #text-09ab7064 * {
      font-size: 12px !important;
      letter-spacing: 0.25em !important;
    }

    #text-2519d4c4,
    #text-2519d4c4 * {
      font-size: 22px !important;
      letter-spacing: 0.1em !important;
    }

    #text-c9d92f2b,
    #text-c9d92f2b * {
      font-size: 14px !important;
      line-height: 1.6 !important;
    }

    #text-ed83b9fa,
    #text-ed83b9fa * {
      font-size: 13px !important;
    }
  }

  @media (max-width: 480px) {
    #text-2519d4c4,
    #text-2519d4c4 * {
      font-size: 20px !important;
    }

    #text-c9d92f2b,
    #text-c9d92f2b * {
      font-size: 13px !important;
    }
  }
</style>
```

## Mobile-Specific CSS Code (Compact & Intuitive)

```html
<style>
  /* Base font family */
  * {
    font-family: "Balgin", "Mathilda", "Inter", system-ui, sans-serif;
  }

  /* Main Section - Dark gradient background (Mobile Optimized) */
  #section-96d6a3a5 {
    position: relative !important;
    width: 100% !important;
    min-height: 100vh !important;
    background: linear-gradient(
      135deg,
      #1a1a1a 0%,
      #2d0318 50%,
      #1a1a1a 100%
    ) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 24px 16px !important; /* Reduced padding for mobile */
    overflow: hidden !important;
  }

  /* Subtle glow effect (Smaller for mobile) */
  #section-96d6a3a5::before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 500px !important; /* Smaller glow */
    height: 500px !important;
    background: radial-gradient(
      circle,
      rgba(76, 6, 44, 0.25) 0%,
      transparent 70%
    ) !important;
    pointer-events: none !important;
    z-index: 0 !important;
  }

  /* Outer Row Container (Compact Mobile Layout) */
  #row-62980640 {
    position: relative !important;
    z-index: 1 !important;
    width: 100% !important;
    max-width: 100% !important; /* Full width on mobile */
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important; /* Reduced gap for compact layout */
    padding: 0 8px !important;
  }

  /* Welcome Text Row (Compact) */
  #row-5391a5fc {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-bottom: 4px !important; /* Minimal margin */
  }

  #text-09ab7064,
  #text-09ab7064 * {
    font-size: 10px !important; /* Smaller for mobile */
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.2em !important; /* Reduced letter spacing */
    color: rgba(255, 255, 255, 0.65) !important;
    text-align: center !important;
    line-height: 1.4 !important; /* Tighter line height */
    margin: 0 !important;
  }

  /* Main Heading Row (Compact) */
  #row-c0a7c5fb {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-bottom: 6px !important; /* Minimal margin */
  }

  #text-2519d4c4,
  #text-2519d4c4 * {
    font-size: 18px !important; /* Smaller heading for mobile */
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important; /* Reduced letter spacing */
    color: #ffffff !important;
    text-align: center !important;
    line-height: 1.2 !important; /* Tighter line height */
    margin: 0 !important;
    padding: 0 8px !important; /* Small horizontal padding */
  }

  /* Description Text Row (Compact) */
  #row-680b7735 {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-bottom: 8px !important; /* Minimal margin */
  }

  #text-c9d92f2b,
  #text-c9d92f2b * {
    font-size: 12px !important; /* Smaller description */
    font-weight: 200 !important;
    color: rgba(255, 255, 255, 0.8) !important;
    text-align: center !important;
    line-height: 1.5 !important; /* Tighter line height */
    margin: 0 !important;
    max-width: 100% !important;
    padding: 0 4px !important; /* Minimal padding */
  }

  /* CTA Text Row (Compact) */
  #row-303c7d89 {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-bottom: 12px !important; /* Reduced margin */
  }

  #text-ed83b9fa,
  #text-ed83b9fa * {
    font-size: 11px !important; /* Smaller CTA text */
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.15em !important; /* Reduced letter spacing */
    color: rgba(255, 255, 255, 0.75) !important;
    text-align: center !important;
    line-height: 1.4 !important; /* Tighter line height */
    margin: 0 !important;
  }

  /* Extra Small Mobile Optimization */
  @media (max-width: 360px) {
    #section-96d6a3a5 {
      padding: 20px 12px !important;
    }

    #row-62980640 {
      gap: 12px !important;
      padding: 0 4px !important;
    }

    #text-09ab7064,
    #text-09ab7064 * {
      font-size: 9px !important;
      letter-spacing: 0.15em !important;
    }

    #text-2519d4c4,
    #text-2519d4c4 * {
      font-size: 16px !important;
      letter-spacing: 0.06em !important;
      line-height: 1.15 !important;
    }

    #text-c9d92f2b,
    #text-c9d92f2b * {
      font-size: 11px !important;
      line-height: 1.4 !important;
    }

    #text-ed83b9fa,
    #text-ed83b9fa * {
      font-size: 10px !important;
      letter-spacing: 0.12em !important;
    }
  }
</style>
```

## Usage Instructions

### Desktop Version

1. Copy the CSS code from the first `<style>` tag above
2. In Systeme.io, navigate to your waitlist page
3. Add a **Custom HTML/CSS/JS** block
4. Paste the CSS code into the CSS section
5. The styles will automatically apply to the elements with the provided IDs

### Mobile Version (Compact & Intuitive)

1. Copy the CSS code from the **Mobile-Specific CSS Code** section above
2. In Systeme.io, navigate to your waitlist page
3. Add a **Custom HTML/CSS/JS** block (or use the same one)
4. Paste the mobile CSS code into the CSS section
5. This version is optimized for mobile with:
   - **Reduced spacing** (16px gaps vs 40px)
   - **Smaller fonts** (18px heading vs 32px)
   - **Tighter line heights** for better mobile readability
   - **Minimal padding** for maximum content visibility
   - **Full-width layout** for better mobile utilization

## Design Features

### Desktop Version

- **Dark gradient background** with subtle brand purple glow
- **Centered, minimalist layout** matching the reference image
- **Responsive design** for all screen sizes
- **Brand typography** (Balgin font, extralight weight, uppercase, letter-spacing)
- **Generous spacing** (40px gaps) for elegant desktop presentation

### Mobile Version (Compact & Intuitive)

- **Compact layout** with reduced spacing (16px gaps) for better mobile viewing
- **Smaller, optimized fonts** (18px heading, 12px description) for mobile readability
- **Tighter line heights** (1.2-1.5) for efficient space usage
- **Minimal padding** (24px vertical, 16px horizontal) for maximum content visibility
- **Full-width container** for better mobile screen utilization
- **Extra small mobile support** (360px and below) with further optimizations

## Element IDs Styled

- `#section-96d6a3a5` - Main container
- `#row-62980640` - Outer content container
- `#row-5391a5fc` - Welcome text row
- `#text-09ab7064` - "WELCOME TO TASSEL & WICKER"
- `#row-c0a7c5fb` - Main heading row
- `#text-2519d4c4` - "A CALM LIFE ROOTED IN JOY, LOVE, WARMTH AND INTENTION"
- `#row-680b7735` - Description row
- `#text-c9d92f2b` - Long description text
- `#row-303c7d89` - CTA text row
- `#text-ed83b9fa` - "BE THE FIRST TO KNOW. BE THE FIRST TO SHOP."
