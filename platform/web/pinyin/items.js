'use strict';
const practiceGroups=[
  {id:'vowels',name:'单韵母 · 随机四声',items:['a','o','e','i','u','ü'].map((label,i)=>({id:`vowel-${i}`,label,marked:['āáǎà','ōóǒò','ēéěè','īíǐì','ūúǔù','ǖǘǚǜ'][i],audio:'aoeiuv'[i]}))},
  {id:'syllables',name:'图片中的音节 · 固定声调',items:[['bā','ba1'],['pá','pa2'],['bō','bo1'],['pó','po2'],['pǐ','pi3'],['bù','bu4'],['pū','pu1'],['mǎ','ma3'],['fà','fa4'],['fó','fo2'],['pí','pi2'],['pō','po1'],['mō','mo1'],['mā','ma1'],['mǐ','mi3'],['fú','fu2'],['bà','ba4'],['mù','mu4'],['bǐ','bi3'],['pà','pa4']].map(([label,audio])=>({id:audio,label,audio}))},
  {id:'words',name:'图片中的词语',items:[['bà ba','爸爸'],['pó po','婆婆'],['mā ma','妈妈'],['mù mǎ','木马'],['pí fū','皮肤'],['mì mi','秘密'],['mó mò','磨墨'],['pí pa','枇杷'],['pù bù','瀑布'],['yī fu','衣服'],['fǔ mō','抚摸'],['pá pō','爬坡']].map(([label,word],i)=>({id:`word-${i}`,label,word}))}
];
const practiceItems=practiceGroups.flatMap(group=>group.items);
function makePool(selected){return practiceItems.filter(item=>selected.includes(item.id)).flatMap(item=>item.marked?[...item.marked].map((label,tone)=>({id:`${item.id}-${tone}`,label,audio:`${item.audio}${tone+1}`,tone})): [{...item,tone:item.word?null:Number(item.audio.slice(-1))-1}]);}
