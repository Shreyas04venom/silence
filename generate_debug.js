function generateDebug() {
  const cellW = 146;
  const cellH = 122.25;
  let html = `<html><body style="background: #ccc; padding: 20px;">`;
  html += `<h2>amer_sign2.png cuts using 876x489 virtual grid</h2>`;
  html += `<div style="display:flex; flex-wrap:wrap; gap:10px;">`;
  
  for(let row=0; row<4; row++) {
    for(let col=0; col<6; col++) {
      html += `
        <div style="border: 2px solid red; width: ${cellW}px; height: ${cellH}px; overflow: hidden; position: relative;">
          <img src="amer_sign2.png" style="position: absolute; left: -${col*cellW}px; top: -${row*cellH}px; width: 876px; height: 489px;" />
          <span style="position:absolute; background:yellow; padding:2px; font-size:10px;">C${col} R${row}</span>
        </div>
      `;
    }
  }
  html += `</div></body></html>`;
  return html;
}
const fs = require('fs');
fs.writeFileSync('public/dataset/debug.html', generateDebug());
