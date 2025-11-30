# Tassel & Wicker Waitlist Form - Systeme.io

## HTML & CSS Code

```html
<style>
  /* Text Content Row */
  #row-99a90cfe {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 40px;
    margin-bottom: 30px;
  }

  /* Welcome Text - First text element */
  #text-096bc74a,
  #text-096bc74a * {
    font-size: 14px;
    font-weight: 200;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    line-height: 1.6;
    margin: 0;
  }

  /* Main Heading - Second text element */
  #text-ca877270,
  #text-ca877270 * {
    font-size: 32px;
    font-weight: 200;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #ffffff;
    text-align: center;
    line-height: 1.4;
    margin: 0;
  }

  /* Description Text - Third text element */
  #text-f9269ac7,
  #text-f9269ac7 * {
    font-size: 16px;
    font-weight: 200;
    color: rgba(255, 255, 255, 0.85);
    text-align: center;
    line-height: 1.8;
    margin: 0;
    max-width: 100%;
  }

  /* CTA Text - Fourth text element */
  #text-6f122344,
  #text-6f122344 * {
    font-size: 14px;
    font-weight: 200;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    line-height: 1.6;
    margin: 0;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    #row-99a90cfe {
      gap: 30px;
    }

    #text-ca877270,
    #text-ca877270 * {
      font-size: 26px;
      letter-spacing: 0.12em;
    }

    #text-f9269ac7,
    #text-f9269ac7 * {
      font-size: 15px;
    }
  }

  @media (max-width: 640px) {
    #row-99a90cfe {
      gap: 24px;
    }

    #text-096bc74a,
    #text-096bc74a * {
      font-size: 12px;
      letter-spacing: 0.25em;
    }

    #text-ca877270,
    #text-ca877270 * {
      font-size: 22px;
      letter-spacing: 0.1em;
    }

    #text-f9269ac7,
    #text-f9269ac7 * {
      font-size: 14px;
      line-height: 1.6;
    }

    #text-6f122344,
    #text-6f122344 * {
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    #text-ca877270,
    #text-ca877270 * {
      font-size: 20px;
    }

    #text-f9269ac7,
    #text-f9269ac7 * {
      font-size: 13px;
    }
  }
</style>
```

## Mobile-Specific CSS Code (Compact & Intuitive)

```html
<style>
  /* Text Content Row (Compact Mobile Layout) */
  #row-99a90cfe {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 0 8px;
    margin-bottom: 12px;
  }

  /* Welcome Text - First text element (Compact) */
  #text-096bc74a,
  #text-096bc74a * {
    font-size: 10px;
    font-weight: 200;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.65);
    text-align: center;
    line-height: 1.4;
    margin: 0;
  }

  /* Main Heading - Second text element (Compact) */
  #text-ca877270,
  #text-ca877270 * {
    font-size: 18px;
    font-weight: 200;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #ffffff;
    text-align: center;
    line-height: 1.2;
    margin: 0;
    padding: 0 8px;
  }

  /* Description Text - Third text element (Compact) */
  #text-f9269ac7,
  #text-f9269ac7 * {
    font-size: 12px;
    font-weight: 200;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    line-height: 1.5;
    margin: 0;
    max-width: 100%;
    padding: 0 4px;
  }

  /* CTA Text - Fourth text element (Compact) */
  #text-6f122344,
  #text-6f122344 * {
    font-size: 11px;
    font-weight: 200;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.75);
    text-align: center;
    line-height: 1.4;
    margin: 0;
  }

  /* Extra Small Mobile Optimization */
  @media (max-width: 360px) {
    #row-99a90cfe {
      gap: 12px;
      padding: 0 4px;
    }

    #text-096bc74a,
    #text-096bc74a * {
      font-size: 9px;
      letter-spacing: 0.15em;
    }

    #text-ca877270,
    #text-ca877270 * {
      font-size: 16px;
      letter-spacing: 0.06em;
      line-height: 1.15;
    }

    #text-f9269ac7,
    #text-f9269ac7 * {
      font-size: 11px;
      line-height: 1.4;
    }

    #text-6f122344,
    #text-6f122344 * {
      font-size: 10px;
      letter-spacing: 0.12em;
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

- **Centered, minimalist layout** matching the reference image
- **Responsive design** for all screen sizes
- **Extralight weight typography** with uppercase styling and letter-spacing
- **Generous spacing** (40px gaps) for elegant desktop presentation

### Mobile Version (Compact & Intuitive)

- **Compact layout** with reduced spacing (16px gaps) for better mobile viewing
- **Smaller, optimized fonts** (18px heading, 12px description) for mobile readability
- **Tighter line heights** (1.2-1.5) for efficient space usage
- **Minimal padding** for maximum content visibility
- **Extra small mobile support** (360px and below) with further optimizations

## Element IDs Styled

- `#row-99a90cfe` - Text content container row
- `#text-096bc74a` - First text element (Welcome text)
- `#text-ca877270` - Second text element (Main heading)
- `#text-f9269ac7` - Third text element (Description text)
- `#text-6f122344` - Fourth text element (CTA text)
