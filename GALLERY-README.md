# Gallery Setup with Thumbsup

This website uses [thumbsup](https://github.com/thumbsup/thumbsup) to generate photo/video galleries for different sections of the farm.

## Directory Structure

```
source/
  comics/      - Place comic/webcomic images here
  projects/    - Place 3D printing & embroidery project photos here
  tools/       - Place screenshots of programs & tools here

gallery/
  comics/      - Generated gallery output (Chicken Coop)
  projects/    - Generated gallery output (Garden)
  tools/       - Generated gallery output (Workshop)
```

## Setup

### 1. Install Dependencies

First, install Node.js and npm if you haven't already, then install thumbsup:

```bash
npm install -g thumbsup
```

You'll also need these system dependencies:
- **GraphicsMagick** - for image processing
- **exiftool** - for reading photo metadata
- **FFmpeg** (optional) - for video support

### 2. Add Your Media Files

Place your photos and videos in the appropriate source folders:

- **Comics/Webcomics** → `source/comics/`
- **3D Printing & Embroidery** → `source/projects/`
- **Programs & Tools** → `source/tools/`

You can organize files into subfolders - each subfolder becomes an album.

## Generating Galleries

### Generate All Galleries

```bash
# Comics gallery
thumbsup --config thumbsup-comics.json

# Projects gallery
thumbsup --config thumbsup-projects.json

# Tools gallery
thumbsup --config thumbsup-tools.json
```

### Generate a Single Gallery

```bash
thumbsup --config thumbsup-comics.json
```

## Configuration

Each gallery has its own config file:
- `thumbsup-comics.json` - Comics/Webcomics gallery
- `thumbsup-projects.json` - 3D Printing & Embroidery gallery
- `thumbsup-tools.json` - Programs & Tools gallery

You can customize these files to change:
- Theme (default: "cards")
- Thumbnail size
- Image quality
- Sorting options
- And more...

See the [thumbsup documentation](https://thumbsup.github.io/) for all available options.

## Tips

- **Incremental builds**: Thumbsup only rebuilds changed files, so re-generating is fast
- **Organizing albums**: Create subfolders in source directories to organize photos into albums
- **File formats**: Supports JPG, PNG, GIF, RAW photos, and videos (with FFmpeg)
- **Metadata**: Thumbsup reads EXIF data for dates, locations, and more

## Farm Website Integration

The farm buildings link to these galleries:
- 🐔 **Chicken Coop** → `gallery/comics/`
- 🔨 **Workshop** → `gallery/tools/`
- 🌱 **Garden** → `gallery/projects/`

When you click on these buildings on the website, it will open the corresponding gallery (once generated).

## Deployment

After generating galleries, commit and push the `gallery/` folder contents to deploy them to your website.

```bash
git add gallery/
git commit -m "Update galleries"
git push
```
