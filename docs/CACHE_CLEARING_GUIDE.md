# Cache Clearing Guide

If you're seeing old changes on localhost, follow these steps:

## Quick Fix (Recommended)

1. **Stop your dev server** (Ctrl+C in the terminal where it's running)

2. **Clear Next.js cache:**

   ```powershell
   Remove-Item -Recurse -Force .next
   ```

3. **Or use the script:**

   ```powershell
   .\scripts\clear-cache.ps1
   ```

4. **Restart dev server:**

   ```powershell
   npm run dev
   ```

5. **Clear browser cache:**
   - **Chrome/Edge**: Press `Ctrl + Shift + Delete`, select "Cached images and files", click "Clear data"
   - **Or Hard Refresh**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - **Or DevTools**: Open DevTools (F12), right-click the refresh button, select "Empty Cache and Hard Reload"

## Complete Cache Clear (If Quick Fix Doesn't Work)

1. **Stop dev server** (Ctrl+C)

2. **Clear all caches:**

   ```powershell
   # Clear Next.js build cache
   Remove-Item -Recurse -Force .next

   # Clear node_modules cache (if exists)
   if (Test-Path "node_modules/.cache") {
       Remove-Item -Recurse -Force "node_modules/.cache"
   }

   # Clear TypeScript cache
   if (Test-Path ".tsbuildinfo") {
       Remove-Item -Force ".tsbuildinfo"
   }
   ```

3. **Kill all Node processes** (if dev server won't stop):

   ```powershell
   Get-Process node | Stop-Process -Force
   ```

4. **Restart dev server:**

   ```powershell
   npm run dev
   ```

5. **Clear browser cache completely:**
   - Open browser in **Incognito/Private mode** to test
   - Or clear all browsing data for localhost

## Browser-Specific Instructions

### Chrome/Edge

1. Press `F12` to open DevTools
2. Right-click the refresh button (next to address bar)
3. Select "Empty Cache and Hard Reload"

### Firefox

1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"
4. Or press `Ctrl + F5` for hard refresh

### Safari

1. Press `Cmd + Option + E` to empty cache
2. Or `Cmd + Shift + R` for hard refresh

## If Still Not Working

1. **Check if you're on the right port:**

   - Default is `http://localhost:3000`
   - Check terminal output for the actual port

2. **Check for service workers:**

   - Open DevTools → Application → Service Workers
   - Click "Unregister" if any are registered

3. **Try a different browser** to rule out browser-specific caching

4. **Check file timestamps:**

   - Make sure your files were actually saved
   - Check file modification times

5. **Restart your computer** (last resort - clears all system caches)

## Prevention

- Always use **Hard Refresh** (`Ctrl + Shift + R`) when testing changes
- Use **Incognito/Private mode** for testing to avoid cache issues
- Clear `.next` folder regularly during development
- Consider adding to `.gitignore` if not already there


