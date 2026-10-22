# Copyright (c) Meta Platforms, Inc. and affiliates.

"""Regenerate the weight probe font embedded in src/SVGIcon/weightProbe.ts.

The font has no visible glyphs and one axis, wght 1-1000. Its x-height and cap
height equal the weight in font units (1000 per em), so CSS can read the
inherited font weight as calc(1ex / 1em * 1000). Requires: pip install fonttools brotli

  python3 packages/lab/scripts/generate-weight-probe-font.py   # prints the base64 WOFF2
"""
import base64
import io

from fontTools import varLib
from fontTools.designspaceLib import AxisDescriptor, DesignSpaceDocument, SourceDescriptor
from fontTools.fontBuilder import FontBuilder
from fontTools.misc.timeTools import timestampFromString
from fontTools.pens.ttGlyphPen import TTGlyphPen

FAMILY = 'AstryxWeightProbe'


def master(weight):
    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(['.notdef', 'space'])
    fb.setupCharacterMap({0x20: 'space'})
    # Sanitizers reject an empty glyf table, so .notdef carries a 1-unit square.
    notdef = TTGlyphPen(None)
    notdef.moveTo((0, 0)); notdef.lineTo((0, 1)); notdef.lineTo((1, 1)); notdef.closePath()
    fb.setupGlyf({'.notdef': notdef.glyph(), 'space': TTGlyphPen(None).glyph()})
    fb.setupHorizontalMetrics({'.notdef': (0, 0), 'space': (0, 0)})
    fb.setupHorizontalHeader(ascent=1000, descent=0)
    fb.setupNameTable({'familyName': FAMILY, 'styleName': f'w{weight}'})
    fb.setupOS2(sxHeight=weight, sCapHeight=weight, sTypoAscender=1000, sTypoDescender=0,
                usWinAscent=1000, usWinDescent=0, usWeightClass=weight)
    fb.setupPost()
    return fb.font


doc = DesignSpaceDocument()
axis = AxisDescriptor()
axis.tag, axis.name, axis.minimum, axis.default, axis.maximum = 'wght', 'Weight', 1, 400, 1000
doc.addAxis(axis)
for weight in (1, 400, 1000):
    source = SourceDescriptor()
    source.font, source.location = master(weight), {'Weight': weight}
    source.familyName, source.styleName = FAMILY, f'w{weight}'
    doc.addSource(source)

font, _, _ = varLib.build(doc, exclude=['STAT'])
# Fixed timestamps keep the output byte-identical across runs.
font.recalcTimestamp = False
font['head'].created = font['head'].modified = timestampFromString('Thu Jan  1 00:00:00 2026')
font.flavor = 'woff2'
buf = io.BytesIO()
font.save(buf)
print(base64.b64encode(buf.getvalue()).decode())
