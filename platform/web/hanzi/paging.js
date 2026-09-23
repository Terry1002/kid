'use strict';
function strokePageLayout(width,height,count,page=0){
  const columns=Math.max(1,Math.min(6,Math.floor((width+8)/80)));
  const rows=Math.max(1,Math.min(4,Math.floor((height+8)/86)));
  const capacity=columns*rows;
  const pages=Math.max(1,Math.ceil(count/capacity));
  page=Math.max(0,Math.min(page,pages-1));
  return {columns,rows,capacity,pages,page,start:page*capacity,end:Math.min(count,(page+1)*capacity),cellHeight:Math.max(0,(height-8*(rows-1))/rows)};
}
if(typeof module!=='undefined')module.exports={strokePageLayout};
