'use strict';
(() => {
  let opener=null;
  function closeDialog(dialog){
    if(dialog.id==='input-sheet' && document.getElementById('voice').getAttribute('aria-pressed')==='true') {
      document.getElementById('voice').click();
      return;
    }
    dialog.close();
    opener?.focus();
  }
  function openDialog(id, button) {
    if(mode==='playing') run(); // Opening a sheet pauses the animation.
    opener=button;
    document.getElementById(id).showModal();
  }
  for(const [button,id] of [['edit-word','input-sheet'],['open-settings','settings-sheet']]) {
    document.getElementById(button).addEventListener('click',e=>openDialog(id,e.currentTarget));
  }
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>closeDialog(document.getElementById(button.dataset.close))));
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);}));
  window.addEventListener('word-submitted',()=>{
    const dialog=document.getElementById('input-sheet');
    if(dialog.open)dialog.close();
    document.getElementById('play').focus();
  });
  const indices=()=>items.map((item,index)=>han.test(item.char)?index:-1).filter(index=>index>=0);
  function move(direction){const list=indices(),at=list.indexOf(selected);if(at+direction<0||at+direction>=list.length)return;select(list[at+direction]);}
  document.getElementById('previous-char').onclick=()=>move(-1);
  document.getElementById('next-char').onclick=()=>move(1);
  function refresh(){
    const list=indices(),at=list.indexOf(selected);
    document.getElementById('previous-char').disabled=at<=0;
    document.getElementById('next-char').disabled=at<0||at===list.length-1;
    const strip=document.getElementById('characters');
    const active=strip.querySelector('.char.active');
    if(active){
      const a=active.getBoundingClientRect(),s=strip.getBoundingClientRect();
      if(a.left<s.left)strip.scrollLeft-=s.left-a.left+8;
      else if(a.right>s.right)strip.scrollLeft+=a.right-s.right+8;
    }
  }
  window.addEventListener('character-selected',refresh);
  refresh();
  const board=document.getElementById('board');
  let gesture=null,ignoreClick=false;
  board.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0){gesture=null;return;}
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,time:Date.now()};
  });
  board.addEventListener('pointercancel',()=>{gesture=null;});
  board.addEventListener('pointerup',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y,elapsed=Date.now()-gesture.time;
    gesture=null;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.8&&elapsed<900){
      ignoreClick=true;move(dx<0?1:-1);setTimeout(()=>{ignoreClick=false;},400);
    }
  });
  board.addEventListener('click',()=>{if(!ignoreClick&&board.getAttribute('aria-disabled')!=='true')run();});
  board.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}
    if(event.key==='ArrowRight'){event.preventDefault();move(1);}
    if(event.key==='Enter'||event.key===' '){event.preventDefault();if(board.getAttribute('aria-disabled')!=='true')run();}
  });
  const slot=document.querySelector('.board-slot');
  const list=document.getElementById('stroke-list');
  let page=0;
  function renderPages(){
    const cards=[...list.children];
    const layout=strokePageLayout(list.clientWidth,list.clientHeight,cards.length,page);
    page=layout.page;
    list.style.gridTemplateColumns=`repeat(${layout.columns},minmax(0,1fr))`;
    list.style.gridTemplateRows=`repeat(${layout.rows},${layout.cellHeight}px)`;
    cards.forEach((card,index)=>{card.hidden=index<layout.start||index>=layout.end;});
    document.getElementById('stroke-prev').disabled=page===0;
    document.getElementById('stroke-next').disabled=page===layout.pages-1;
    document.getElementById('stroke-page').textContent=cards.length?`${layout.start+1}–${layout.end} / ${cards.length} 笔`:'暂无笔顺';
  }
  document.getElementById('stroke-prev').onclick=()=>{page--;renderPages();};
  document.getElementById('stroke-next').onclick=()=>{page++;renderPages();};
  window.addEventListener('strokes-loaded',()=>{page=0;renderPages();});
  window.addEventListener('stroke-progress',event=>{
    const layout=strokePageLayout(list.clientWidth,list.clientHeight,list.children.length);
    page=Math.floor(Math.max(0,event.detail-1)/layout.capacity);renderPages();
  });
  new ResizeObserver(()=>{
    const size=Math.max(0,Math.floor(Math.min(slot.clientWidth,slot.clientHeight)));
    board.style.width=`${size}px`;board.style.height=`${size}px`;
  }).observe(slot);
  new ResizeObserver(renderPages).observe(list);
  const setHeight=()=>{
    if(window.visualViewport?.scale===1)document.documentElement.style.setProperty('--app-height',`${window.visualViewport.height}px`);
    else document.documentElement.style.removeProperty('--app-height');
  };
  window.visualViewport?.addEventListener('resize',setHeight);
  window.addEventListener('resize',setHeight);
  setHeight();renderPages();
})();
