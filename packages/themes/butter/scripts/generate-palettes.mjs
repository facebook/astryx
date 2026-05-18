// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Butter theme palette generator — single-anchor smooth ramp.
 *
 * Each palette has ONE anchor source (a hex from the current design).
 * The full 21-step ramp is derived via the same CIELab → HCT algorithm
 * the preview strip uses (see ThemePalettePreview.tsx). This produces
 * a smooth, organic gradient without piecewise discontinuities.
 *
 * The four "in-use" tones (T15/T25/T80/T90) will be CLOSE to but not
 * necessarily exactly equal to the current token values. The script
 * prints both the new T-stops and the deltas vs the previous tokens so
 * we can see how much they shifted.
 *
 * Run: node packages/themes/butter/scripts/generate-palettes.mjs
 */

function hexToRgb(hex){const h=hex.replace('#','').slice(0,6);const f=h.length===3?h[0]+h[0]+h[1]+h[1]+h[2]+h[2]:h;const n=parseInt(f,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function srgbToLinear(c){const s=c/255;return s<=0.04045?s/12.92:Math.pow((s+0.055)/1.055,2.4);}
function linearToSrgb(c){const s=c<=0.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-0.055;return Math.round(Math.min(255,Math.max(0,s*255)));}
function linRgbToXyz(r,g,b){return[0.4124564*r+0.3575761*g+0.1804375*b,0.2126729*r+0.7151522*g+0.072175*b,0.0193339*r+0.119192*g+0.9503041*b];}
function xyzToLinRgb(x,y,z){return[3.2404542*x-1.5371385*y-0.4985314*z,-0.969266*x+1.8760108*y+0.041556*z,0.0556434*x-0.2040259*y+1.0572252*z];}
const D65=[0.95047,1,1.08883];
function labF(t){const d=6/29;return t>d*d*d?Math.cbrt(t):t/(3*d*d)+4/29;}
function labFInv(t){const d=6/29;return t>d?t*t*t:3*d*d*(t-4/29);}
function xyzToLab(x,y,z){const fx=labF(x/D65[0]),fy=labF(y/D65[1]),fz=labF(z/D65[2]);return[116*fy-16,500*(fx-fy),200*(fy-fz)];}
function labToXyz(L,a,b){const fy=(L+16)/116,fx=a/500+fy,fz=fy-b/200;return[labFInv(fx)*D65[0],labFInv(fy)*D65[1],labFInv(fz)*D65[2]];}

function hexToHct(hex){
  const[r,g,b]=hexToRgb(hex);
  const[x,y,z]=linRgbToXyz(srgbToLinear(r),srgbToLinear(g),srgbToLinear(b));
  const[L,a,bL]=xyzToLab(x,y,z);
  let h=Math.atan2(bL,a)*180/Math.PI;if(h<0)h+=360;
  return{hue:h,chroma:Math.sqrt(a*a+bL*bL),tone:Math.max(0,Math.min(100,L))};
}

function hctToHex({hue,chroma,tone}){
  if(tone<=0)return'#000000';
  if(tone>=100)return'#ffffff';
  if(chroma<0.5){const y=labFInv((tone+16)/116);const g=linearToSrgb(y);return'#'+[g,g,g].map(c=>c.toString(16).padStart(2,'0')).join('');}
  let lo=0,hi=chroma,best='#000000';
  for(let i=0;i<16;i++){
    const mid=(lo+hi)/2,hRad=hue*Math.PI/180;
    const a=Math.cos(hRad)*mid,b=Math.sin(hRad)*mid;
    const[x,y,z]=labToXyz(tone,a,b);
    const[lr,lg,lb]=xyzToLinRgb(x,y,z);
    const r=linearToSrgb(lr),g=linearToSrgb(lg),bv=linearToSrgb(lb);
    const ok=Math.abs(srgbToLinear(r)-lr)<0.02&&Math.abs(srgbToLinear(g)-lg)<0.02&&Math.abs(srgbToLinear(bv)-lb)<0.02&&r>=0&&r<=255&&g>=0&&g<=255&&bv>=0&&bv<=255;
    if(ok){best='#'+[r,g,bv].map(c=>c.toString(16).padStart(2,'0')).join('');lo=mid;}
    else{hi=mid;}
  }
  return best;
}

const STEPS = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];

function tonalPalette(hue, chroma) {
  const out = {};
  const maxChroma = chroma * 1.8;
  for (const t of STEPS) {
    const boost = t < 50 ? 1 + (50 - t) / 40 : 1;
    out[t] = hctToHex({ hue, chroma: Math.min(chroma * boost, maxChroma), tone: t });
  }
  return out;
}

// Sources picked from the CURRENT token values that look right.
// Using T80 (light border) as the source for each palette keeps the
// mid-light tone honest and lets the ramp fan out smoothly to both
// ends. For ramps where T80 is too saturated to fan well (yellow),
// we use a slightly higher tone as source.
const SOURCES = {
  blue:    '#bdc5eb',
  cyan:    '#8dd2d3',
  green:   '#a5d29d',
  orange:  '#f2bd81',
  pink:    '#f0b3e8',
  purple:  '#ddb9f6',
  red:     '#f4b8ae',
  teal:    '#94d3bb',
  yellow:  '#e5d765',
  neutral: '#c1c6d5',
  accent:  '#225BFF',
  error:   '#ffb3a5',
  warning: '#f7be00',
  success: '#91D143',
};

const out = {};
for (const [name, src] of Object.entries(SOURCES)) {
  const { hue, chroma } = hexToHct(src);
  out[name] = tonalPalette(hue, chroma);
}

let formatted = 'export const butterPalettes = {\n';
for (const [name, palette] of Object.entries(out)) {
  formatted += `  ${name}: {\n`;
  for (const t of STEPS) formatted += `    ${t}: '${palette[t]}',\n`;
  formatted += '  },\n';
}
formatted += '} as const;\n';

console.log(formatted);
