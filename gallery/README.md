# Gallery & Comic Reader Documentation

This directory contains two content systems for the mombot farm website:
1. **Photo Galleries** (Projects & Tools) - Using thumbsup
2. **Comic Reader** (Comics & Webcomics) - Custom dual-mode reader

---

## 📚 Comic Reader System

### Overview

The comic reader is a custom-built, file-based system for hosting webcomics and traditional comics. It features two reading modes, progress tracking, and mobile support.

### Features

- **Dual Reading Modes:**
  - **Webtoon Mode**: Vertical scrolling through all pages (perfect for webtoons)
  - **Paged Mode**: Traditional page-by-page reading
- **Multiple Series Support**: Host unlimited comic series
- **Progress Tracking**: Automatically saves reading position
- **Mobile-Friendly**: Touch gestures and responsive design
- **Keyboard Navigation**: Arrow keys, M (mode), C (chapter menu)
- **Chapter Organization**: Easy navigation between chapters
- **Shareable Links**: URLs preserve reading position

### Directory Structure

```
gallery/comics/
├── index.html              # Archive page (series list)
├── reader.html             # Comic reader
├── css/
│   ├── archive.css         # Archive styling
│   └── reader.css          # Reader styling
├── js/
│   ├── ComicData.js        # Data utility
│   ├── ComicArchive.js     # Archive controller
│   └── ComicReader.js      # Reader controller
└── data/
    ├── series.json         # Master series list
    └── [series-slug]/
        ├── series.json     # Series metadata
        ├── chapters.json   # Chapter/page data
        ├── cover.jpg       # Cover image
        └── pages/
            ├── ch1-01.jpg  # Comic pages
            ├── ch1-02.jpg
            └── ...
```

### Adding a New Comic Series

#### Step 1: Create Series Directory

```bash
mkdir -p gallery/comics/data/my-comic-name/pages
```

#### Step 2: Add Cover Image

Create or copy your cover image:
```
gallery/comics/data/my-comic-name/cover.jpg
```

**Recommended specs:**
- Format: JPG or PNG
- Dimensions: 800x1200px (portrait)
- File size: Under 500KB

#### Step 3: Create `series.json`

Create `gallery/comics/data/my-comic-name/series.json`:

```json
{
  "slug": "my-comic-name",
  "title": "My Comic Name",
  "author": "mombot",
  "description": "A brief description of your comic that appears on the archive page",
  "status": "ongoing",
  "defaultMode": "webtoon",
  "readerModes": ["webtoon", "paged"],
  "startDate": "2026-01-04",
  "tags": ["fantasy", "adventure"]
}
```

**Field Descriptions:**
- `slug`: URL-friendly identifier (lowercase, hyphens, no spaces)
- `title`: Display name
- `author`: Your name
- `description`: Short summary (appears on archive cards)
- `status`: "ongoing", "complete", or "hiatus"
- `defaultMode`: "webtoon" or "paged" (initial reading mode)
- `readerModes`: Array of available modes
- `startDate`: Publication start date (YYYY-MM-DD)
- `tags`: Array of genre/category tags

#### Step 4: Create `chapters.json`

Create `gallery/comics/data/my-comic-name/chapters.json`:

```json
{
  "chapters": [
    {
      "number": 1,
      "title": "The Beginning",
      "slug": "ch1",
      "publishDate": "2026-01-04",
      "pages": [
        { "file": "ch1-01.jpg", "alt": "Page 1 - Opening scene" },
        { "file": "ch1-02.jpg", "alt": "Page 2 - Character introduction" },
        { "file": "ch1-03.jpg", "alt": "Page 3 - Action begins" }
      ]
    },
    {
      "number": 2,
      "title": "Rising Action",
      "slug": "ch2",
      "publishDate": "2026-01-11",
      "pages": [
        { "file": "ch2-01.jpg", "alt": "Page 1" },
        { "file": "ch2-02.jpg", "alt": "Page 2" }
      ]
    }
  ]
}
```

**Field Descriptions:**
- `number`: Chapter number (sequential)
- `title`: Chapter title
- `slug`: URL-friendly chapter identifier
- `publishDate`: When chapter was published
- `pages`: Array of page objects
  - `file`: Filename in the pages/ directory
  - `alt`: Alt text for accessibility

#### Step 5: Add Comic Pages

Add your comic page images to the pages directory:
```
gallery/comics/data/my-comic-name/pages/ch1-01.jpg
gallery/comics/data/my-comic-name/pages/ch1-02.jpg
gallery/comics/data/my-comic-name/pages/ch2-01.jpg
...
```

**Image Specifications:**

For **Webtoon Format**:
- Width: 800px (consistent across all pages)
- Height: Variable (typically 1000-4000px per page)
- Format: JPG (compressed) or PNG (if transparency needed)
- File size: Under 1MB per page recommended

For **Traditional Pages**:
- Dimensions: 1200x1800px or similar (maintain aspect ratio)
- Format: JPG or PNG
- File size: Under 800KB per page

**Naming Convention:**
- Use `ch[number]-[page].jpg` format
- Use leading zeros for sorting: `ch01-01.jpg`, not `ch1-1.jpg`
- Keep names lowercase and consistent

#### Step 6: Update Master Series List

Edit `gallery/comics/data/series.json` to add your series:

```json
{
  "series": [
    {
      "slug": "sample-comic",
      "title": "Sample Comic",
      "description": "A sample comic to test the reader",
      "coverImage": "data/sample-comic/cover.jpg",
      "status": "ongoing",
      "defaultMode": "webtoon"
    },
    {
      "slug": "my-comic-name",
      "title": "My Comic Name",
      "description": "A brief description",
      "coverImage": "data/my-comic-name/cover.jpg",
      "status": "ongoing",
      "defaultMode": "webtoon"
    }
  ]
}
```

#### Step 7: Commit and Push

```bash
git add gallery/comics/data/
git commit -m "Add new comic series: My Comic Name"
git push
```

Your comic will now appear on the archive page!

### Adding New Chapters

To add new chapters to an existing series:

1. **Add page images** to `pages/` directory
2. **Update `chapters.json`** with new chapter data:
   ```json
   {
     "number": 3,
     "title": "New Chapter Title",
     "slug": "ch3",
     "publishDate": "2026-01-18",
     "pages": [
       { "file": "ch3-01.jpg", "alt": "Page 1" }
     ]
   }
   ```
3. **Commit and push** changes

### Reader Keyboard Shortcuts

- **Arrow Left/Right**: Navigate pages (paged mode)
- **M**: Toggle between webtoon/paged modes
- **C**: Open chapter menu
- **Escape**: Close chapter menu

### Mobile Touch Gestures

- **Swipe Left**: Next page (paged mode)
- **Swipe Right**: Previous page (paged mode)
- **Tap Menu Button**: Open chapter list
- **Vertical Scroll**: Navigate pages (webtoon mode)

### Tips & Best Practices

1. **Optimize Images**: Compress images before uploading to reduce load times
2. **Consistent Width**: Keep page widths consistent for better webtoon reading
3. **Alt Text**: Always provide descriptive alt text for accessibility
4. **Chapter Organization**: Group pages by chapter using filename prefixes
5. **Testing**: Test both webtoon and paged modes before publishing
6. **Mobile Testing**: Always test on mobile devices for touch gestures

---

## 🖼️ Photo Gallery System (Thumbsup)

### Overview

The photo galleries for "Projects" and "Tools" use [thumbsup](https://github.com/thumbsup/thumbsup), a static gallery generator that creates beautiful, responsive photo galleries from folders of images.

### Directory Structure

```
gallery/
├── projects/           # 3D Printing & Embroidery gallery output
├── tools/             # Programs & Tools gallery output
└── (Note: source files are in /source/ directory)

source/
├── projects/          # Source images for projects gallery
└── tools/             # Source images for tools gallery
```

### Prerequisites

To generate galleries, you need:

1. **Node.js** and **npm** installed
2. **thumbsup** installed globally:
   ```bash
   npm install -g thumbsup
   ```
3. **System dependencies**:
   - GraphicsMagick (for image processing)
   - exiftool (for reading metadata)
   - FFmpeg (optional, for video support)

### Adding Photos to Galleries

#### Projects Gallery (3D Printing & Embroidery)

1. **Add source images** to `source/projects/`:
   ```
   source/projects/
   ├── 3d-prints/
   │   ├── dragon-model.jpg
   │   └── terrain-piece.jpg
   └── embroidery/
       ├── patch-design.jpg
       └── finished-piece.jpg
   ```

2. **Organize into albums**: Each subfolder becomes an album
   - `source/projects/3d-prints/` → "3d Prints" album
   - `source/projects/embroidery/` → "Embroidery" album

3. **Generate gallery**:
   ```bash
   thumbsup --config thumbsup-projects.json
   ```

4. **Commit and push**:
   ```bash
   git add gallery/projects/ source/projects/
   git commit -m "Add new project photos"
   git push
   ```

#### Tools Gallery (Programs & Tools)

1. **Add screenshots** to `source/tools/`:
   ```
   source/tools/
   ├── web-apps/
   │   ├── screenshot1.png
   │   └── screenshot2.png
   └── scripts/
       └── terminal-demo.png
   ```

2. **Generate gallery**:
   ```bash
   thumbsup --config thumbsup-tools.json
   ```

3. **Commit and push**:
   ```bash
   git add gallery/tools/ source/tools/
   git commit -m "Add new tool screenshots"
   git push
   ```

### Thumbsup Configuration

Each gallery has a config file in the root directory:

- `thumbsup-projects.json` - Projects gallery settings
- `thumbsup-tools.json` - Tools gallery settings

**Default Settings:**
```json
{
  "input": "./source/projects",
  "output": "./gallery/projects",
  "title": "3D Printing & Embroidery Projects",
  "theme": "cards",
  "sort-albums-by": "date",
  "sort-media-by": "date",
  "thumb-size": 200,
  "large-size": 1500,
  "photo-quality": 90,
  "cleanup": true
}
```

**Customization Options:**
- `theme`: "cards", "classic", "mosaic", or custom
- `sort-albums-by`: "date", "title", "name"
- `sort-media-by`: "date", "title", "filename"
- `thumb-size`: Thumbnail size in pixels
- `large-size`: Maximum image size for web viewing
- `photo-quality`: JPEG quality (0-100)

### Image Specifications for Galleries

- **Format**: JPG, PNG, GIF, or RAW photos
- **Size**: Original size (thumbsup will resize)
- **Recommended**: Max 4000px on longest side
- **Naming**: Descriptive filenames (used for alt text)

### Organizing Albums

Create subfolders in source directories to create albums:

```
source/projects/
├── 3d-printing-2024/
│   ├── project1.jpg
│   └── project2.jpg
├── 3d-printing-2025/
│   └── new-project.jpg
└── embroidery-projects/
    └── patch.jpg
```

Each folder becomes a separate album with the folder name as title.

### Advanced Features

**Add captions**: Create a file named `.caption` in image directory
```
This is a caption for my photo
It can be multiple lines
```

**EXIF Data**: thumbsup automatically reads camera info, dates, and locations

**Videos**: Place MP4/MOV files in source folders (requires FFmpeg)

**Custom Thumbnails**: Name an image `album.jpg` to use as album cover

---

## 🚀 Quick Reference

### Comic Reader URLs

- **Archive**: `https://yoursite.com/gallery/comics/`
- **Reader**: `https://yoursite.com/gallery/comics/reader.html?series=slug&ch=1&page=1&mode=webtoon`

### Gallery URLs

- **Projects**: `https://yoursite.com/gallery/projects/`
- **Tools**: `https://yoursite.com/gallery/tools/`

### File Locations

| Content Type | Source Files | Generated Output | Config File |
|--------------|--------------|------------------|-------------|
| Comics | `gallery/comics/data/` | N/A (no build step) | `data/series.json` |
| Projects Gallery | `source/projects/` | `gallery/projects/` | `thumbsup-projects.json` |
| Tools Gallery | `source/tools/` | `gallery/tools/` | `thumbsup-tools.json` |

### Common Tasks

**Add a new comic series:**
```bash
mkdir -p gallery/comics/data/my-comic/pages
# Add cover.jpg, series.json, chapters.json, and page images
# Update data/series.json
git add . && git commit -m "Add comic" && git push
```

**Add photos to projects gallery:**
```bash
cp photos/*.jpg source/projects/new-album/
thumbsup --config thumbsup-projects.json
git add . && git commit -m "Add photos" && git push
```

**Update existing comic chapter:**
```bash
# Edit gallery/comics/data/[series]/chapters.json
# Add new page images to pages/ directory
git add . && git commit -m "Update chapter" && git push
```

---

## 🎨 Design Philosophy

Both systems maintain the retro farm aesthetic:
- **Monospace fonts** for that vintage computing feel
- **Brown color palette** (#8B4513) matching the farm theme
- **Dashed borders** reminiscent of wooden fences
- **Pixelated rendering** for retro graphics
- **Simple, clean layouts** focused on content

---

## 🐛 Troubleshooting

### Comic Reader Issues

**Comics not loading:**
- Check that `series.json` exists in `gallery/comics/data/`
- Verify JSON syntax is valid (use a JSON validator)
- Check browser console for errors

**Images not displaying:**
- Verify image filenames match exactly in `chapters.json`
- Check that images are in the `pages/` directory
- Ensure image paths are relative (no leading slashes)

**Progress not saving:**
- Check that localStorage is enabled in browser
- Clear browser cache and reload
- Check browser privacy settings

### Gallery Generation Issues

**thumbsup command not found:**
```bash
npm install -g thumbsup
```

**Images not processing:**
- Install GraphicsMagick: `brew install graphicsmagick` (Mac) or `apt-get install graphicsmagick` (Linux)
- Install exiftool: `brew install exiftool` or `apt-get install libimage-exiftool-perl`

**Slow generation:**
- Thumbsup only rebuilds changed files
- Use `--cleanup false` to skip removing old files
- Reduce `large-size` in config for smaller files

---

## 📝 License & Credits

- **Comic Reader**: Custom built for mombot.nekoweb.org
- **Thumbsup**: [Apache License 2.0](https://github.com/thumbsup/thumbsup)
- **Farm Theme**: Original design

---

## 🆘 Need Help?

For issues or questions:
1. Check this README first
2. Review the example `sample-comic` structure
3. Test with minimal data to isolate issues
4. Check browser developer console for errors
5. Verify all file paths are correct

Happy publishing! 🐔📚
