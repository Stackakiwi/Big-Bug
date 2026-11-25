'use strict';

// Vector floor art shared by Story and Mosquito Mode. Gold Waves has its own renderer.
const BBArenaDesigns=(()=>{
const leaf=(x,y,angle,length,depth,color,veins='#728753')=>{
  const w=depth,l=length;
  return '<g transform="translate('+x+' '+y+') rotate('+angle+')"><path fill="'+color+'" d="M0 0C'+(-w)+' '+(-l*.22)+' '+(-w*.68)+' '+(-l*.74)+' 0 '+(-l)+'C'+(w*.72)+' '+(-l*.71)+' '+(w*.86)+' '+(-l*.18)+' 0 0Z"/>'+
    '<path d="M0 -2Q'+(-w*.16)+' '+(-l*.43)+' 0 '+(-l*.81)+' M0 '+(-l*.29)+'l'+(-w*.37)+' '+(-l*.21)+' m'+(w*.37)+' '+(l*.21)+'l'+(w*.38)+' '+(-l*.24)+'" stroke="'+veins+'" stroke-opacity=".39" stroke-width="1" stroke-linecap="round" fill="none"/></g>';
};
const rock=(x,y,angle,scale)=>'<g transform="translate('+x+' '+y+') rotate('+angle+') scale('+scale+')"><path d="M-16 3Q-20-2-11-8Q-4-13 8-10L15-5Q21 2 13 7Q3 11-11 8Z" fill="#566155"/><path d="M-14 0Q-10-10 2-10Q11-9 15-4L12-1Q0-4-14 0Z" fill="#71806a" opacity=".76"/><path d="M-13 5Q1 11 14 5" fill="none" stroke="#243a2a" stroke-opacity=".56"/></g>';
const tuft=(x,y,s,angle)=>'<g transform="translate('+x+' '+y+') rotate('+angle+') scale('+s+')" fill="none" stroke-linecap="round"><path d="M0 2Q-4-5-9-8M1 1Q-1-7 1-12M2 1Q5-6 10-7" stroke="#819061" stroke-width="1.25" opacity=".66"/><path d="M-3 0Q-7-3-10-2M4 0L9-3" stroke="#495f42" stroke-width="1.3"/></g>';
const flower=(x,y,s,color)=>'<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-3 14q5-5 3-12" fill="none" stroke="#617548" stroke-width="1.6"/><path d="M0-3C-5-8-9-2-5 1C-9 6-2 9 0 5C4 9 8 5 5 1C9-3 4-7 0-3Z" fill="'+color+'"/><circle cy="1" r="2" fill="#947649"/></g>';
const fern=(x,y,angle,s)=>{
 const leaves=[[-2,-6,-58,17,5],[1,-12,49,19,5],[-2,-16,-53,18,4.5],[2,-22,44,17,4.5],[-1,-26,-46,13,3.8],[2,-31,40,12,3],[-1,-36,-27,12,3],[1,-41,17,8,2.5]];
 return '<g transform="translate('+x+' '+y+') rotate('+angle+') scale('+s+')"><path d="M0 2Q-1-27 4-46" fill="none" stroke="#637b52" stroke-width="1.3"/>'+leaves.map(args=>leaf(...args,'#526d43','#8a9965')).join('')+'</g>';
};

const profiles=[
// The first colors are the turf, the middle pair is the border detail, and the last is each area's accent.
 {name:'Garden Grove', colors:['#446b3c','#355d38','#2b4b32','#669149','#83a55a','#d2cc91'], motif:'grove'},
 {name:'Autumn Thicket', colors:['#775231','#68462e','#4d3b2a','#9d6538','#ba8143','#d2ad68'], motif:'autumn'},
 {name:'Moonlit Meadow', colors:['#35576d','#2a4559','#1c3347','#49778c','#719ca5','#b1ced3'], motif:'meadow'},
 {name:'Mushroom Hollow', colors:['#69516f','#594561','#3d354e','#826183','#ab81a4','#e2c5c5'], motif:'mushroom'},
 {name:'Sunflower Field', colors:['#738945','#67813c','#4b6332','#819d4f','#aabd66','#e0b54e'], motif:'sunflower'},
 {name:'Mossy Creek', colors:['#386952','#37725b','#254f45','#47856a','#6e9e73','#88b9ab'], motif:'creek'},
 {name:'Firefly Marsh', colors:['#435d42','#334e3e','#263c32','#618453','#8ca467','#d1d98a'], motif:'marsh'},
 {name:'Rose Garden', colors:['#685047','#63424c','#45363e','#7a624e','#8a8461','#c78c98'], motif:'rose'},
 {name:'Tallgrass Wilds', colors:['#657c3c','#557137','#3c542b','#839c4b','#a5af60','#cfbf7a'], motif:'grass'},
 {name:'Rotwood Grove', colors:['#60573d','#524b34','#393728','#766948','#969263','#c5a479'], motif:'rotwood'},
 {name:'Berry Bramble', colors:['#575269','#4e4b63','#39374e','#685a72','#9780a1','#ab647e'], motif:'berry'},
 {name:'Stone Garden', colors:['#687467','#59685b','#424f45','#828b78','#a0a58a','#959b76'], motif:'stone'},
 {name:'Rain-soaked Hollow', colors:['#456675','#3c5b64','#2a444f','#5f8290','#81a7ae','#a0b5b4'], motif:'rain'},
 {name:'Lily Pond', colors:['#427c6c','#34675e','#25514e','#5a9476','#7eaa82','#d6a9ba'], motif:'lily'},
 {name:'Abandoned Weblands', colors:['#574f64','#484257','#353240','#776b7c','#9c96a3','#b7b0b6'], motif:'web'},
 {name:'Old Root Forest', colors:['#4a6949','#405b40','#2b4434','#677f52','#8ea46c','#9a8e64'], motif:'root'},
 {name:'Sporewood', colors:['#63486c','#59415e','#403248','#85618c','#ad84ad','#cea2c6'], motif:'spore'},
 {name:'Withered Garden', colors:['#6c5940','#5d4a37','#44382e','#827052','#a68b65','#baa475'], motif:'withered'},
 {name:'The Bloom', colors:['#6c4267','#593851','#402c48','#8c587b','#b480a2','#da9daf'], motif:'bloom'},
 {name:'Heart of the Garden', colors:['#4c5b4e','#3a493d','#2b3432','#716381','#a081a3','#b291ac'], motif:'heart'},
];
const gridSafe=(x,y)=>String(Number(x.toFixed(y??1)));
const path=(data, fill, more='')=>'<path d="'+data+'" fill="'+fill+'" '+more+'/>';
const circle=(x,y,r,fill,opacity=1)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" opacity="'+opacity+'"/>';
const group=(x,y,a,s,inner)=>'<g transform="translate('+x+' '+y+') rotate('+a+') scale('+s+')">'+inner+'</g>';
const stroke=(points,col,width=1.2,alpha=.8)=>path(points,'none','stroke="'+col+'" stroke-width="'+width+'" opacity="'+alpha+'" stroke-linecap="round" stroke-linejoin="round"');
const brush=(x,y,rotation,s,c,n)=>group(x,y,rotation,s,Array.from({length:n},(_,i)=>{
  const dx=(i-(n-1)/2)*4, tip=dx*1.7, rise=15+(i*13%23);
  return path('M'+dx+' 0Q'+(dx*.9)+' '+(-rise*.52)+' '+tip+' '+(-rise)+'Q'+(dx*1.36+2)+' '+(-rise*.41)+' '+(dx+2)+' 0Z',i%3===0?c[4]:c[3]);
}).join(''));
const bough=(x,y,angle,s,colors)=>group(x,y,angle,s,
  path('M-23 17Q-6 10 18-1Q30-7 43-2L38 2Q28 2 18 8Q-6 25-23 24Z',colors[3])+
  path('M-23 17Q-6 9 18-1Q30-6 42-2L36-1Q17 4 4 14Q-11 18-23 21Z',colors[4],'opacity=".57"')+
  stroke('M-10 18q23-10 32-11M3 21q-1-4-7-5M14 11q6-2 9-8',colors[2],1.15,.52));
const pool=(x,y,a,s,c)=>group(x,y,a,s,
  path('M-30 3Q-25-16-2-14Q10-16 25-11Q39-2 30 8Q16 19-13 15Q-28 15-30 3Z',c[3],'opacity=".46"')+
  path('M-21 4Q-15-10 7-10Q21-11 27-4Q11-4 0 0Q-14 4-21 4Z',c[4],'opacity=".45"')+
  stroke('M-19 7q11 0 18-3M9 9q8 0 15-5',c[5],1,.47));
const mushroom=(x,y,a,s,c,spore=false)=>group(x,y,a,s,
  path('M-3 3Q-1-5-2-11L3-11Q1-3 5 3Q1 7-3 3Z',c[5],'opacity=".67"')+
  path('M-14-10Q-12-23 0-24Q11-23 16-11Q5-7-14-10Z',c[4])+
  path('M-14-11Q-1-15 16-11Q5-6-13-9Z',c[3])+
  (spore?stroke('M-5-12l2 3m3-4v4m4-4l-2 4',c[5],1,.58):circle(-5,-17,1.5,c[5],.7)+circle(2,-20,1,c[5],.65)+circle(8,-15,1.15,c[5],.63)));
const petals=(x,y,s,c,n=6)=>group(x,y,0,s,Array.from({length:n},(_,i)=>group(0,0,i*360/n,1,
  path('M0-2Q-6-7-2-12Q2-16 5-11Q6-6 0-2Z',c[5],'opacity="'+(i%2?'.85':'1')+'"'))).join('')+circle(0,0,4,c[3])+circle(-.65,-.6,2.15,c[2],.75));
const veinLeaf=(x,y,a,l,d,c,idx=1)=>leaf(x,y,a,l,d,c[idx===2?4:3],c[4]);
const moss=(x,y,a,s,c)=>group(x,y,a,s,
  path('M-45 2Q-35-19-16-17Q1-22 18-12Q37-14 49-1Q36 15 17 11Q3 25-17 16Q-40 19-45 2Z',c[3],'opacity=".25"')+
  path('M-35 4Q-19-10 2-12Q12-12 23-8Q37-6 40 3Q23 0 13 7Q-8 3-19 11Z',c[4],'opacity=".18"'));
const pad=(x,y,a,s,c)=>group(x,y,a,s,
  path('M3 0L24-8C21-22-4-25-17-15C-31-3-23 17-7 20C11 25 24 16 26 5Z',c[3])+
  path('M4-1L15-8C7-18-9-18-17-10C-24 0-18 13-8 15Q5 18 13 12Z',c[4],'opacity=".54"')+
  stroke('M4 0l-17-9M4 0l-19 9m19-9l-5 15',c[2],1,.44));
const web=(x,y,a,s,c)=>group(x,y,a,s,
  stroke('M-19-15L99 61M-13-16L32 102M-3-20L72 79M-8-13L51 86M-7-12L116 15',c[5],.9,.43)+
  stroke('M9-6Q22 12 25 10Q29 25 32 27Q31 42 20 47 M24-12Q36 16 43 14Q46 33 51 39Q43 60 30 64 M38-10Q53 18 64 17Q65 41 74 46Q65 70 43 84 M62-13Q76 17 84 18Q90 48 100 49',c[5],.8,.37));
const rootDetail=(x,y,a,s,c,heart=false)=>group(x,y,a,s,
  path('M-30-21Q-7-17 9 0Q20 13 40 18Q25 17 10 17Q2 17 1 25Q-22 30-31 39Z',c[3],'opacity=".87"')+
  path('M-26-19Q-12-13 7 4Q19 14 37 18Q17 13 12 16Q3 9-5 3Z',c[4],'opacity=".48"')+
  stroke('M-20-7Q11 4 12 15M-24 16Q-8 8 9 16M-20 31Q-14 22-8 17',heart?c[5]:c[2],heart?1.8:1.1,.54));
const dryLeaf=(x,y,a,s,c)=>group(x,y,a,s,
  path('M0 0Q-23-13-15-30Q-5-49 6-45Q3-40 12-30Q21-14 0 0Z',c[3])+
  path('M0-2Q-13-12-7-30Q-2-37 6-45Q1-33 8-26Q8-15 0-2Z',c[4],'opacity=".55"')+
  stroke('M0-1Q-5-15 4-41m-6 21l-9-6m11-1l8 4',c[5],1,.45));
function motif(profile,x,y,a,s){
 const c=profile.colors;
 const layout={
  grove:()=>moss(0,2,-7,1.08,c)+veinLeaf(-5,0,-57,56,20,c)+veinLeaf(1,-2,-10,59,24,c,2)+veinLeaf(8,0,37,45,18,c)+fern(11,5,-35,.95)+fern(20,10,24,.73)+flower(28,8,.61,c[5])+flower(36,11,.47,c[5])+rock(40,17,-7,.43),
  autumn:()=>moss(4,4,-13,1.13,c)+dryLeaf(-11,-3,-49,.9,c)+dryLeaf(13,0,32,.75,c)+dryLeaf(8,22,84,.58,c)+group(28,8,22,1,path('M-4-2Q-4-8 1-7Q6-7 6-2Q7 5 0 7Q-5 5-4-2Z',c[4])+path('M-5-4Q0-10 6-5L7-1L-5-1Z',c[2]))+tuft(38,15,.8,17),
  meadow:()=>moss(0,0,5,1.35,c)+brush(-12,11,-17,1.08,c,7)+brush(14,5,12,.72,c,7)+flower(25,-8,.48,c[5])+flower(33,-3,.37,c[5])+flower(44,13,.43,c[4])+stroke('M-8 20q31-10 53 3m-13-9q9 0 24 8',c[4],.85,.41),
  mushroom:()=>moss(0,8,0,1.27,c)+mushroom(-9,-4,-15,1.1,c)+mushroom(12,6,14,.74,c)+mushroom(26,6,24,.59,c)+mushroom(-30,10,-16,.62,c)+veinLeaf(21,14,62,33,12,c)+rock(41,12,-7,.49),
  sunflower:()=>moss(2,8,-12,1.21,c)+veinLeaf(4,-5,52,45,18,c,2)+veinLeaf(-8,-2,-57,36,15,c)+petals(-7,-14,1.46,c,11)+petals(22,-3,1.03,c,10)+petals(34,16,.68,c,10)+brush(42,16,20,.60,c,6),
  creek:()=>pool(13,1,-12,1.33,c)+rock(-10,-3,-17,1.05)+rock(19,11,9,.68)+rock(29,10,-52,.44)+brush(4,-5,-21,.73,c,7)+fern(38,4,64,.66),
  marsh:()=>pool(10,0,14,1.16,c)+brush(-10,8,6,1.44,c,7)+brush(12,13,-23,.91,c,5)+stroke('M-6 3L-8-33M10 5L8-23',c[4],1.8,.74)+path('M-10-37q2-5 5-1v10q-3 2-5-2zm15 10q2-4 5-1v8q-2 3-4-1z',c[3])+circle(22,-15,1.3,c[5],.68)+circle(34,-26,1.5,c[5],.54),
  rose:()=>moss(0,5,11,1.1,c)+veinLeaf(-7,-3,-61,42,17,c)+veinLeaf(6,0,39,48,15,c,2)+veinLeaf(3,12,98,32,11,c)+petals(-7,-14,1.07,c,8)+petals(16,2,.69,c,7)+petals(26,-13,.82,c,8)+circle(42,11,1.8,c[5],.6),
  grass:()=>moss(0,9,5,1.44,c)+brush(-15,12,-24,1.11,c,10)+brush(1,0,4,1.52,c,10)+brush(24,9,24,1.08,c,8)+tuft(47,15,.81,18),
  rotwood:()=>moss(1,7,-9,1.2,c)+bough(-7,1,-17,1.38,c)+mushroom(15,-8,10,.45,c)+mushroom(28,-7,22,.40,c)+rock(-17,17,11,.49),
  berry:()=>moss(0,8,-11,1.08,c)+stroke('M-17 17Q1-12 18-15Q27-16 41-6M15-13l-1-6M25-14l4-5',c[4],1.05,.78)+veinLeaf(-8,7,-62,41,17,c)+veinLeaf(4,-5,9,45,17,c,2)+veinLeaf(17,6,48,35,12,c)+[[11,-15,4],[17,-11,4.8],[23,-9,4.5],[26,-17,3.4],[31,-13,3.2],[19,-19,3.1]].map(([x,y,r])=>circle(x,y,r,c[5],.88)+circle(x-1,y-1,1,c[4],.60)).join(''),
  stone:()=>moss(0,6,-5,1.30,c)+rock(-12,0,12,1.32)+rock(21,6,-23,.83)+rock(16,-16,41,.59)+rock(39,11,16,.45)+brush(-20,14,14,.51,c,5)+stroke('M-25 7q11 4 15 2M12 13q8 1 13-4',c[4],1.6,.7),
  rain:()=>pool(0,0,-19,1.32,c)+pool(31,17,17,.58,c)+pool(-30,13,12,.39,c)+tuft(-20,-5,.62,-9)+stroke('M-17-8l-2 4m37-9l-2 5m7 20l-3 7',c[5],.75,.45),
  lily:()=>pool(4,1,-6,1.33,c)+pad(-15,-4,-17,1,c)+pad(16,1,23,.79,c)+pad(31,18,33,.56,c)+petals(-19,-5,.80,c,8)+circle(44,1,1.15,c[5],.3),
  web:()=>bough(0,0,2,.68,c)+web(-14,-34,0,1.03,c)+rock(22,20,-26,.52),
  root:()=>moss(9,3,-3,1.22,c)+rootDetail(-5,0,0,1.42,c)+rootDetail(15,1,26,.85,c)+fern(24,20,50,.56)+tuft(36,11,.66,-13),
  spore:()=>moss(4,5,-7,1.18,c)+mushroom(-7,-3,-8,1.01,c,true)+mushroom(12,-6,13,1.13,c,true)+mushroom(30,8,23,.59,c,true)+[[21,-39],[31,-44],[35,-31],[-14,-37],[42,-23],[54,-30]].map(([x,y],i)=>circle(x,y,.8+i%2*.42,c[5],.58-i*.05)).join(''),
  withered:()=>moss(7,5,3,1.18,c)+dryLeaf(-13,-5,-45,1.09,c)+dryLeaf(12,2,37,.76,c)+bough(11,12,2,.65,c)+stroke('M25-7l12 2 4-7 7-1m-7 1 5-8m-22 26 8-2 5 3 11-3',c[2],1.22,.72)+brush(33,-4,12,.56,c,4),
  bloom:()=>moss(7,4,-11,1.20,c)+veinLeaf(-8,-3,-57,55,19,c)+veinLeaf(7,-9,-7,53,19,c,2)+veinLeaf(18,-1,52,45,16,c)+petals(-5,-13,1.24,c,8)+petals(16,-11,.87,c,7)+petals(27,10,.66,c,6)+circle(42,2,2.3,c[5],.48),
  heart:()=>moss(7,2,0,1.26,c)+rootDetail(-7,1,-3,1.44,c,true)+rootDetail(15,0,25,.87,c,true)+stroke('M7 20q13-19 27-18 15 2 24-17M41 1q6 7 12 4',c[5],1.4,.50)+circle(27,4,2.1,c[5],.44)+circle(9,15,1.4,c[5],.41),
 };
 return group(x,y,a,s,layout[profile.motif]());
}

// These are the decorative groups. Coordinates, count, scale, and orientation vary by area.
const landscapeLayouts=[
  [[38,157,-33,1.18],[92,163,62,.34],[373,420,-62,.82],[53,602,41,.68]],
  [[158,107,47,.54],[311,162,131,.80],[59,300,-52,.64],[103,525,-27,1.18],[170,571,62,.63],[218,594,98,.38]],
  [[92,153,-6,1.02],[157,180,18,.54],[320,558,-26,.91]],
  [[38,257,5,1.33],[56,350,-17,.59],[328,142,8,.73],[364,117,-12,.60],[270,592,17,.58]],
  [[37,130,-25,1.24],[48,219,-9,.98],[22,302,-31,.80],[40,379,22,.68],[143,596,11,.78]],
  [[338,130,27,.84],[347,199,12,.59],[284,307,-40,1.10],[233,516,-24,.62],[168,670,-55,.72]],
  [[168,144,-5,.86],[268,179,17,.56],[350,474,-22,1.23],[262,579,-8,.65],[25,615,12,.69]],
  [[58,104,-51,1.15],[124,149,15,.70],[323,486,-37,.92],[287,572,21,.91],[329,586,-18,.55]],
  [[115,87,7,1.12],[216,91,-14,1.16],[300,122,18,.86],[38,420,-23,1.17],[121,645,62,.95],[188,674,11,.55]],
  [[60,140,56,1.38],[352,588,-138,1.22],[270,603,-23,.46]],
  [[338,119,-46,1.08],[372,203,-67,.79],[306,284,-33,.88],[370,387,-101,.53],[104,553,22,.91],[70,612,-38,.55],[145,590,28,.32]],
  [[178,136,-19,.82],[263,183,73,.42],[91,309,-33,.79],[289,511,18,.65],[161,612,-24,1.01]],
  [[136,128,-14,.82],[224,258,4,.66],[291,434,12,1.13],[57,547,-20,.94],[151,626,9,.51]],
  [[48,236,-12,.78],[101,285,-20,.52],[252,160,15,.82],[374,538,47,.83],[301,619,18,.91],[215,650,4,.46]],
  [[-5,117,4,1.21],[357,585,143,1.02]],
  [[384,137,178,1.46],[331,208,-121,.76],[290,241,-116,.62],[36,592,-16,.90],[42,666,32,.58]],
  [[56,137,15,.88],[135,195,64,.72],[22,328,4,.51],[58,523,-20,1.15],[121,602,28,.89],[172,614,-16,.47]],
  [[99,136,97,.85],[331,262,-71,.96],[215,593,138,.69]],
  [[313,109,-41,1.23],[358,213,-63,.64],[360,371,-40,.81],[28,511,45,1.10],[22,595,69,.79],[116,632,31,1.01]],
  [[151,109,82,1.21],[378,289,-122,.98],[237,509,19,.83],[147,617,41,1.44],[48,656,-11,.99]],
];
const groundBands=[
 ['M-17 94Q49 61 120 118Q128 164 101 205Q54 200 5 247L-17 247Z','M395 303Q320 359 334 402Q360 451 395 480Z','M-15 530Q78 520 108 599Q95 637-10 662Z'],
 ['M125 72Q193 73 289 167Q267 194 205 155Q159 120 101 112Z','M-18 391Q61 437 124 503Q171 555 240 566Q187 614 132 596Q37 573-8 525Z'],
 ['M-18 130Q59 81 154 124Q220 163 253 107Q227 209 137 199Q57 216-18 294Z','M229 714Q267 633 334 539Q382 507 405 558V714Z'],
 ['M-12 132Q69 151 96 251Q102 341 42 408L-12 418Z','M210 114Q263 67 393 109V212Q344 208 270 191Z','M207 657Q265 580 331 604Q357 643 405 637V714H227Z'],
 ['M-9 58Q48 75 89 140Q111 214 62 292Q16 353 68 418Q53 462-8 474Z','M0 598Q74 520 167 562Q184 581 190 627Q106 664 0 684Z'],
 ['M299-10Q317 73 357 120Q389 163 346 227Q291 333 273 386Q248 430 268 487Q256 536 207 577Q169 616 167 714H126Q158 605 193 552Q232 487 226 435Q232 362 258 294Q297 249 316 184Q330 136 286 87L256-14Z'],
 ['M91 100Q210 60 308 127Q342 186 298 219Q265 181 203 200Q136 225 92 187Z','M394 347Q322 367 311 446Q281 501 204 531Q167 584 197 601Q268 599 311 572Q364 553 402 606Z','M-16 568Q41 555 87 617L82 674H-19Z'],
 ['M-9 70Q75 74 161 136Q143 192 63 181Q14 209-9 245Z','M394 408Q305 407 267 461Q247 499 264 566Q301 618 396 630Z'],
 ['M-10 91Q81 27 215 54Q299 64 410 128L403 176Q315 130 236 128Q119 142 21 170L-12 222Z','M-9 343Q55 359 80 437Q61 472-9 458Z','M28 714Q79 614 188 602Q238 618 283 714Z'],
 ['M-23 101Q61 50 141 162Q159 207 105 236Q35 219-20 282Z','M254 714Q223 637 274 586Q336 522 402 598V714Z'],
 ['M391 50Q354 115 300 161Q295 201 318 233Q282 282 294 333Q332 377 410 409Z','M-20 585Q39 505 137 530Q170 544 173 592Q117 652 66 645Q24 674-17 689Z'],
 ['M95 116Q178 85 241 151Q259 195 198 207Q153 223 98 182Z','M32 293Q76 253 130 286Q144 314 120 340Q68 360 32 323Z','M169 536Q240 475 310 497Q339 523 311 569Q251 610 188 632Q123 649 96 609Z'],
 ['M52 103Q127 85 195 120Q235 155 191 174Q145 174 94 152Z','M165 198Q233 183 298 242Q306 314 257 326Q206 318 165 263Z','M-12 505Q61 472 143 510Q185 577 150 641Q71 672-15 636Z','M265 419Q333 395 401 425V508Q337 515 277 491Z'],
 ['M-13 167Q69 162 121 244Q143 286 95 342Q47 352-15 316Z','M195 120Q265 89 306 118Q329 173 265 197Q227 209 197 168Z','M412 448Q314 483 264 547Q223 612 175 653Q219 712 313 681L412 625Z'],
 ['M-12 66Q65 81 106 168Q105 218 60 231L-12 250Z','M293 714Q329 693 320 616Q288 564 306 514Q343 478 405 503V714Z'],
 ['M407-13Q330 10 291 96Q261 160 281 206Q273 262 205 286Q266 325 317 279Q336 240 369 226Q385 221 406 225Z','M-11 485Q66 524 91 598Q93 653 144 714H-11Z'],
 ['M-8 87Q64 67 148 103Q191 145 174 201Q154 250 99 253Q60 245 54 308Q12 365-8 351Z','M-9 458Q64 440 89 501Q121 529 178 567Q195 601 187 637Q113 687 51 654Q20 625-9 639Z'],
 ['M23 98Q94 80 161 117Q170 152 134 185Q86 173 62 155Z','M264 207Q341 176 414 241V330Q361 331 310 308Z','M130 565Q203 554 259 588Q286 628 248 656Q189 658 140 632Z'],
 ['M276 70Q331 51 408 106V457Q360 440 337 385Q310 343 337 301Q350 258 301 232Q245 190 265 133Z','M-14 445Q68 438 106 512Q109 568 163 588Q186 630 166 674Q91 686 64 648Q23 614-14 639Z'],
 ['M86 64Q196 32 307 110Q312 172 250 202Q190 206 138 257Q81 251 65 209Q104 178 87 133Z','M398 208Q348 204 324 295Q293 353 337 393Q355 436 397 458Z','M-10 551Q69 496 133 553Q156 584 225 548Q256 556 258 600Q218 665 156 680Q75 680 26 706L-10 705Z'],
];
for(const [index,profile] of profiles.entries())profile.positions=landscapeLayouts[index];

function dustLayer(corruption,random,scaleX,scaleY){
 if(!corruption)return '';
 const count=18+Math.round(corruption*82);
 const positions=[];
 let particles='';
 for(let i=0;i<count;i++){
  let x,y;
  do {
    x=9+random()*375;
    y=65+random()*597;
  } while(positions.some(([px,py])=>Math.hypot(px-x,py-y)<10));
  positions.push([x,y]);

  const angle=random()*Math.PI*2;
  const kind=random();
  const length=kind<.14?3.1+random()*3.8:1+random()*2.5;
  const thin=.52+random()*.78;
  const color=kind<.20?'#ecb4fa':kind<.52?'#cf81e4':'#ae63cb';
  const opacity=(.29+random()*.43)*(.74+corruption*.43);
  const along=length*Math.cos(angle)*scaleX,rise=length*Math.sin(angle)*scaleY;
  const forward='M'+gridSafe(x)+' '+gridSafe(y);
  if(kind<.14){
   // A few longer grains have a gap through the middle, like a broken trail.
   const leading=forward+'l'+gridSafe(along*.41)+' '+gridSafe(rise*.41);
   const trailing='M'+gridSafe(x+along*.64)+' '+gridSafe(y+rise*.64)+'l'+gridSafe(along*.36)+' '+gridSafe(rise*.36);
   particles+=stroke(leading+trailing,color,thin,opacity);
  }else if(kind<.54){
   const shape=forward+'l'+gridSafe(along*.65)+' '+gridSafe(rise*.65)
    +'l'+gridSafe(rise*.22)+' '+gridSafe(-along*.22)+'l'+gridSafe(-along*.80)+' '+gridSafe(-rise*.71)+'Z';
   particles+=path(shape,color,'opacity="'+gridSafe(opacity,3)+'"');
  }else{
   particles+=stroke(forward+'l'+gridSafe(along)+' '+gridSafe(rise),color,thin,opacity);
  }
 }
 return '<g data-story-dust="true" data-dust-count="'+count+'">'+particles+'</g>';
}
function floor(profile,index,corruption,lightX,width,height,terrain){
 // Terrain fills the surface. Individual plants retain their proportions on wide and tall screens.
 const ratio=(width/height)/(393/714);
 const scaleX=Math.min(1,1/ratio),scaleY=Math.min(1,ratio);
 const c=profile.colors;
 let seed=131+121*index;
 const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const soil=profile.positions.map(([x,y,,s])=>[x,y,52*s,44*s,28]);
 let grain='';
 for(const [x,y,rx,ry,n] of soil){
  for(let j=0;j<n;j++){
   const a=random()*Math.PI*2,r=Math.sqrt(random());
   const x1=x+Math.cos(a)*rx*r,y1=y+Math.sin(a)*ry*r,len=.7+random()*1.8;
   grain+=stroke('M'+gridSafe(x1)+' '+gridSafe(y1)+'l'+gridSafe(len*(j%2?1:-1))+' '+gridSafe(-len*.45),j%3===0?c[4]:c[2],.75,.35);
  }
 }
 const settings=profile.positions.map(([x,y,a,s])=>
  '<g transform="translate('+x+' '+y+') scale('+scaleX+' '+scaleY+') translate('+(-x)+' '+(-y)+')">'+motif(profile,x,y,a,s)+'</g>').join('');
 const bandColor=profile.motif==='creek'?c[2]:c[3];
 const bands=groundBands[index].map((shape,i)=>path(shape,bandColor,'opacity="'+gridSafe(profile.motif==='creek'?.35:.13+i*.027,3)+'"')).join('');
 const feature=profile.motif==='creek'
  ?stroke('M310-2Q316 77 354 123Q365 170 316 258Q275 326 247 403Q244 477 239 531Q213 582 179 623L163 689',c[5],1.7,.34):
   profile.motif==='withered'
  ?stroke('M0 290l26 0 11 10 19-3 13 7m-34-4 2 12m344 138-28 9-12-7-15 1m25 5-3 16M131 481l17 11 12-7 9 5',c[2],1.6,.56):
   profile.motif==='web'
  ?stroke('M0 506q26 9 54 6m277-327q28-3 62 11',c[4],.9,.30):'';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 393 714" preserveAspectRatio="none"><defs>'+
  '<linearGradient id="turf" x1="0" x2=".54" y2="1"><stop stop-color="'+c[0]+'"/><stop offset=".53" stop-color="'+c[1]+'"/><stop offset="1" stop-color="'+c[2]+'"/></linearGradient>'+
  '<radialGradient id="light" cx="'+lightX+'" cy=".38" r=".86"><stop stop-color="'+c[4]+'" stop-opacity=".14"/><stop offset=".64" stop-color="'+c[1]+'" stop-opacity="0"/><stop offset="1" stop-color="'+c[2]+'" stop-opacity=".38"/></radialGradient>'+
  '</defs>'+
  (terrain?'<rect width="393" height="714" fill="url(#turf)"/><rect width="393" height="714" fill="url(#light)"/>'+
    bands+feature+grain+settings:'')+dustLayer(corruption,random,scaleX,scaleY)+'</svg>';
}
function mosquitoColors(phase){
 const initial=profiles[0].colors;
 return initial.map((hex,index)=>{
  const value=Number.parseInt(hex.slice(1),16);
  const offsets=index<3?[-.65,-.53,.72]:[-.38,-.43,.34];
  const rgb=[(value>>16)&255,(value>>8)&255,value&255];
  return '#'+rgb.map((channel,k)=>Math.round(channel+phase*offsets[k]).toString(16).padStart(2,'0')).join('');
 });
}
function mosquitoPhase(wave){return Math.min(10,Math.floor(wave/10));}

const textures=new Map();
function texture(index,phase,terrain,corruption,width,height){
 const key=[index,phase,terrain,corruption,width,height].join(':');
 const existing=textures.get(key);
 if(existing)return existing;
 const source=profiles[index];
 const colors=phase<0?source.colors:mosquitoColors(phase);
 const lightX=phase<0?.42:gridSafe(.42+phase*.003,3);
 const art={key,colors,state:'loading',image:null};
 const image=new Image();
 image.onload=()=>{art.image=image;art.state='ready';};
 image.onerror=()=>{art.state='unavailable';};
 const markup=floor({...source,colors},index,corruption,lightX,width,height,terrain);
 textures.set(key,art);
 // Bound decoded image memory while moving through areas or resizing the game.
 if(textures.size>3)textures.delete(textures.keys().next().value);
 image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(markup);
 return art;
}
return {texture,mosquitoPhase};
})();
