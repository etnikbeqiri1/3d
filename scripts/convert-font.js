const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');

// Convert TTF to Three.js typeface.json format
function convertToTypeface(inputPath, outputPath) {
  const font = opentype.loadSync(inputPath);

  const scale = (1000 * 100) / ((font.unitsPerEm || 2048) * 72);

  const result = {
    glyphs: {},
    familyName: font.names.fontFamily?.en || font.names.fontFamily || 'Unknown',
    ascender: Math.round(font.ascender * scale),
    descender: Math.round(font.descender * scale),
    underlinePosition: Math.round((font.tables.post?.underlinePosition || 0) * scale),
    underlineThickness: Math.round((font.tables.post?.underlineThickness || 0) * scale),
    boundingBox: {
      xMin: Math.round((font.tables.head?.xMin || 0) * scale),
      yMin: Math.round((font.tables.head?.yMin || 0) * scale),
      xMax: Math.round((font.tables.head?.xMax || 0) * scale),
      yMax: Math.round((font.tables.head?.yMax || 0) * scale),
    },
    resolution: 1000,
    original_font_information: {
      format: 0,
      copyright: font.names.copyright?.en || '',
      fontFamily: font.names.fontFamily?.en || font.names.fontFamily || '',
      fontSubfamily: font.names.fontSubfamily?.en || '',
      manufacturer: font.names.manufacturer?.en || '',
      designer: font.names.designer?.en || '',
      postScriptName: font.names.postScriptName?.en || '',
    },
  };

  // Process each glyph
  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs.get(i);
    if (glyph.unicode !== undefined) {
      const token = String.fromCharCode(glyph.unicode);
      const glyphData = {
        ha: Math.round((glyph.advanceWidth || 0) * scale),
        x_min: Math.round((glyph.xMin || 0) * scale),
        x_max: Math.round((glyph.xMax || 0) * scale),
        o: '',
      };

      // Convert path commands
      if (glyph.path && glyph.path.commands) {
        const commands = [];
        glyph.path.commands.forEach((cmd) => {
          switch (cmd.type) {
            case 'M':
              commands.push(`m ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
              break;
            case 'L':
              commands.push(`l ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
              break;
            case 'C':
              commands.push(`b ${Math.round(cmd.x1 * scale)} ${Math.round(cmd.y1 * scale)} ${Math.round(cmd.x2 * scale)} ${Math.round(cmd.y2 * scale)} ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
              break;
            case 'Q':
              commands.push(`q ${Math.round(cmd.x1 * scale)} ${Math.round(cmd.y1 * scale)} ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
              break;
            case 'Z':
              commands.push('z');
              break;
          }
        });
        glyphData.o = commands.join(' ');
      }

      result.glyphs[token] = glyphData;
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(result));
  console.log(`Converted ${inputPath} to ${outputPath}`);
  console.log(`Total glyphs: ${Object.keys(result.glyphs).length}`);
}

// Convert FE.TTF
const inputPath = path.join(__dirname, '../public/fonts/FE.TTF');
const outputPath = path.join(__dirname, '../public/fonts/fe_schrift.typeface.json');

convertToTypeface(inputPath, outputPath);
