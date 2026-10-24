// Shrinks note images before they're committed, so the repo stays small and
// no photo location data gets published. Used by notes:finalize and notes:images.
//
// For each JPEG/PNG (HEIC is converted to JPEG first):
//   - rotates it upright using its EXIF orientation
//   - resizes it to 2400px on the long edge (never upscales)
//   - converts it to sRGB (Hugo ignores color profiles, so P3 photos would look washed out)
//   - strips EXIF/XMP/IPTC metadata (GPS, camera, timestamps), keeping only the color profile
//
// Images that are already small, sRGB and metadata-free are left alone, so it's
// safe to run more than once. Requires ImageMagick and exiftool (macOS).

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

export const MAX_EDGE = 2400;
const JPEG_QUALITY = 90;
const SRGB_PROFILE = '/System/Library/ColorSync/Profiles/sRGB Profile.icc';
const IMAGE_EXT = /\.(jpe?g|png|heic)$/i;

export const isImage = (file) => IMAGE_EXT.test(file);

export function checkImageTools() {
  for (const tool of ['magick', 'exiftool']) {
    try {
      execFileSync('which', [tool], { stdio: 'ignore' });
    } catch {
      throw new Error(`${tool} is not installed. Install with: brew install ${tool === 'magick' ? 'imagemagick' : tool}`);
    }
  }
}

function readInfo(file) {
  const [info] = JSON.parse(
    execFileSync('exiftool', ['-j', '-n', '-ImageWidth', '-ImageHeight', '-ProfileDescription', '-EXIF:all', '-XMP:all', '-IPTC:all', file], {
      encoding: 'utf8',
    }),
  );
  return info;
}

function needsWork(file) {
  const { SourceFile, ImageWidth = 0, ImageHeight = 0, ProfileDescription, ...metadata } = readInfo(file);
  const tooBig = Math.max(ImageWidth, ImageHeight) > MAX_EDGE;
  const notSrgb = ProfileDescription && !/^sRGB/i.test(ProfileDescription);
  const hasMetadata = Object.keys(metadata).some((k) => k !== 'ExifToolVersion');
  return tooBig || notSrgb || hasMetadata;
}

// Optimizes `file` in place and returns its path, which changes for HEIC (.heic -> .jpg).
// Returns null if the image was already fine.
export function optimizeImage(file) {
  const isHeic = /\.heic$/i.test(file);
  if (!isHeic && !needsWork(file)) return null;

  const out = isHeic ? file.replace(/\.heic$/i, '.jpg') : file;
  if (isHeic && fs.existsSync(out)) throw new Error(`${path.basename(out)} already exists, not converting ${path.basename(file)}`);
  const tmp = path.join(path.dirname(out), `.tmp-${path.basename(out)}`);
  const isJpeg = /\.jpe?g$/i.test(out);
  // Re-encoding a low-quality JPEG at a higher quality only makes it bigger
  const sourceQuality = Number(execFileSync('magick', ['identify', '-format', '%Q', file], { encoding: 'utf8' })) || JPEG_QUALITY;
  execFileSync('magick', [
    file,
    '-auto-orient',
    '-resize', `${MAX_EDGE}x${MAX_EDGE}>`,
    '-profile', SRGB_PROFILE,
    '+profile', '!icc,*',
    ...(isJpeg ? ['-quality', String(Math.min(sourceQuality, JPEG_QUALITY))] : []),
    tmp,
  ]);
  fs.renameSync(tmp, out);
  if (isHeic) fs.unlinkSync(file);
  return out;
}
