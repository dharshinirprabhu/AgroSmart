// ====================== STATE ======================
const appState = {
  lang: 'en',
  cropResult: null,
  fertResult: null,
  diseaseResult: null,
  irrigResult: null,
  weatherData: null
};

// ====================== NAV ======================
function showTab(id, btn, mobile=false) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  if(mobile) { document.getElementById('mobileNav').classList.remove('open'); document.getElementById('hamburger').textContent='☰'; }
  window.scrollTo(0,0);
  if(id==='home') initCharts();
}

function toggleMobileNav() {
  const d=document.getElementById('mobileNav');
  const open=d.classList.toggle('open');
  document.getElementById('hamburger').textContent=open?'✕':'☰';
}

// ====================== CHARTS ======================
let chartsInit=false;
function initCharts() {
  if(chartsInit) return; chartsInit=true;
  const cPalette=['#7aab6b','#a8c99d','#f0c84a','#89bfd8','#d4a574','#e8736a','#9b8ec4'];

  new Chart(document.getElementById('cropChart'),{
    type:'bar',
    data:{
      labels:['Rice','Wheat','Sugarcane','Cotton','Maize','Pulses','Oilseeds'],
      datasets:[{label:'Million Tonnes',data:[130,110,480,35,33,25,38],backgroundColor:cPalette,borderRadius:8,borderSkipped:false}]
    },
    options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#f0ede8'},ticks:{color:'#8a9478',font:{size:11}}},x:{grid:{display:false},ticks:{color:'#8a9478',font:{size:11}}}}}
  });

  new Chart(document.getElementById('rainfallChart'),{
    type:'bar',
    data:{
      labels:['NE India','West Coast','Central','North','South','NW India','East'],
      datasets:[{label:'mm',data:[2800,3000,1100,700,800,350,1600],backgroundColor:['#89bfd8','#5aaecc','#a8d8ea','#cfe8f4','#7ab8d4','#4a9ab8','#b8e0f0'],borderRadius:8,borderSkipped:false}]
    },
    options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#f0ede8'},ticks:{color:'#8a9478',font:{size:11}}},x:{grid:{display:false},ticks:{color:'#8a9478',font:{size:10}}}}}
  });

  new Chart(document.getElementById('soilChart'),{
    type:'doughnut',
    data:{
      labels:['Alluvial','Black','Red','Laterite','Desert','Mountain','Saline'],
      datasets:[{data:[40,15,18,8,10,5,4],backgroundColor:['#7aab6b','#3a3a2a','#c0392b','#e67e22','#f5e6c8','#8d6e63','#7fb3d3'],borderWidth:2,borderColor:'#fff'}]
    },
    options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:'#5a6347',font:{size:11},padding:12}}}}
  });

  new Chart(document.getElementById('trendChart'),{
    type:'line',
    data:{
      labels:['2015','2016','2017','2018','2019','2020','2021','2022','2023'],
      datasets:[
        {label:'Food Grains',data:[252,252,275,285,285,297,309,315,323],borderColor:'#7aab6b',backgroundColor:'rgba(122,171,107,0.1)',tension:0.4,fill:true,pointBackgroundColor:'#7aab6b'},
        {label:'Horticulture',data:[283,295,307,312,320,325,334,341,350],borderColor:'#89bfd8',backgroundColor:'rgba(137,191,216,0.1)',tension:0.4,fill:true,pointBackgroundColor:'#89bfd8'}
      ]
    },
    options:{responsive:true,plugins:{legend:{labels:{color:'#5a6347',font:{size:11}}}},scales:{y:{grid:{color:'#f0ede8'},ticks:{color:'#8a9478',font:{size:11}}},x:{grid:{display:false},ticks:{color:'#8a9478',font:{size:11}}}}}
  });
}
window.addEventListener('load', initCharts);

// ====================== CROP RECOMMENDATION ======================
const cropRules = [
  {crops:['Rice','Jute'],soil:['Alluvial','Clayey'],phMin:5,phMax:7,tempMin:20,tempMax:40,rainMin:800,nMin:80,pMin:30,kMin:30,reason:'High water retention soil with warm temperatures and high rainfall is ideal for paddy cultivation.'},
  {crops:['Wheat','Mustard'],soil:['Alluvial','Loamy'],phMin:6,phMax:8,tempMin:10,tempMax:25,rainMin:400,nMin:60,pMin:20,kMin:20,reason:'Cool climate with moderate rainfall suits wheat. Alluvial soil provides excellent nutrient support.'},
  {crops:['Cotton','Groundnut'],soil:['Black (Regur)','Red','Loamy'],phMin:6,phMax:8.5,tempMin:20,tempMax:40,rainMin:500,nMin:50,pMin:25,kMin:25,reason:'Black soil retains moisture and provides potassium essential for cotton fiber development.'},
  {crops:['Sugarcane','Banana'],soil:['Alluvial','Loamy'],phMin:5.5,phMax:7.5,tempMin:20,tempMax:38,rainMin:1000,nMin:100,pMin:50,kMin:50,reason:'Deep fertile soil with high rainfall and warm conditions support the high biomass production of sugarcane.'},
  {crops:['Millet','Sorghum','Pulses'],soil:['Red','Laterite','Sandy'],phMin:5.5,phMax:7,tempMin:25,tempMax:45,rainMin:200,nMin:20,pMin:10,kMin:10,reason:'Drought-tolerant crops suited to lighter soils with low water holding capacity.'},
  {crops:['Tea','Coffee','Cardamom'],soil:['Laterite','Red'],phMin:4.5,phMax:6,tempMin:15,tempMax:28,rainMin:1500,nMin:60,pMin:30,kMin:40,reason:'Acidic soil and heavy rainfall in hilly terrain create perfect conditions for plantation crops.'},
];

function getCropRec() {
  const soil   = document.getElementById('c-soil').value;
  const ph     = parseFloat(document.getElementById('c-ph').value);
  const temp   = parseFloat(document.getElementById('c-temp').value);
  const rain   = parseFloat(document.getElementById('c-rain').value);
  const loc    = document.getElementById('c-loc').value;
  const humid  = parseFloat(document.getElementById('c-humid').value)||60;
  const n      = parseFloat(document.getElementById('c-n').value)||0;
  const p      = parseFloat(document.getElementById('c-p').value)||0;
  const k      = parseFloat(document.getElementById('c-k').value)||0;

  if(!soil||!ph||!temp||!rain){ alert('Please fill all required fields.'); return; }

  const btn = document.querySelector('#tab-crop .btn-primary');
  btn.innerHTML = '<span class="spinner"></span>Analyzing...'; btn.disabled = true;

  setTimeout(()=>{
    btn.innerHTML = ' Recommend Crop'; btn.disabled = false;

    let matched = [];
    for(const rule of cropRules){
      const soilMatch = rule.soil.some(s => soil.includes(s.split(' ')[0]) || s.includes(soil));
      const npkMatch  = (n===0 && p===0 && k===0) || (n >= rule.nMin && p >= rule.pMin && k >= rule.kMin);
      if(soilMatch && ph>=rule.phMin && ph<=rule.phMax && temp>=rule.tempMin && temp<=rule.tempMax && rain>=rule.rainMin && npkMatch){
        matched.push(rule);
      }
    }
    // fallback if NPK is provided but nothing matched — relax NPK constraint
    if(!matched.length && (n>0||p>0||k>0)){
      for(const rule of cropRules){
        const soilMatch = rule.soil.some(s => soil.includes(s.split(' ')[0]) || s.includes(soil));
        if(soilMatch && ph>=rule.phMin && ph<=rule.phMax && temp>=rule.tempMin && temp<=rule.tempMax && rain>=rule.rainMin){
          matched.push(rule);
        }
      }
    }
    if(!matched.length) matched = [cropRules[1]];

    const top = matched[0];
    const npkNote = (n>0||p>0||k>0)
      ? `<p style="font-size:0.85rem;color:var(--text-light);margin-top:8px">🧪 Soil NPK provided — N:${n}, P:${p}, K:${k} kg/ha factored into match.</p>`
      : '';

    document.getElementById('cropResultTitle').innerHTML = `🌾 Recommended: <strong>${top.crops[0]}</strong>`;
    document.getElementById('cropResultBody').innerHTML = `
      <p style="color:var(--text-mid);font-size:0.9rem;margin-bottom:4px">📋 <em>${top.reason}</em></p>
      ${npkNote}
      <div class="result-grid">
        <div class="result-item"><div class="ri-label">Primary Crop</div><div class="ri-value">${top.crops[0]}</div></div>
        <div class="result-item"><div class="ri-label">Alternative</div><div class="ri-value">${top.crops[1]||'N/A'}</div></div>
        <div class="result-item"><div class="ri-label">Best Season</div><div class="ri-value">${temp>25?'Kharif (Jun–Oct)':'Rabi (Oct–Mar)'}</div></div>
        <div class="result-item"><div class="ri-label">Water Need</div><div class="ri-value">${rain>1000?'High':'Medium'}</div></div>
        <div class="result-item"><div class="ri-label">Min N Required</div><div class="ri-value">${top.nMin} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Min P Required</div><div class="ri-value">${top.pMin} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Min K Required</div><div class="ri-value">${top.kMin} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Expected Yield</div><div class="ri-value">${(3+Math.random()*2).toFixed(1)} T/ha</div></div>
        <div class="result-item"><div class="ri-label">Market Value</div><div class="ri-value">₹${(1500+Math.floor(Math.random()*2000))}/Qtl</div></div>
      </div>`;
    document.getElementById('cropResult').classList.add('show');
    appState.cropResult = {crop:top.crops[0], alt:top.crops[1], reason:top.reason, soil, ph, temp, rain, loc, n, p, k};
  }, 1200);
}

// ====================== FERTILIZER ======================
const fertDB = {
  'Rice':      {N:120,P:60,K:60, organic:'Compost + Azospirillum',         chemical:'Urea + DAP + MOP'},
  'Wheat':     {N:120,P:60,K:40, organic:'FYM + Rhizobium',                chemical:'Urea + SSP + Muriate of Potash'},
  'Sugarcane': {N:250,P:112,K:112,organic:'Pressmud + Biofertilizer',       chemical:'Urea + DAP + SOP'},
  'Cotton':    {N:100,P:50,K:50, organic:'Neem Cake + Vermicompost',        chemical:'Urea + DAP + K2SO4'},
  'Maize':     {N:120,P:60,K:40, organic:'Green Manure + PSB',              chemical:'Urea + SSP + MOP'},
  'Tomato':    {N:100,P:60,K:80, organic:'Vermicompost + Trichoderma',      chemical:'19:19:19 + Calcium Nitrate'},
  'Potato':    {N:180,P:80,K:200,organic:'FYM + Biofertilizer mix',         chemical:'Urea + DAP + SOP'},
  'Onion':     {N:100,P:50,K:60, organic:'Compost + Azotobacter',           chemical:'Urea + SSP + K2SO4'},
  'Groundnut': {N:25, P:50,K:75, organic:'Rhizobium + Gypsum',              chemical:'SSP + MOP + Boron'},
  'Soybean':   {N:30, P:60,K:40, organic:'Rhizobium + PSB',                 chemical:'DAP + MOP'},
};

function getFertRec() {
  const crop   = document.getElementById('f-crop').value;
  const n      = parseFloat(document.getElementById('f-n').value)||0;
  const p      = parseFloat(document.getElementById('f-p').value)||0;
  const k      = parseFloat(document.getElementById('f-k').value)||0;
  const soil   = document.getElementById('f-soil').value;
  const stage  = document.getElementById('f-stage').value;
  const ph     = parseFloat(document.getElementById('f-ph').value)||7;
  const temp   = parseFloat(document.getElementById('f-temp').value)||28;
  const humid  = parseFloat(document.getElementById('f-humid').value)||60;
  const area   = parseFloat(document.getElementById('f-area').value)||1;

  if(!crop){ alert('Please select a crop.'); return; }

  const btn = document.querySelector('#tab-fertilizer .btn-primary');
  btn.innerHTML = '<span class="spinner"></span>Calculating...'; btn.disabled = true;

  setTimeout(()=>{
    btn.innerHTML = '🧪 Get Fertilizer Plan'; btn.disabled = false;
    const rec  = fertDB[crop] || {N:100,P:50,K:50,organic:'Compost + Biofertilizer',chemical:'Urea + DAP + MOP'};

    // Adjust for pH — acidic soils need more P; alkaline soils need more K
    let adjP = rec.P, adjK = rec.K, adjN = rec.N;
    if(ph < 6)   adjP = Math.round(rec.P * 1.15);
    if(ph > 7.5) adjK = Math.round(rec.K * 1.10);
    // Adjust for high temperature — more N lost via volatilization
    if(temp > 35) adjN = Math.round(rec.N * 1.10);
    // Adjust for humidity — high humidity reduces K needs slightly
    if(humid > 80) adjK = Math.max(20, Math.round(adjK * 0.9));

    const defN = Math.max(0, adjN - n);
    const defP = Math.max(0, adjP - p);
    const defK = Math.max(0, adjK - k);

    // Scale to area
    const totalN = Math.round(defN * area);
    const totalP = Math.round(defP * area);
    const totalK = Math.round(defK * area);

    document.getElementById('fertResultBody').innerHTML = `
      <p style="font-size:0.85rem;color:var(--text-light);margin-bottom:20px">
        Adjusted for pH ${ph}, ${temp}°C temperature, ${humid}% humidity · Area: ${area} ha
      </p>
      <div class="result-grid">
        <div class="result-item"><div class="ri-label">Required N</div><div class="ri-value">${adjN} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Required P₂O₅</div><div class="ri-value">${adjP} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Required K₂O</div><div class="ri-value">${adjK} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Current Soil N</div><div class="ri-value">${n} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Current Soil P</div><div class="ri-value">${p} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Current Soil K</div><div class="ri-value">${k} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Deficit N</div><div class="ri-value" style="color:${defN>0?'#c0392b':'#2d7a3a'}">${defN} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Deficit P</div><div class="ri-value" style="color:${defP>0?'#c0392b':'#2d7a3a'}">${defP} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Deficit K</div><div class="ri-value" style="color:${defK>0?'#c0392b':'#2d7a3a'}">${defK} kg/ha</div></div>
        <div class="result-item"><div class="ri-label">Total N for ${area} ha</div><div class="ri-value">${totalN} kg</div></div>
        <div class="result-item"><div class="ri-label">Total P for ${area} ha</div><div class="ri-value">${totalP} kg</div></div>
        <div class="result-item"><div class="ri-label">Total K for ${area} ha</div><div class="ri-value">${totalK} kg</div></div>
      </div>
      <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="background:var(--white);border-radius:var(--radius-sm);padding:18px;border-left:3px solid var(--sage)">
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-light);margin-bottom:8px">🌿 ORGANIC ALTERNATIVES</div>
          <div style="font-size:0.9rem;color:var(--text-dark)">${rec.organic}</div>
          <div style="font-size:0.8rem;color:var(--text-light);margin-top:6px">Apply 2–3 weeks before sowing for best results.</div>
        </div>
        <div style="background:var(--white);border-radius:var(--radius-sm);padding:18px;border-left:3px solid var(--sky-dark)">
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-light);margin-bottom:8px">⚗️ CHEMICAL FERTILIZERS</div>
          <div style="font-size:0.9rem;color:var(--text-dark)">${rec.chemical}</div>
          <div style="font-size:0.8rem;color:var(--text-light);margin-top:6px">Apply in split doses for ${stage} stage.</div>
        </div>
      </div>`;
    document.getElementById('fertResult').classList.add('show');
    appState.fertResult = {crop, rec:{N:adjN,P:adjP,K:adjK}, defN, defP, defK, organic:rec.organic, chemical:rec.chemical, n, p, k, ph, temp, area};
  }, 1000);
}

// ====================== DISEASE DETECTION ======================
const diseases=[
  {name:'Rice Blast',confidence:94,pathogen:'Magnaporthe oryzae',treatment:['Apply Tricyclazole 75 WP @ 0.6 g/L','Remove infected leaves and burn','Maintain field hygiene','Apply silica-based fertilizers'],organic:'Neem oil spray + Trichoderma viride'},
  {name:'Leaf Blight',confidence:89,pathogen:'Xanthomonas oryzae',treatment:['Spray Copper Oxychloride 50 WP','Drain stagnant water','Avoid excessive nitrogen','Use resistant varieties'],organic:'Garlic extract spray + Pseudomonas fluorescens'},
  {name:'Powdery Mildew',confidence:91,pathogen:'Erysiphe cichoracearum',treatment:['Spray Sulfur 80 WP @ 3 g/L','Improve air circulation','Avoid overhead irrigation','Apply Propiconazole'],organic:'Baking soda solution + Neem oil'},
  {name:'Early Blight',confidence:87,pathogen:'Alternaria solani',treatment:['Apply Mancozeb 75 WP','Remove lower infected leaves','Avoid wetting leaves','Use drip irrigation'],organic:'Copper sulfate + Bordeaux mixture'},
  {name:'Healthy Leaf',confidence:98,pathogen:'None detected',treatment:['No treatment required','Maintain current practices','Continue regular monitoring'],organic:'Continue preventive neem oil sprays'},
];

function previewLeaf(e) {
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const img=document.getElementById('leaf-preview');
    img.src=ev.target.result; img.style.display='block';
    document.getElementById('detectBtn').style.display='inline-block';
  };
  reader.readAsDataURL(file);
}

function detectDisease() {
  const btn=document.getElementById('detectBtn');
  btn.innerHTML='<span class="spinner"></span>Analyzing...'; btn.disabled=true;
  setTimeout(()=>{
    btn.innerHTML='🔍 Analyze Disease'; btn.disabled=false;
    const d=diseases[Math.floor(Math.random()*diseases.length)];
    const isHealthy=d.name==='Healthy Leaf';
    document.getElementById('diseaseResultBody').innerHTML=`
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap">
        <div style="background:${isHealthy?'var(--sage)':'#e74c3c'};color:#fff;padding:10px 24px;border-radius:50px;font-weight:700;font-size:1rem">${isHealthy?'✅ Healthy':'⚠️ '+d.name}</div>
        <div style="font-size:0.9rem;color:var(--text-mid)">Pathogen: <strong>${d.pathogen}</strong></div>
      </div>
      <div style="margin-bottom:20px">
        <div style="font-size:0.82rem;font-weight:700;color:var(--text-light);margin-bottom:6px">CONFIDENCE SCORE</div>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="confidence-bar" style="flex:1"><div class="confidence-fill" style="width:${d.confidence}%"></div></div>
          <div style="font-weight:700;color:var(--sage)">${d.confidence}%</div>
        </div>
      </div>
      <div>
        <div style="font-size:0.82rem;font-weight:700;color:var(--text-light);margin-bottom:10px">TREATMENT PROTOCOL</div>
        ${d.treatment.map((t,i)=>`<div style="display:flex;gap:10px;padding:10px;background:var(--white);border-radius:var(--radius-sm);margin-bottom:8px;border-left:3px solid var(--sage)"><span style="font-weight:700;color:var(--sage)">${i+1}.</span><span style="font-size:0.88rem;color:var(--text-mid)">${t}</span></div>`).join('')}
        <div style="margin-top:12px;padding:14px;background:var(--yellow-soft);border-radius:var(--radius-sm);border-left:3px solid var(--yellow)">
          <div style="font-size:0.8rem;font-weight:700;color:var(--brown);margin-bottom:4px">🌿 ORGANIC ALTERNATIVE</div>
          <div style="font-size:0.88rem;color:var(--text-mid)">${d.organic}</div>
        </div>
      </div>`;
    document.getElementById('diseaseResult').classList.add('show');
    appState.diseaseResult=d;
  },2000);
}

// ====================== IRRIGATION ======================
function getIrrigation() {
  const crop  = document.getElementById('i-crop').value;
  const soil  = document.getElementById('i-soil').value;
  const stage = document.getElementById('i-stage').value;
  const temp  = parseFloat(document.getElementById('i-temp').value)||28;
  const rain  = parseFloat(document.getElementById('i-rain').value)||0;
  const humid = parseFloat(document.getElementById('i-humid').value)||60;
  if(!crop||!soil){ alert('Please select crop and soil type.'); return; }

  const btn=document.querySelector('#tab-irrigation .btn-primary');
  btn.innerHTML='<span class="spinner"></span>Planning...'; btn.disabled=true;

  setTimeout(()=>{
    btn.innerHTML='💧 Generate Irrigation Plan'; btn.disabled=false;
    let baseInterval=3, baseQty=5;
    if(crop==='Rice'){baseInterval=1;baseQty=10;}
    else if(crop==='Sugarcane'){baseInterval=2;baseQty=8;}
    else if(['Tomato','Potato'].includes(crop)){baseInterval=2;baseQty=4;}
    if(soil==='Sandy') baseInterval=Math.max(1,baseInterval-1);
    else if(soil==='Clay') baseInterval+=1;
    if(temp>35){baseInterval=Math.max(1,baseInterval-1);baseQty+=2;}
    if(rain>50){baseInterval+=2;baseQty=Math.max(2,baseQty-3);}
    if(humid>75) baseInterval+=1;
    if(stage==='Seedling') baseQty=Math.max(2,baseQty-2);
    if(stage==='Flowering') baseQty+=2;
    baseInterval=Math.min(7,Math.max(1,baseInterval));

    document.getElementById('irrigResultBody').innerHTML=`
      <div class="result-grid">
        <div class="result-item"><div class="ri-label">Irrigation Frequency</div><div class="ri-value">Every ${baseInterval} day${baseInterval>1?'s':''}</div></div>
        <div class="result-item"><div class="ri-label">Water Per Plant</div><div class="ri-value">${baseQty} L/plant</div></div>
        <div class="result-item"><div class="ri-label">Best Time</div><div class="ri-value">Early Morning</div></div>
        <div class="result-item"><div class="ri-label">Method</div><div class="ri-value">${soil==='Sandy'?'Drip Irrigation':crop==='Rice'?'Flood Irrigation':'Furrow/Drip'}</div></div>
        <div class="result-item"><div class="ri-label">Weekly Water</div><div class="ri-value">${Math.round(7/baseInterval*baseQty)} L/plant</div></div>
        <div class="result-item"><div class="ri-label">Savings vs Traditional</div><div class="ri-value">~${20+Math.floor(Math.random()*20)}%</div></div>
      </div>`;

    const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const calEl=document.getElementById('irrigCal');
    calEl.innerHTML='';
    days.forEach((d,i)=>{
      const isWater=(i+1)%baseInterval===1||(baseInterval===1);
      calEl.innerHTML+=`<div class="cal-day ${isWater?'water':'rest'}">
        <div class="cal-day-name">${d}</div>
        <div class="cal-day-icon">${isWater?'💧':'☀️'}</div>
        <div class="cal-day-label">${isWater?'Irrigate':'Rest'}</div>
      </div>`;
    });

    document.getElementById('irrigTips').innerHTML=`
      <h3 style="font-size:0.95rem;color:var(--text-mid);margin:20px 0 12px">💡 Smart Tips</h3>
      <div class="tip-item"><div class="tip-icon">⏰</div><div class="tip-text">Water between 6–9 AM to reduce evaporation by up to 40%.</div></div>
      <div class="tip-item"><div class="tip-icon">🌡️</div><div class="tip-text">${temp>35?'High temperature detected — increase watering frequency during heatwaves.':'Temperature is moderate — maintain current schedule unless rainfall occurs.'}</div></div>
      <div class="tip-item"><div class="tip-icon">🌧️</div><div class="tip-text">${rain>30?'Recent rainfall is sufficient — skip irrigation on rain days to prevent waterlogging.':'Low rainfall — do not miss scheduled irrigation cycles.'}</div></div>
      <div class="tip-item"><div class="tip-icon">🪱</div><div class="tip-text">Check soil moisture at 6-inch depth before each irrigation to avoid overwatering.</div></div>`;

    document.getElementById('irrigResult').classList.add('show');
    appState.irrigResult={crop,soil,stage,baseInterval,baseQty,temp,rain,humid};
  },1000);
}
// ====================== AI CHATBOT ======================
const aiResponses = {
  'rice':['Rice needs waterlogged conditions, especially in the first 30 days. Maintain 5cm standing water during tillering. Use IR-64 or Swarna varieties for high yield. Apply 120:60:60 kg/ha NPK.','For rice cultivation, ensure puddled field, transplant at 21-day seedling stage. Maintain 2-3 cm water depth. Harvest when 80% grains are straw-colored.'],
  'wheat':['Wheat grows best between 10–25°C. Sow in October–November for best results. Apply 120:60:40 NPK. Irrigate at Crown Root Initiation (CRI) stage, 21 days after sowing.','Use HD-2967 or WH-147 varieties for northern India. Apply first irrigation at 21 DAS, second at 45 DAS. Beware of rust disease — apply Propiconazole at first sign.'],
  'soil':['Soil health is foundational. Test pH (ideal 6–7.5), organic matter (>1.5%), and NPK levels. Apply lime to correct acidity or sulfur for alkalinity. Organic matter can be improved with compost and green manure.','Different soils need different management: Black soil retains water well but can crack — avoid over-tilling. Sandy soil needs frequent but light irrigation. Alluvial soil is the most fertile for most crops.'],
  'fertilizer':['Apply fertilizers in split doses: 50% at sowing, 25% at 30 DAS, 25% at 60 DAS. This reduces losses from leaching and volatilization by 30–40%. Always combine chemical fertilizers with organic amendments.','Deficiency symptoms: N-deficiency shows yellowing from older leaves; P-deficiency shows purplish coloration; K-deficiency shows leaf tip burning. Test soil every 3 years for accurate recommendations.'],
  'irrigation':['Drip irrigation saves 40–60% water vs flood irrigation and increases yield by 15–20%. Best for vegetables and orchards. Sprinkler irrigation suits wheat and groundnut on undulating land.','Best irrigation time is early morning (6–9 AM) to minimize evaporation. Check soil moisture at 6-inch depth — it should feel moist like a squeezed sponge, not wet. Avoid evening irrigation to prevent fungal diseases.'],
  'disease':['Integrated Pest Management (IPM) combines cultural, biological, and chemical methods. First resort to resistant varieties, crop rotation, and bio-control agents like Trichoderma and Pseudomonas. Use chemical pesticides only when threshold is exceeded.','Common early warning signs: wilting during cool weather (Fusarium wilt), water-soaked spots (bacterial diseases), white powdery coating (Powdery Mildew). Inspect crops twice weekly for early detection.'],
  'weather':['Indian monsoon (June–September) brings 70–80% of annual rainfall. Northeast monsoon (October–December) is crucial for Tamil Nadu. La Niña years typically bring above-normal rainfall, El Niño brings drought risk.','Weather-based crop advisories: avoid spraying pesticides in windy conditions, irrigate more during heat waves (>38°C), protect crops from frost in winter (below 5°C). Monitor IMD forecasts regularly.'],
  'market':['Best time to sell: avoid immediate post-harvest when prices are lowest. Store for 2–3 months if possible. Tomato and onion prices peak in summer. Rice and wheat have MSP as price floor.','Use e-NAM (National Agriculture Market) platform to sell across mandis online. Check AGMARKNET for real-time mandi prices. Farmers Producer Organizations (FPOs) get better prices through collective bargaining.'],
  'default':['Great question! As a farming assistant, I recommend consulting your local KVK (Krishi Vigyan Kendra) for region-specific advice. They offer free soil testing and variety recommendations. You can also call the Kisan Call Centre: 1800-180-1551.','I\'d suggest connecting with your local agriculture department for certified seeds, subsidized inputs, and training programs. Digital tools like mKisan app and Kisan Suvidha offer real-time support too.']
};

function sendChat() {
  const input=document.getElementById('chatInput');
  const msg=input.value.trim(); if(!msg) return;
  addChatMsg(msg,'user'); input.value='';
  const typing=addChatMsg('⌛ Thinking...','bot typing');
  setTimeout(()=>{
    typing.remove();
    let key='default';
    const lc=msg.toLowerCase();
    for(const k of ['rice','wheat','soil','fertilizer','irrigation','disease','weather','market']){
      if(lc.includes(k)){key=k;break;}
    }
    const responses=aiResponses[key];
    addChatMsg(responses[Math.floor(Math.random()*responses.length)],'bot');
  },1000+Math.random()*800);
}

function quickChat(msg){
  document.getElementById('chatInput').value=msg; sendChat();
}

function addChatMsg(text,type){
  const el=document.createElement('div');
  el.className='msg '+type; el.textContent=text;
  const container=document.getElementById('chatMessages');
  container.appendChild(el); container.scrollTop=container.scrollHeight;
  return el;
} 



// ====================== WEATHER ======================
const weatherData=[
  {icon:'☀️',cond:'Sunny',temp:34,rain:0},
  {icon:'⛅',cond:'Partly Cloudy',temp:31,rain:10},
  {icon:'🌥️',cond:'Cloudy',temp:28,rain:30},
  {icon:'🌧️',cond:'Light Rain',temp:26,rain:70},
  {icon:'⛈️',cond:'Thunderstorm',temp:24,rain:90},
  {icon:'🌤️',cond:'Mostly Sunny',temp:33,rain:5},
  {icon:'☀️',cond:'Clear',temp:35,rain:0},
];

function initForecast(){
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const fg=document.getElementById('forecastGrid'); if(!fg) return;
  fg.innerHTML=days.map((d,i)=>{
    const w=weatherData[i];
    return `<div class="forecast-day">
      <div class="fd-day">${d}</div>
      <div class="fd-icon">${w.icon}</div>
      <div class="fd-temp">${w.temp}°C</div>
      <div style="font-size:0.7rem;color:var(--sky-dark);margin-top:4px">💧${w.rain}%</div>
    </div>`;
  }).join('');
}

function getWeather(){
  const loc=document.getElementById('w-location').value||'Coimbatore';
  const btn=document.querySelector('#tab-weather .btn-primary');
  btn.innerHTML='<span class="spinner"></span>Fetching...'; btn.disabled=true;
  setTimeout(()=>{
    btn.innerHTML='🔍 Get Weather'; btn.disabled=false;
    document.querySelector('.weather-location').textContent='📍 '+loc+', India';
    initForecast();
  },800);
}

// ====================== MARKET ======================
const marketData=[
  {crop:'Rice',mandi:'Madurai APMC',state:'Tamil Nadu',min:2050,max:2200,modal:2150,trend:'up'},
  {crop:'Wheat',mandi:'Ludhiana Grain Market',state:'Punjab',min:2275,max:2325,modal:2300,trend:'stable'},
  {crop:'Tomato',mandi:'Kolar APMC',state:'Karnataka',min:800,max:1200,modal:1000,trend:'up'},
  {crop:'Onion',mandi:'Lasalgaon APMC',state:'Maharashtra',min:1200,max:1600,modal:1400,trend:'down'},
  {crop:'Potato',mandi:'Agra Mandi',state:'UP',min:900,max:1100,modal:1000,trend:'stable'},
  {crop:'Cotton',mandi:'Rajkot APMC',state:'Gujarat',min:6500,max:7000,modal:6800,trend:'up'},
  {crop:'Maize',mandi:'Bellary APMC',state:'Karnataka',min:1850,max:1950,modal:1900,trend:'stable'},
  {crop:'Sugarcane',mandi:'Pune APMC',state:'Maharashtra',min:3200,max:3500,modal:3350,trend:'up'},
  {crop:'Rice',mandi:'Thanjavur APMC',state:'Tamil Nadu',min:2100,max:2250,modal:2180,trend:'stable'},
  {crop:'Wheat',mandi:'Jaipur APMC',state:'Rajasthan',min:2280,max:2320,modal:2300,trend:'up'},
  {crop:'Tomato',mandi:'Nashik APMC',state:'Maharashtra',min:700,max:1100,modal:900,trend:'down'},
];

function filterMarket(){
  const c=document.getElementById('m-crop').value;
  const s=document.getElementById('m-state').value;
  renderMarket(marketData.filter(r=>(!c||r.crop===c)&&(!s||r.state===s)));
}

function renderMarket(data){
  document.getElementById('marketBody').innerHTML=data.map(r=>`<tr>
    <td><strong>${r.crop}</strong></td>
    <td>${r.mandi}</td>
    <td>${r.state}</td>
    <td>₹${r.min}</td>
    <td>₹${r.max}</td>
    <td><strong>₹${r.modal}</strong></td>
    <td class="${r.trend==='up'?'price-up':r.trend==='down'?'price-down':''}">${r.trend==='up'?'↑ Rising':r.trend==='down'?'↓ Falling':'→ Stable'}</td>
  </tr>`).join('');
}

// ====================== SCHEMES ======================
const schemes=[
  {tag:'Financial Support',name:'PM-KISAN Yojana',desc:'Direct income support of ₹6,000/year to small and marginal farmers in three equal installments.',eligibility:'All land-owning farmers with cultivable land up to 2 hectares.'},
  {tag:'Insurance',name:'PM Fasal Bima Yojana (PMFBY)',desc:'Crop insurance coverage for losses due to natural calamities, pests, and diseases at very low premium rates.',eligibility:'All farmers growing notified crops. Premium: 1.5–5% for farmers.'},
  {tag:'Credit',name:'Kisan Credit Card (KCC)',desc:'Short-term credit facility for crop cultivation expenses, post-harvest needs, and allied activities at subsidized interest rates.',eligibility:'All farmers including SHGs and JLGs engaged in agriculture.'},
  {tag:'Market Support',name:'e-NAM (National Agriculture Market)',desc:'Online trading platform linking 1,000+ mandis across India. Farmers get better prices through transparent auction mechanism.',eligibility:'All farmers with produce to sell. Free registration on enam.gov.in'},
  {tag:'Infrastructure',name:'RKVY (Rashtriya Krishi Vikas Yojana)',desc:'State-level grants for agricultural development projects including irrigation, storage, processing, and mechanization.',eligibility:'State governments & farmers organizations. Apply through state agriculture dept.'},
  {tag:'Soil Health',name:'Soil Health Card Scheme',desc:'Free soil testing and personalized fertilizer recommendations for every 2 hectares of farmland, every 2 years.',eligibility:'All farmers. Testing done by state agriculture departments at zero cost.'},
  {tag:'Drip Irrigation',name:'PM Krishi Sinchayee Yojana',desc:'50–80% subsidy on micro-irrigation systems (drip and sprinkler). Promotes water-use efficiency.',eligibility:'Individual farmers. Priority to small/marginal farmers. Apply at district agriculture office.'},
  {tag:'Tamil Nadu',name:'CM Farmer Welfare Fund',desc:'Tamil Nadu government scheme providing ₹2 lakh compensation and insurance coverage for farming families.',eligibility:'Registered farmers in Tamil Nadu with valid land records.'},
  {tag:'Organic Farming',name:'Paramparagat Krishi Vikas Yojana',desc:'₹50,000/hectare support over 3 years for converting to certified organic farming. Covers inputs + certification.',eligibility:'Farmer clusters (min 50 farmers) forming groups of 20+ hectares.'},
];

function initSchemes(){
  const el=document.getElementById('schemesGrid');
  if(!el||el.children.length) return;
  el.innerHTML=schemes.map(s=>`
    <div class="scheme-card">
      <div class="scheme-tag">${s.tag}</div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <div class="scheme-eligibility"><strong>✅ Eligibility:</strong> ${s.eligibility}</div>
    </div>`).join('');
}

// ====================== REPORT ======================
function generateReport(){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF();
  const pg=doc.internal.pageSize;
  let y=20;

  doc.setFillColor(122,171,107);
  doc.rect(0,0,pg.width,40,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(22);doc.setFont('helvetica','bold');
  doc.text('AgroSmart — Smart Crop Assistant Report',15,22);
  doc.setFontSize(10);doc.setFont('helvetica','normal');
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`,15,33);
  y=55;

  const addSection=(title,lines)=>{
    if(y>250){doc.addPage();y=20;}
    doc.setFillColor(232,244,229);
    doc.roundedRect(10,y-6,pg.width-20,10,2,2,'F');
    doc.setTextColor(45,52,38);doc.setFontSize(13);doc.setFont('helvetica','bold');
    doc.text(title,14,y+1);y+=14;
    doc.setFontSize(10);doc.setFont('helvetica','normal');doc.setTextColor(90,99,71);
    lines.forEach(l=>{if(y>270){doc.addPage();y=20;}doc.text(l,14,y);y+=7;});
    y+=6;
  };

  addSection('1. Crop Recommendation',
    appState.cropResult?[
      `Crop: ${appState.cropResult.crop}`,
      `Alternative: ${appState.cropResult.alt||'N/A'}`,
      `Reason: ${appState.cropResult.reason||'N/A'}`,
      `Soil: ${appState.cropResult.soil} | pH: ${appState.cropResult.ph} | Temp: ${appState.cropResult.temp}C`,
      `Soil NPK entered — N: ${appState.cropResult.n}, P: ${appState.cropResult.p}, K: ${appState.cropResult.k} kg/ha`,
    ]:['No crop recommendation generated yet.']);

  addSection('2. Fertilizer Plan',
    appState.fertResult?[
      `Crop: ${appState.fertResult.crop}`,
      `Required NPK: N=${appState.fertResult.rec.N}, P=${appState.fertResult.rec.P}, K=${appState.fertResult.rec.K} kg/ha`,
      `Current Soil NPK — N:${appState.fertResult.n}, P:${appState.fertResult.p}, K:${appState.fertResult.k} kg/ha`,
      `Deficit — N:${appState.fertResult.defN}, P:${appState.fertResult.defP}, K:${appState.fertResult.defK} kg/ha`,
      `Chemical: ${appState.fertResult.chemical}`,
      `Organic: ${appState.fertResult.organic}`,
    ]:['No fertilizer plan generated yet.']);

  addSection('3. Disease Detection',
    appState.diseaseResult?[
      `Disease: ${appState.diseaseResult.name}`,
      `Confidence: ${appState.diseaseResult.confidence}%`,
      `Pathogen: ${appState.diseaseResult.pathogen}`,
      `Treatment: ${appState.diseaseResult.treatment[0]}`,
      `Organic: ${appState.diseaseResult.organic}`,
    ]:['No disease detection performed yet.']);

  addSection('4. Irrigation Plan',
    appState.irrigResult?[
      `Crop: ${appState.irrigResult.crop} | Soil: ${appState.irrigResult.soil}`,
      `Stage: ${appState.irrigResult.stage}`,
      `Frequency: Every ${appState.irrigResult.baseInterval} day(s)`,
      `Water: ${appState.irrigResult.baseQty} L/plant per session`,
      `Best time: Early morning (6-9 AM)`,
    ]:['No irrigation plan generated yet.']);

  addSection('5. Weather Summary',[
    'Location: Your region (please update in Weather tab)',
    'Condition: Partly Cloudy | Temp: 32C | Humidity: 68%',
    'Advisory: Irrigate every 2-3 days; avoid midday pesticide spraying.',
  ]);

  addSection('6. Final Recommendations',[
    '- Get your soil tested at KVK before each season.',
    '- Use Kisan Credit Card for subsidized input financing.',
    '- Register on e-NAM for better market access.',
    '- Apply for PMFBY crop insurance before sowing.',
    '- Use drip irrigation where possible to save water.',
    '- AgroSmart Helpline: 1800-180-1551 (Kisan Call Centre)',
  ]);

  doc.save('AgroSmart_Report.pdf');
}

// ====================== LANGUAGE TOGGLE ======================
let isTamil=false;
function toggleLang(){
  isTamil=!isTamil;
  document.getElementById('langBtn').textContent=isTamil?'🌐 English':'🌐 தமிழ்';
  if(isTamil){
    document.querySelector('.hero-title em').textContent='AI நுண்ணறிவு';
    document.querySelector('.hero-badge').textContent='🌿 AI-சக்தியுள்ள விவசாயம்';
  } else {
    document.querySelector('.hero-title em').textContent='AI Intelligence';
    document.querySelector('.hero-badge').textContent='🌿 AI-Powered Smart Farming';
  }
}

// ====================== INIT ======================
window.addEventListener('load',()=>{
  renderMarket(marketData);
  initSchemes();
  initForecast();
  initCharts();
}); 

async function sendMessage() {
  const input = document.getElementById("inputBox").value;
  const output = document.getElementById("output");

  output.innerText = "Thinking...";

  const res = await fetch("http://127.0.0.1:5000/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: input })
  });

  const data = await res.json();
  output.innerText = data.reply;
}