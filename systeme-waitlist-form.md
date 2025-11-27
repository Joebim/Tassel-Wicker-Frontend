# Systeme.io Waitlist Form - Tassel & Wicker

Complete HTML/CSS/JS implementation for a waitlist form matching the Tassel & Wicker contact page aesthetic.

## Complete Code

```html
<!-- Background Container -->
<div
  style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background-image: url('https://res.cloudinary.com/dygrsvya5/image/upload/q_10/v1761149638/_2MK9323_vyzwqm.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;"
></div>
<div
  style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; background: rgba(0, 0, 0, 0.5);"
></div>

<style>
  /* Base font family */
  * {
    font-family: "Inter", "Balgin", "Mathilda", system-ui, sans-serif;
  }

  /* Parent Row - Frosted Glass Container */
  #row-ef98ef13 {
    position: relative !important;
    z-index: 10 !important;
    width: 100% !important;
    max-width: 600px !important;
    margin: 0 auto !important;
    padding: 60px 40px !important;
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border: 2px solid rgba(255, 255, 255, 0.6) !important;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
    color: #fff !important;
    box-sizing: border-box !important;
  }

  /* Nested Row - Content Container with Flex Gap */
  #row-2ef771c0 {
    display: flex !important;
    flex-direction: column !important;
    gap: 24px !important;
    width: 100% !important;
  }

  /* Tagline Text */
  #text-66597cfb,
  #text-66597cfb * {
    font-size: 14px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.2em !important;
    color: rgba(255, 255, 255, 0.9) !important;
    text-align: center !important;
    line-height: 1.6 !important;
    margin: 0 !important;
  }

  /* Main Heading */
  #headline-0dcc5496,
  #headline-0dcc5496 * {
    font-size: 28px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.15em !important;
    color: #fff !important;
    text-align: center !important;
    line-height: 1.4 !important;
    margin: 0 !important;
  }

  /* Description/CTA Text */
  #text-9c2bba33,
  #text-9c2bba33 * {
    font-size: 16px !important;
    font-weight: 200 !important;
    color: rgba(255, 255, 255, 0.9) !important;
    text-align: center !important;
    line-height: 1.8 !important;
    margin: 0 !important;
  }

  /* First Name Field */
  #field-3968a16f {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    margin-bottom: 20px !important;
    position: relative !important;
  }

  #field-3968a16f label,
  #field-3968a16f .field-label {
    font-size: 11px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.2em !important;
    color: rgba(255, 255, 255, 0.8) !important;
    margin-bottom: 8px !important;
  }

  /* Icon before input - positioned relative to input field */
  #field-3968a16f::after {
    content: "" !important;
    position: absolute !important;
    left: 20px !important;
    bottom: 16px !important;
    width: 18px !important;
    height: 18px !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.8)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E") !important;
    background-size: contain !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    pointer-events: none !important;
    z-index: 2 !important;
  }

  #field-3968a16f input,
  #field-3968a16f textarea,
  #field-3968a16f select {
    width: 100% !important;
    padding: 16px 24px 16px 50px !important;
    background: rgba(255, 255, 255, 0.1) !important;
    border: 2px solid rgba(255, 255, 255, 0.6) !important;
    color: #fff !important;
    font-family: inherit !important;
    font-size: 14px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
    transition: all 0.3s ease !important;
    outline: none !important;
    box-sizing: border-box !important;
  }

  #field-3968a16f input::placeholder,
  #field-3968a16f textarea::placeholder {
    color: rgba(255, 255, 255, 0.6) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
  }

  #field-3968a16f input:focus,
  #field-3968a16f textarea:focus,
  #field-3968a16f select:focus {
    border-color: #fff !important;
    background: rgba(255, 255, 255, 0.15) !important;
  }

  /* Email Field */
  #field-36a484b4 {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    margin-bottom: 20px !important;
    position: relative !important;
  }

  #field-36a484b4 label,
  #field-36a484b4 .field-label {
    font-size: 11px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.2em !important;
    color: rgba(255, 255, 255, 0.8) !important;
    margin-bottom: 8px !important;
  }

  /* Email icon before input - positioned relative to input field */
  #field-36a484b4::after {
    content: "" !important;
    position: absolute !important;
    left: 20px !important;
    bottom: 16px !important;
    width: 18px !important;
    height: 18px !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.8)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'/%3E%3C/svg%3E") !important;
    background-size: contain !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    pointer-events: none !important;
    z-index: 2 !important;
  }

  #field-36a484b4 input,
  #field-36a484b4 textarea,
  #field-36a484b4 select {
    width: 100% !important;
    padding: 16px 24px 16px 50px !important;
    background: rgba(255, 255, 255, 0.1) !important;
    border: 2px solid rgba(255, 255, 255, 0.6) !important;
    color: #fff !important;
    font-family: inherit !important;
    font-size: 14px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
    transition: all 0.3s ease !important;
    outline: none !important;
    box-sizing: border-box !important;
  }

  #field-36a484b4 input::placeholder,
  #field-36a484b4 textarea::placeholder {
    color: rgba(255, 255, 255, 0.6) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
  }

  #field-36a484b4 input:focus,
  #field-36a484b4 textarea:focus,
  #field-36a484b4 select:focus {
    border-color: #fff !important;
    background: rgba(255, 255, 255, 0.15) !important;
  }

  /* Submit Button */
  #button-8e06faa5,
  #button-8e06faa5 button,
  #button-8e06faa5 a {
    width: 100% !important;
    padding: 16px 24px !important;
    background: #4c062c !important;
    border: 2px solid #4c062c !important;
    color: #fff !important;
    font-family: inherit !important;
    font-size: 14px !important;
    font-weight: 200 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.2em !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    margin-top: 8px !important;
    box-sizing: border-box !important;
    text-align: center !important;
    text-decoration: none !important;
    display: block !important;
  }

  #button-8e06faa5:hover button,
  #button-8e06faa5:hover a,
  #button-8e06faa5 button:hover,
  #button-8e06faa5 a:hover {
    background: #6b1a4a !important;
    border-color: #6b1a4a !important;
  }

  #button-8e06faa5:active button,
  #button-8e06faa5:active a,
  #button-8e06faa5 button:active,
  #button-8e06faa5 a:active {
    transform: scale(0.98) !important;
  }

  #button-8e06faa5 button:disabled,
  #button-8e06faa5 button[disabled] {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }

  /* Loading spinner animation */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    #row-ef98ef13 {
      padding: 50px 30px !important;
      max-width: 100% !important;
    }

    #row-2ef771c0 {
      gap: 20px !important;
    }

    #headline-0dcc5496,
    #headline-0dcc5496 * {
      font-size: 24px !important;
    }

    #text-9c2bba33,
    #text-9c2bba33 * {
      font-size: 15px !important;
    }

    #text-66597cfb,
    #text-66597cfb * {
      font-size: 13px !important;
    }
  }

  @media (max-width: 640px) {
    #row-ef98ef13 {
      padding: 40px 24px !important;
      max-width: 100% !important;
    }

    #row-2ef771c0 {
      gap: 18px !important;
    }

    #headline-0dcc5496,
    #headline-0dcc5496 * {
      font-size: 20px !important;
      line-height: 1.3 !important;
    }

    #text-9c2bba33,
    #text-9c2bba33 * {
      font-size: 14px !important;
      line-height: 1.6 !important;
    }

    #text-66597cfb,
    #text-66597cfb * {
      font-size: 12px !important;
    }

    #field-3968a16f input,
    #field-3968a16f textarea,
    #field-3968a16f select,
    #field-36a484b4 input,
    #field-36a484b4 textarea,
    #field-36a484b4 select {
      padding: 14px 20px 14px 45px !important;
      font-size: 13px !important;
    }

    #field-3968a16f::before,
    #field-36a484b4::before {
      left: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    #button-8e06faa5,
    #button-8e06faa5 button,
    #button-8e06faa5 a {
      padding: 14px 20px !important;
      font-size: 13px !important;
    }
  }

  @media (max-width: 480px) {
    #row-ef98ef13 {
      padding: 30px 20px !important;
    }

    #row-2ef771c0 {
      gap: 16px !important;
    }

    #headline-0dcc5496,
    #headline-0dcc5496 * {
      font-size: 18px !important;
    }

    #text-9c2bba33,
    #text-9c2bba33 * {
      font-size: 13px !important;
    }

    #text-66597cfb,
    #text-66597cfb * {
      font-size: 11px !important;
    }
  }
</style>
```

## Integration Instructions for Systeme.io

### 1. Setup Systeme.io Structure

Create the following structure in Systeme.io:

- **row-ef98ef13** - Parent row (frosted glass container)
  - **row-2ef771c0** - Nested row for text content
    - **text-66597cfb** - Tagline text ("For those who move through life with intentions")
    - **headline-0dcc5496** - Main heading ("EMBRACE ELEVATED LIVING...")
    - **text-9c2bba33** - Description/CTA text
  - **field-3968a16f** - First name field
  - **field-36a484b4** - Email field
  - **button-8e06faa5** - Submit button

### 2. Add Background and Styling

- Copy the background container divs and the `<style>` tag from the code above
- Paste into a Systeme.io HTML block (or Custom Code section)
- Ensure the HTML block is placed before your form structure
- The CSS will automatically style all Systeme.io elements with the matching IDs

### 3. Customization Options

#### Change Brand Purple Color

In the `<style>` tag, find `#button-8e06faa5` and replace `#4c062c` with your preferred color:

```css
#button-8e06faa5 button {
  background: #YOUR_COLOR !important;
  border-color: #YOUR_COLOR !important;
}
```

Also update the hover color `#6b1a4a` in the hover state.

#### Adjust Glass Effect

Find `#row-ef98ef13` in the CSS and modify the background and backdrop-filter values:

```css
#row-ef98ef13 {
  background: rgba(255, 255, 255, 0.1) !important; /* Change opacity */
  backdrop-filter: blur(10px) !important; /* Change blur amount */
}
```

#### Change Background Image

Update the background image URL in the first background div's `style` attribute:

```html
style="... background-image: url('YOUR_IMAGE_URL'); ..."
```

#### Responsive Adjustments

Modify the `@media (max-width: 640px)` query in the `<style>` tag to adjust mobile breakpoints and sizing.

### 4. Form Submission

Systeme.io will handle form submissions automatically. The styling will ensure your form matches the Tassel & Wicker aesthetic while using Systeme.io's native form handling.

## Features

- ✅ Matches Tassel & Wicker contact page aesthetic
- ✅ Transparent glass effect card (frosted glass)
- ✅ Brand purple button (#4c062c)
- ✅ Responsive design
- ✅ Uses Systeme.io native form handling
- ✅ Uppercase typography with proper tracking
- ✅ Extralight font weights
- ✅ Smooth transitions and hover effects
- ✅ Styled Systeme.io elements (rows, text, fields, buttons)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Backdrop filter support required for glass effect
- Falls back gracefully on older browsers
