/**
 * Minimal GIF89a encoder for bit-icons frame animations.
 * Generates animated GIFs client-side from frame data.
 * Only supports a small fixed palette (white, grey, black).
 */

function encodeGIF(frames, width, height, delay, customPalette) {
  const palette = customPalette || [
    255, 255, 255, // 0 = white (background)
    210, 210, 210, // 1 = grey (off dots)
    17, 17, 17,    // 2 = black (on dots)
    0, 0, 0,       // 3 = padding (required: palette must be power of 2)
  ];
  const paletteBits = 2; // 2^2 = 4 colours

  const bytes = [];

  function writeByte(b) { bytes.push(b & 0xff); }
  function writeShort(s) { writeByte(s); writeByte(s >> 8); }
  function writeString(s) { for (let i = 0; i < s.length; i++) writeByte(s.charCodeAt(i)); }

  // Header
  writeString('GIF89a');

  // Logical Screen Descriptor
  writeShort(width);
  writeShort(height);
  writeByte(0x80 | (paletteBits - 1)); // GCT flag, colour resolution, size
  writeByte(0); // bg colour index
  writeByte(0); // pixel aspect ratio

  // Global Colour Table
  for (let i = 0; i < palette.length; i++) writeByte(palette[i]);

  // Netscape Extension (for looping)
  writeByte(0x21); // extension
  writeByte(0xff); // app extension
  writeByte(11);   // block size
  writeString('NETSCAPE2.0');
  writeByte(3);    // sub-block size
  writeByte(1);    // loop sub-block id
  writeShort(0);   // loop count (0 = infinite)
  writeByte(0);    // terminator

  // Write each frame
  for (const pixels of frames) {
    // Graphic Control Extension
    writeByte(0x21); // extension
    writeByte(0xf9); // GCE
    writeByte(4);    // block size
    writeByte(0);    // no transparency, no disposal
    writeShort(Math.round(delay / 10)); // delay in 1/100s
    writeByte(0);    // transparent colour index
    writeByte(0);    // terminator

    // Image Descriptor
    writeByte(0x2c);
    writeShort(0); writeShort(0); // left, top
    writeShort(width); writeShort(height);
    writeByte(0); // no local colour table

    // LZW Compressed Data
    const minCodeSize = paletteBits;
    writeByte(minCodeSize);

    // LZW encode
    const lzwData = lzwEncode(pixels, minCodeSize);

    // Write in sub-blocks of max 255 bytes
    let offset = 0;
    while (offset < lzwData.length) {
      const chunkSize = Math.min(255, lzwData.length - offset);
      writeByte(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        writeByte(lzwData[offset + i]);
      }
      offset += chunkSize;
    }
    writeByte(0); // block terminator
  }

  // Trailer
  writeByte(0x3b);

  return new Uint8Array(bytes);
}

function lzwEncode(pixels, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxCode = 4096;

  // Build initial table
  let table = {};
  for (let i = 0; i < clearCode; i++) {
    table[String(i)] = i;
  }

  const output = [];
  let buffer = 0;
  let bufferBits = 0;

  function emit(code) {
    buffer |= (code << bufferBits);
    bufferBits += codeSize;
    while (bufferBits >= 8) {
      output.push(buffer & 0xff);
      buffer >>= 8;
      bufferBits -= 8;
    }
  }

  emit(clearCode);

  let current = String(pixels[0]);

  for (let i = 1; i < pixels.length; i++) {
    const next = current + ',' + pixels[i];
    if (table[next] !== undefined) {
      current = next;
    } else {
      emit(table[current]);
      if (nextCode < maxCode) {
        table[next] = nextCode++;
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        // Reset table
        emit(clearCode);
        table = {};
        for (let j = 0; j < clearCode; j++) {
          table[String(j)] = j;
        }
        codeSize = minCodeSize + 1;
        nextCode = eoiCode + 1;
      }
      current = String(pixels[i]);
    }
  }

  emit(table[current]);
  emit(eoiCode);

  // Flush remaining bits
  if (bufferBits > 0) {
    output.push(buffer & 0xff);
  }

  return output;
}

// Export for use in build script (embeds as string in the page)
if (typeof module !== 'undefined') {
  module.exports = { encodeGIF: encodeGIF.toString(), lzwEncode: lzwEncode.toString() };
}
