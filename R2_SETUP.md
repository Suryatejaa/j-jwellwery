# Cloudflare R2 Public Access Setup

## Problem
R2 buckets are private by default. To view uploaded images publicly, we need to configure public access.

## Solution

### Option 1: Enable Public R2.dev URL (Recommended for Development)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 > Buckets**
3. Click on your **j-jwellery** bucket
4. Go to **Settings** tab
5. Scroll to **Public access** section
6. Click **Allow access** or **Create a public R2.dev URL**
7. You should see a public URL like: `https://pub-[account-id].r2.dev/j-jwellery`

This will make the bucket contents publicly readable at `https://pub-60b7b41743a736ef16ad4db9b799808c.r2.dev/j-jwellery/filename.jpg`

### Option 2: Configure CORS (For Private Bucket with Signed URLs)

If you want to keep the bucket private:

1. In bucket Settings, go to **CORS configuration**
2. Add a new CORS rule:
   ```
   {
     "AllowedOrigins": ["*"],
     "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
     "AllowedHeaders": ["*"],
     "ExposeHeaders": ["*"]
   }
   ```

### Option 3: Use Custom Domain (Production)

1. In bucket Settings, go to **Public access**
2. Select **Create a custom domain**
3. Point your domain to the bucket
4. Set up SSL certificate through Cloudflare

## Current Configuration

The app is currently configured to use:
```
NEXT_PUBLIC_R2_BUCKET_URL=https://pub-60b7b41743a736ef16ad4db9b799808c.r2.dev/j-jwellery
```

Once you enable public access in Option 1, images will be accessible at:
```
https://pub-60b7b41743a736ef16ad4db9b799808c.r2.dev/j-jwellery/{filename}
```

## After Setup

1. Restart the development server: `npm run dev`
2. Upload a new product with images
3. The images should now be publicly viewable

## Testing

Once configured, you should be able to:
- Upload images through `/admin/dashboard`
- See them display in the product gallery
- Access the image URL directly in browser and see the image (not an error)
