const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cms=require('../cms-content.js');
const read=name=>JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../content',name+'.json'),'utf8'));
test('current photos and zones satisfy CMS contracts and every image exists',()=>{
 const zones=read('zones'),photos=read('photos');assert.ok(cms.zoneData(zones));assert.ok(cms.photoData(photos));
 const paths=[...zones.flatMap(z=>z.images),...photos.hero,...photos.lounge,...photos.food.map(f=>f.image)];
 paths.forEach(path=>assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',path)),path));
 assert.deepEqual(zones.map(z=>z.images.length),[1,1,1,1,1]);assert.equal(photos.food.length,10);
});
test('image paths reject script/external URLs and traversal',()=>{
 for(const x of ['javascript:alert(1)','https://bad.test/x.webp','assets/../x.jpg','assets/x.svg','assets/x.webp" onerror="alert(1)'])assert.equal(cms.imagePath(x),'');
 assert.equal(cms.imagePath('/assets/food-burger.webp'),'assets/food-burger.webp');
 assert.equal(cms.imagePath('assets/фото 1.jpg'),'assets/фото 1.jpg');
 assert.equal(cms.escapeHTML('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('empty and malformed galleries fall back instead of breaking controls',()=>{
 assert.equal(cms.zoneData([]),null);assert.equal(cms.zoneData([{}]),null);assert.equal(cms.photoData({hero:[],food:[],lounge:[]}),null);
 const photos=read('photos');photos.food[0].image='javascript:alert(1)';assert.equal(cms.photoData(photos),null);
});
test('fetch failures and invalid JSON use fallback; unaffected content still loads',async()=>{
 const result=await cms.load(async url=>{if(url.includes('site'))throw Error('offline');if(url.includes('zones'))return {ok:true,json:async()=>{throw Error('invalid JSON')}};return {ok:true,json:async()=>read('photos')}});
 assert.equal(result.site,null);assert.equal(result.zones,null);assert.equal(result.photos.food.length,10);
});
test('CMS fields correspond to actual JSON data',()=>{
 const config=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../.pages.yml'),'utf8'));
 function check(fields,data){for(const field of fields){if(!Object.hasOwn(data,field.name)){assert.ok(!field.required,field.name);continue}if(field.type==='object'){const values=field.list?data[field.name]:[data[field.name]];values.forEach(value=>check(field.fields,value))}}}
 for(const section of config.content){let data=read(section.name);if(!section.list)data=[data];data.forEach(value=>check(section.fields,value))}
});

test('malformed section data never reaches DOM rendering',()=>{assert.ok(cms.siteData(read('site')));assert.equal(cms.siteData({service:{cards:[null]}}),null);assert.equal(cms.siteData({hero:null}),null)});

test('client price list includes five zones and both PlayStation tariff groups',()=>{
 const zones=read('zones');assert.equal(zones.length,5);
 assert.deepEqual(zones.map(z=>z.name),['ROKU COMFORT','ROKU BOOTCAMP','ROKU VIP PC','ROKU VIP PLAYSTATION','ROKU LOUNGE']);
 assert.equal(zones[0].tariffs[0].rows[4].value,'1 450 ₽');assert.equal(zones[2].tariffs[0].rows[1].value,'4 000 ₽');assert.equal(zones[3].tariffs[1].rows[1].value,'4 450 ₽');assert.equal(zones[4].tariffs.length,0);
 zones[0].tariffs=[{title:'bad',rows:[null]}];assert.equal(cms.zoneData(zones),null);
});
test('Voronezh FAQ has no Moscow address or unsupported GPU models',()=>{
 const faq=read('faq');assert.ok(cms.faqData(faq));assert.equal(faq.length,6);assert.doesNotMatch(JSON.stringify(faq),/Москв|Новослобод|Менделеев|5090|9800/);assert.equal(cms.faqData([{question:'q',answer:42}]),null);
});

test('Pages CMS may omit empty optional fields without invalidating content',()=>{
 const site=read('site');delete site.general.vk;delete site.general.telegram;delete site.hero.second;assert.ok(cms.siteData(site));
});
