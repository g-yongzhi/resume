// ====== LUNAR CALENDAR (fixed — offset adjusted to base date 1900-01-31) ======
var lunarInfo=[0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06aa0,0x1a6c4,0x0aae0,0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,0x0d520];
var STEMS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
var BRANCHES=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
var LUNAR_MONTHS=["","正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","冬月","腊月"];
var LUNAR_DAYS=["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];
var LUNAR_FESTIVALS={"1,1":"春节","1,15":"元宵节","5,5":"端午节","7,7":"七夕","7,15":"中元节","8,15":"中秋节","9,9":"重阳节","12,30":"除夕"};

function leapYear(y){return(y%4===0&&y%100!==0)||(y%400===0)}
function leapMonth(y){var v=lunarInfo[y-1900]&0xf;return v===0xf?0:v}
function leapDays(y){if(leapMonth(y))return(lunarInfo[y-1900]&0x10000)?30:29;return 0}
function monthDays(y,m){return(lunarInfo[y-1900]&(0x10000>>m))?30:29}
function lunarYearDays(y){var i,sum=348;for(i=0x8000;i>0x8;i>>=1)sum+=(lunarInfo[y-1900]&i)?1:0;return sum+leapDays(y)}

function solarToLunar(y,m,d){
    var offset=0,i;
    // step 1: days from 1900-01-01 to target date
    for(i=1900;i<y;i++)offset+=leapYear(i)?366:365;
    var SD=[0,31,59,90,120,151,181,212,243,273,304,334];
    offset+=SD[m]+d-1;
    if(m>1&&leapYear(y))offset++;
    // FIX: lunar calendar epoch is 1900-01-31, not 1900-01-01
    offset-=30;
    // step 2: subtract full lunar years
    for(i=1900;i<2101&&offset>0;i++)offset-=lunarYearDays(i);
    if(offset<0){offset+=lunarYearDays(--i);}
    // step 3: walk through months of the found lunar year
    var ly=i,lm=1,ld=1,lp=leapMonth(ly),il=false;
    for(var month=1;month<13&&offset>=0;month++){
        var dm=monthDays(ly,month);
        if(lp===month&&!il){
            if(offset>=dm){offset-=dm;il=true;month--;continue}
            else{ld+=offset;offset=-1;break}
        }
        if(offset>=dm){offset-=dm;}
        else{ld+=offset;offset=-1;break}
        if(!il&&lp===month)continue;
        lm++;il=false;
    }
    return{year:ly,month:lm,day:ld,isLeap:il};
}

function formatLunarDate(lu){
    if(lu.month===1&&lu.day===1)return STEMS[(lu.year-4)%10]+BRANCHES[(lu.year-4)%12];
    var s="";if(lu.isLeap)s+="闰";s+=LUNAR_MONTHS[lu.month]+LUNAR_DAYS[lu.day];return s;
}

function getLunarFestival(y,m,d){
    var lu=solarToLunar(y,m,d);
    var k=lu.month+","+lu.day;
    if(LUNAR_FESTIVALS[k])return LUNAR_FESTIVALS[k];
    var next=new Date(y,m,d+1);
    var nextLu=solarToLunar(next.getFullYear(),next.getMonth(),next.getDate());
    if(nextLu.month===1&&nextLu.day===1)return"除夕";
    return null;
}

function lunarToSolar(luMonth,luDay,targetYear,isLeap){
    var start=new Date(targetYear-1,11,15);
    for(var i=0;i<420;i++){
        var dt=new Date(start.getTime()+i*86400000);
        var lu=solarToLunar(dt.getFullYear(),dt.getMonth(),dt.getDate());
        if(dt.getFullYear()===targetYear&&lu.month===luMonth&&lu.day===luDay&&!!lu.isLeap===!!isLeap)return{month:dt.getMonth(),day:dt.getDate()};
    }
    return null;
}

// ====== SOLAR TERMS (24节气) — using verified astronomical algorithm ======
var sTermInfo=[0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];
var SOLAR_TERM_NAMES=["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"];

function getSolarTermDate(y,n){
    var offDate=new Date((31556925974.7*(y-1900)+sTermInfo[n]*60000)+Date.UTC(1900,0,6,2,5));
    return{month:offDate.getUTCMonth(),day:offDate.getUTCDate()};
}

function getSolarTermMap(year){
    var map={};
    for(var i=0;i<24;i++){
        var st=getSolarTermDate(year,i);
        map[st.month+'-'+st.day]=SOLAR_TERM_NAMES[i];
    }
    return map;
}
// ====== ICONS & HOLIDAY SYSTEM ======
const ICONS={WORK:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',REST:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/></svg>',HOLIDAY:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="22" x2="4" y2="11"/><path d="M4 11V3h16v8c0 3-2 5-4 7l-4 3-4-3c-2-2-4-4-4-7z"/></svg>',BIRTHDAY:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',MEMORIAL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'};

	function getMothersDay(y){const d=new Date(y,4,1);const dow=d.getDay();return 8+(dow===0?7:14-dow);}

	// Holiday ranges: only statutory public holidays with actual days off (China)
	// {m:JS-month, d:day, endM, endD, name} — all days in range get HOLIDAY highlighting
	// Only the first day shows the label
	function getHolidayRanges(y){
	    var ranges=[];
	    // 元旦: Jan 1
	    ranges.push({m:0,d:1,endM:0,endD:1,name:'元旦'});
	    // 清明节: Apr 5
	    ranges.push({m:3,d:5,endM:3,endD:5,name:'清明节'});
	    // 劳动节: May 1-5
	    ranges.push({m:4,d:1,endM:4,endD:5,name:'劳动节'});
	    // 国庆节: Oct 1-7
	    ranges.push({m:9,d:1,endM:9,endD:7,name:'国庆节'});

	    // 春节: from 除夕 to 初六 (7 days)
	    var chuXi=lunarToSolar(12,30,y,false)||lunarToSolar(12,29,y,false);
	    if(chuXi){
	        var sfEnd=new Date(y,chuXi.month,chuXi.day+6);
	        ranges.push({m:chuXi.month,d:chuXi.day,endM:sfEnd.getMonth(),endD:sfEnd.getDate(),name:'春节'});
	    }
	    // 端午节: lunar 5/5
	    var db=lunarToSolar(5,5,y,false);
	    if(db) ranges.push({m:db.month,d:db.day,endM:db.month,endD:db.day,name:'端午节'});
	    // 中秋节: lunar 8/15
	    var ma=lunarToSolar(8,15,y,false);
	    if(ma) ranges.push({m:ma.month,d:ma.day,endM:ma.month,endD:ma.day,name:'中秋节'});

	    return ranges;
	}

	// Check if a date is the FIRST day of a holiday range (label only on day 1)
	function getHolidayLabel(year,month,day,ranges){
	    for(var i=0;i<ranges.length;i++){
	        var r=ranges[i];
	        if(r.m===month&&r.d===day) return r.name;
	    }
	    return null;
	}

	// Check if a date falls anywhere within a holiday range (highlight entire range)
	function isInHoliday(year,month,day,ranges){
	    var cur=new Date(year,month,day);
	    for(var i=0;i<ranges.length;i++){
	        var r=ranges[i];
	        if(cur>=new Date(year,r.m,r.d)&&cur<=new Date(year,r.endM,r.endD)) return true;
	    }
	    return false;
	}
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL=['January','February','March','April','May','June','July','August','September','October','November','December'];

// ====== STATE ======
const today=new Date();
let year=today.getFullYear(),month=today.getMonth();
let DB={};try{DB=JSON.parse(localStorage.getItem('CAL_DB_V3'))||{};}catch(e){DB={};console.warn('DB migration failed, starting fresh');}
let EVENTS=[];try{EVENTS=JSON.parse(localStorage.getItem('CAL_EVENTS'))||[];}catch(e){EVENTS=[];}
let SETTINGS={restDays:[0,6]};try{SETTINGS=JSON.parse(localStorage.getItem('CAL_SETTINGS'))||{restDays:[0,6]};}catch(e){SETTINGS={restDays:[0,6]};}
let activeDay=null;

const grid=document.getElementById('grid');
const editPopover=document.getElementById('edit-popover');
const settingsPanel=document.getElementById('settings-panel');
const eventEditor=document.getElementById('event-editor-panel');

function defaultStatus(y,m,d,hRanges){
    const dt=new Date(y,m,d);
    const dow=dt.getDay();
    if(hRanges&&isInHoliday(y,m,d,hRanges))return'HOLIDAY';
    if(SETTINGS.restDays.includes(dow))return'REST';
    return'WORK';
}

// ====== BUILD EVENT MAP ======
function buildEventMap(y,m){
    const map={};
    for(const ev of EVENTS){
        try{
            const em=parseInt(ev.month), ed=parseInt(ev.day);
            if(ev.calendar==='lunar'){
                const solar=lunarToSolar(em,ed,y,ev.isLeap||false);
                if(solar&&solar.month===m){
                    const d=solar.day;
                    if(!map[d])map[d]=[];
                    map[d].push(ev);
                }
            }else{
                if(em-1===m){
                    if(!map[ed])map[ed]=[];
                    map[ed].push(ev);
                }
            }
        }catch(e){console.error('buildEventMap error',e,ev)}
    }
    return map;
}

// ====== RENDER ======
function render(){
    var hRanges=getHolidayRanges(year), stMap=getSolarTermMap(year);
    const data=[];
    const fd=new Date(year,month,1),dim=new Date(year,month+1,0).getDate();
    let sd=fd.getDay();sd=sd===0?6:sd-1;
    const pmd=new Date(year,month,0).getDate();
    for(let i=sd-1;i>=0;i--)data.push({day:pmd-i,cur:false});
    for(let d=1;d<=dim;d++){
        const dt=new Date(year,month,d);
        const isT=dt.toDateString()===today.toDateString();
        var solarTerm=stMap[month+'-'+d]||null;
        var holidayLabel=getHolidayLabel(year,month,d,hRanges);
        data.push({day:d,cur:true,status:defaultStatus(year,month,d,hRanges),isToday:isT,solarTerm:solarTerm,holidayLabel:holidayLabel});
    }
    const rem=35-data.length;
    for(let d=1;d<=rem;d++)data.push({day:d,cur:false});

    grid.innerHTML='';
    const bdayMap=buildEventMap(year,month);
    const isCur=year===today.getFullYear()&&month===today.getMonth();
    let elapsed=0;
    if(year<today.getFullYear()||(year===today.getFullYear()&&month<today.getMonth()))elapsed=new Date(year,month+1,0).getDate();
    else if(isCur)elapsed=today.getDate();

    data.forEach(item=>{
        const cell=document.createElement('div');cell.className='day-cell';
        if(!item.cur){cell.classList.add('is-muted');cell.innerHTML='<span class="cell-num">'+item.day+'</span>';grid.appendChild(cell);return;}
        const key=year+'_'+month+'_'+item.day;
        const state=DB[key]||{status:item.status,memo:''};
        const evts=bdayMap[item.day]||[];
        cell.classList.add('status-'+state.status.toLowerCase());
        if(item.isToday)cell.classList.add('is-today');
        if(DB[key])cell.classList.add('is-edited');
        if(evts.length)cell.classList.add('is-birthday');
        if(activeDay&&activeDay.year===year&&activeDay.month===month&&activeDay.day===item.day)cell.classList.add('is-selected');

        // Sub-text priority: event > memo > holiday label (1st day only) > lunar festival > solar term > lunar date
        let subText='',icon=ICONS[state.status]||'';
        if(evts.length){
            icon=evts[0].name.toLowerCase().includes('birthday')?ICONS.BIRTHDAY:ICONS.MEMORIAL;
            subText=evts.map(function(e){return e.name;}).join('·');cell.classList.add('is-memorial');
        }else if(state.memo&&state.memo.trim()){
            icon=ICONS.MEMORIAL;subText=state.memo;cell.classList.add('is-memorial');
        }else if(item.holidayLabel){
            icon=ICONS.HOLIDAY;subText=item.holidayLabel;
        }else{
            const lu=solarToLunar(year,month,item.day);
            var fest=getLunarFestival(year,month,item.day);
            if(fest){icon=ICONS.MEMORIAL;subText=fest;cell.classList.add('is-memorial');}
            else if(item.solarTerm){subText=item.solarTerm;}
            else{subText=formatLunarDate(lu);}
        }
        cell.innerHTML='<span class="cell-num">'+String(item.day).padStart(2,'0')+'</span><span class="cell-icon">'+icon+'</span><span class="cell-sub">'+subText+'</span>';
        cell.addEventListener('click',()=>{if(activeDay&&activeDay.year===year&&activeDay.month===month&&activeDay.day===item.day){hideEditPopover();activeDay=null;document.querySelectorAll('.day-cell.is-selected').forEach(c=>c.classList.remove('is-selected'));return}
            document.querySelectorAll('.day-cell.is-selected').forEach(c=>c.classList.remove('is-selected'));
            cell.classList.add('is-selected');activeDay={year,month,day:item.day};
            hideSettings();hideEventEditor();showEditPopover(cell,state);
        });
        grid.appendChild(cell);
    });
    document.getElementById('elapsed-count').innerText=elapsed;
    const todayLu=solarToLunar(today.getFullYear(),today.getMonth(),today.getDate());
	    document.getElementById('lunar-today').innerText='农历 '+formatLunarDate(todayLu);
	    document.getElementById('brand-month').textContent=MONTHS[month];
    document.getElementById('brand-year').textContent=year;
    const now=new Date(),ys=new Date(now.getFullYear(),0,1),ye=new Date(now.getFullYear()+1,0,1);
    const pct=Math.round(((now-ys)/(ye-ys))*100);
    document.getElementById('progress-label').innerText=pct+'% OF THE YEAR';
    document.getElementById('progress-fill').style.width=pct+'%';
    renderEventsList();
}

let _deletePendingId=null;
	function renderEventsList(){
    const list=document.getElementById('events-list');
    if(!EVENTS.length){list.innerHTML='<span style="font-size:10px; color:#bbb; font-style:italic;">No events yet</span>';return}
    const now=new Date();const thisYear=now.getFullYear();
    list.innerHTML=EVENTS.map(ev=>{
        const em=parseInt(ev.month,10),ed=parseInt(ev.day,10),ey=parseInt(ev.year,10)||thisYear;
        const yrs=thisYear-ey;
        const dateStr=ev.calendar==='lunar'
            ?LUNAR_MONTHS[em]+LUNAR_DAYS[ed]
            :MONTHS_FULL[em-1]+' '+ed;
        return'<div class="event-row" style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid rgba(0,0,0,0.03);">'+
            '<div data-detail="'+ev.id+'" style="cursor:pointer; flex:1;"><span style="font-weight:500;">'+ev.name+'</span><br><span style="font-size:9px; color:#7A8471;">'+dateStr+' &middot; '+yrs+'yr</span></div>'+
            '<span style="font-size:9px; color:#ccc; cursor:pointer; padding:2px 4px;" data-del="'+ev.id+'" title="Delete">&times;</span></div>';
    }).join('');
    // Edit handlers
	    list.querySelectorAll('[data-detail]').forEach(el=>{
	        el.addEventListener('click',e=>{
	            e.stopPropagation();
	            const id=parseInt(el.dataset.detail,10);
	            const ev=EVENTS.find(e=>e.id===id);
            if(ev) showEventDetail(ev);
	        });
	    });
	    // Delete handlers
    list.querySelectorAll('[data-del]').forEach(el=>{
        el.addEventListener('click',e=>{
            e.stopPropagation();
            if(!confirm('Delete this event?'))return;
	            const id=parseInt(el.dataset.del,10);
            EVENTS=EVENTS.filter(ev=>ev.id!==id);
            save();toast('Event removed');
        });
    });
}

function editExistingEvent(id){
	    const ev=EVENTS.find(e=>e.id===id);if(!ev)return;
	    hideEditPopover();hideSettings();
	    document.getElementById('btn-save-event').dataset.editId=id;
	    document.getElementById('event-name-input').value=ev.name||'';
	    document.getElementById('event-year-input').value=ev.year||'';
	    document.getElementById('event-note-input').value=ev.note||'';
	    var typeRadio=document.querySelector('input[name="ev-type"][value="'+(ev.type||'anniversary')+'"]');
	    if(typeRadio)typeRadio.checked=true;
	    document.querySelector('input[name="cal-type"][value="'+ev.calendar+'"]').checked=true;
	    const isSolar=ev.calendar==='solar';
	    document.getElementById('solar-date-pick').style.display=isSolar?'block':'none';
	    document.getElementById('lunar-date-pick').style.display=isSolar?'none':'block';
	    if(isSolar){
	        populateMonths('solar-month');document.getElementById('solar-month').value=ev.month;
	        updateSolarDays();document.getElementById('solar-day').value=ev.day;
	    }else{
	        document.getElementById('event-lunar-month').value=ev.month;
	        updateLunarDays();document.getElementById('event-lunar-day').value=ev.day;
	    }
	    showEventEditor(true);
	}

	// ====== EDIT POPOVER ======
function showEditPopover(cell,state){
    const rect=cell.getBoundingClientRect();
    let left=rect.left+rect.width/2-105,top=rect.bottom+8;
    if(left<12)left=12;if(left+210>innerWidth-12)left=innerWidth-222;
    if(top+260>innerHeight-12)top=rect.top-268;if(top<12)top=12;
    editPopover.style.left=left+'px';editPopover.style.top=top+'px';editPopover.style.display='flex';
    document.querySelectorAll('#edit-popover input[name="status"]').forEach(r=>{r.checked=(r.value===state.status)});
    document.getElementById('memo-input').value=state.memo||'';
    document.querySelectorAll('#edit-popover .quick-chip').forEach(c=>c.classList.toggle('filled',c.dataset.text===state.memo));
}
function hideEditPopover(){editPopover.style.display='none';}

// ====== EVENT EDITOR ======
function showEventEditor(skipReset){
    hideEditPopover();
    const sidebar=document.querySelector('.sidebar');
    const rect=sidebar.getBoundingClientRect();
    let left=rect.right+12,top=rect.top+rect.height*0.4;
    if(left+220>innerWidth-12)left=innerWidth-232;
    if(top+340>innerHeight-12)top=innerHeight-352;
    eventEditor.style.left=left+'px';eventEditor.style.top=top+'px';eventEditor.style.display='flex';
	    if(skipReset)return;
    document.getElementById('event-name-input').value='';
    document.getElementById('event-year-input').value='';
    document.querySelector('input[name="cal-type"][value="solar"]').checked=true;
    document.getElementById('solar-date-pick').style.display='block';
    document.getElementById('lunar-date-pick').style.display='none';
    populateDays('solar-day',31);
    populateMonths('solar-month');
    document.getElementById('solar-month').value=today.getMonth()+1;
    document.getElementById('solar-day').value=today.getDate();
}
function hideEventEditor(){eventEditor.style.display='none';}
function populateMonths(id){
    const sel=document.getElementById(id);sel.innerHTML='';
    MONTHS_FULL.forEach((m,i)=>{const o=document.createElement('option');o.value=i+1;o.textContent=m;sel.appendChild(o)});
}
function populateDays(id,count){
    const sel=document.getElementById(id);sel.innerHTML='';
    for(let d=1;d<=count;d++){const o=document.createElement('option');o.value=d;o.textContent=d;sel.appendChild(o)}
}

function updateSolarDays(){
	    const m=parseInt(document.getElementById('solar-month').value);
	    const days=[31,28,29,31,30,31,30,31,31,30,31,30];
	    const v=parseInt(document.getElementById('solar-day').value);
	    populateDays('solar-day',days[m-1]||31);
	    if(v>days[m-1])document.getElementById('solar-day').value=days[m-1];
	}
	function updateLunarDays(){
	    const m=parseInt(document.getElementById('event-lunar-month').value);
	    const eyRaw=parseInt(document.getElementById('event-year-input').value);const ey=isNaN(eyRaw)?year:eyRaw;
	    const count=monthDays(ey,m);
	    const v=parseInt(document.getElementById('event-lunar-day').value);
	    populateDays('event-lunar-day',count);
	    if(v>count)document.getElementById('event-lunar-day').value=count;
	}

	// ====== SAVE ======
	function save(){
		    try{
		    localStorage.setItem('CAL_DB_V3',JSON.stringify(DB));
		    localStorage.setItem('CAL_EVENTS',JSON.stringify(EVENTS));
		    localStorage.setItem('CAL_SETTINGS',JSON.stringify(SETTINGS));}catch(e){console.warn('Save failed',e)}
		    const prevActive=activeDay?{year:activeDay.year,month:activeDay.month,day:activeDay.day}:null;
		    hideEditPopover();activeDay=null;
		    render();
		    if(prevActive){
		        setTimeout(()=>{
		            const cell=findCell(prevActive.day);
		            if(cell){
		                activeDay=prevActive;
		                const k=activeDay.year+'_'+activeDay.month+'_'+activeDay.day;
		                const state=DB[k]||{status:defaultStatus(activeDay.year,activeDay.month,activeDay.day),memo:''};
		                document.querySelectorAll('.day-cell.is-selected').forEach(c=>c.classList.remove('is-selected'));
		                cell.classList.add('is-selected');
		                showEditPopover(cell,state);
		            }
		        },50);
		    }
		}
		
	
function findCell(dayNum){
    const cells=document.querySelectorAll('.day-cell:not(.is-muted)');
    for(const c of cells){const n=c.querySelector('.cell-num');if(n&&parseInt(n.textContent)===dayNum)return c}
    return null;
}

// ====== EVENTS ======
editPopover.addEventListener('change',e=>{
    if(!activeDay)return;
    const k=activeDay.year+'_'+activeDay.month+'_'+activeDay.day;
    if(!DB[k])DB[k]={status:defaultStatus(activeDay.year,activeDay.month,activeDay.day),memo:''};
    if(e.target.name==='status'){DB[k].status=e.target.value;save()}
});

const memoInput=document.getElementById('memo-input');
memoInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();memoInput.blur()}});
memoInput.addEventListener('blur',()=>{
    if(!activeDay)return;
    const k=activeDay.year+'_'+activeDay.month+'_'+activeDay.day,val=memoInput.value.trim();
    if(val){if(!DB[k])DB[k]={status:defaultStatus(activeDay.year,activeDay.month,activeDay.day),memo:''};DB[k].memo=val}
    else if(DB[k]){delete DB[k].memo}
    save();
});

editPopover.addEventListener('click',e=>{
    const chip=e.target.closest('.quick-chip');
    if(chip&&activeDay){memoInput.value=chip.dataset.text;const k=activeDay.year+'_'+activeDay.month+'_'+activeDay.day;if(!DB[k])DB[k]={status:defaultStatus(activeDay.year,activeDay.month,activeDay.day),memo:''};DB[k].memo=chip.dataset.text;save()}
});

// Reset day to default
// Settings panel: Reset rest days to default (Sat+Sun)
	document.getElementById('btn-reset-day').addEventListener('click',()=>{
	    SETTINGS.restDays=[0,6];localStorage.setItem('CAL_SETTINGS',JSON.stringify(SETTINGS));
	    document.querySelectorAll('#settings-panel input[type=\"checkbox\"]').forEach(cb=>{cb.checked=SETTINGS.restDays.includes(parseInt(cb.value))});
	    save();toast('Rest days reset to Sat & Sun');
	});
	document.getElementById('popover-reset-day').addEventListener('click',()=>{
	    if(!activeDay)return;const k=activeDay.year+'_'+activeDay.month+'_'+activeDay.day;delete DB[k];hideEditPopover();save();toast('Day reset to default');
	});

	// Open event editor from sidebar
document.getElementById('btn-open-events').addEventListener('click',e=>{e.stopPropagation();showEventEditor()});
	// Export / Import
	document.getElementById('btn-export').addEventListener('click',()=>{
	    const data=JSON.stringify({DB,EVENTS,SETTINGS,version:3,exportedAt:new Date().toISOString()});
	    const blob=new Blob([data],{type:'application/json'});
	    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='chrono-journal-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();
	    toast('Data exported');
	});
	document.getElementById('btn-import').addEventListener('click',()=>{
	    const input=document.createElement('input');input.type='file';input.accept='.json';
	    input.addEventListener('change',()=>{
	        const file=input.files[0];if(!file)return;
	        const reader=new FileReader();
	        reader.onload=()=>{
	            try{
	                const data=JSON.parse(reader.result);
	                if(!data.DB||!data.EVENTS||!data.SETTINGS)throw new Error('Invalid format');
	                DB=data.DB;EVENTS=data.EVENTS;SETTINGS=data.SETTINGS;save();toast('Data imported');
	            }catch(e){toast('Invalid backup file');}
	        };
	        reader.readAsText(file);
	    });
	    input.click();
	});

// Calendar type toggle
	document.getElementById('solar-month').addEventListener('change',updateSolarDays);
	document.getElementById('event-lunar-month').addEventListener('change',updateLunarDays);
	document.getElementById('event-year-input').addEventListener('change',()=>{
	    if(document.querySelector('input[name="cal-type"]:checked').value==='lunar')updateLunarDays();
	});
eventEditor.addEventListener('change',e=>{
    if(e.target.name!=='cal-type')return;
    const isSolar=e.target.value==='solar';
    document.getElementById('solar-date-pick').style.display=isSolar?'block':'none';
    document.getElementById('lunar-date-pick').style.display=isSolar?'none':'block';
    if(isSolar)populateDays('solar-day',31);else updateLunarDays();
});

// Save event
document.getElementById('btn-save-event').addEventListener('click',()=>{
	    const editId=document.getElementById('btn-save-event').dataset.editId;
	    var oldImage=null;
	    if(editId){var oldEv=EVENTS.find(function(e){return e.id===parseInt(editId,10)});if(oldEv)oldImage=oldEv.image;EVENTS=EVENTS.filter(function(ev){return ev.id!==parseInt(editId,10)});delete document.getElementById('btn-save-event').dataset.editId;}
    const name=document.getElementById('event-name-input').value.trim();
    if(!name){toast('Enter a name');return}
    const calType=document.querySelector('input[name="cal-type"]:checked').value;
    const evYearRaw=parseInt(document.getElementById('event-year-input').value);const eventYear=isNaN(evYearRaw)?year:evYearRaw;
    let m,d;
    if(calType==='solar'){
        m=parseInt(document.getElementById('solar-month').value);
        d=parseInt(document.getElementById('solar-day').value);
    }else{
        m=parseInt(document.getElementById('event-lunar-month').value);
        d=parseInt(document.getElementById('event-lunar-day').value);
    }
    const evType=document.querySelector('input[name="ev-type"]:checked');
    const ev={id:Date.now(),name,calendar:calType,year:eventYear,month:m,day:d,type:evType?evType.value:'anniversary',note:document.getElementById('event-note-input').value.trim(),image:oldImage||undefined};
    EVENTS.push(ev);
    hideEventEditor();save();
    const label=calType==='lunar'?LUNAR_MONTHS[m]+LUNAR_DAYS[d]:MONTHS_FULL[m-1]+' '+d;
    toast('Added: '+name+' ('+label+')');
});
document.getElementById('btn-cancel-event').addEventListener('click',()=>{delete document.getElementById('btn-save-event').dataset.editId;hideEventEditor()});

// ====== SETTINGS ======
function showSettingsPanel(){
    hideEditPopover();hideEventEditor();
    const rect=document.getElementById('settings-trigger').getBoundingClientRect();
    let left=rect.left-170,top=rect.bottom+8;
    if(left<12)left=12;if(top+310>innerHeight-12)top=rect.top-318;if(top<12)top=12;
    settingsPanel.style.left=left+'px';settingsPanel.style.top=top+'px';settingsPanel.style.display='flex';
    document.querySelectorAll('#settings-panel input[type="checkbox"]').forEach(cb=>{cb.checked=SETTINGS.restDays.includes(parseInt(cb.value))});
}
function hideSettings(){settingsPanel.style.display='none';}
// Auto-apply: checkbox change → save + immediate re-render
settingsPanel.addEventListener('change',e=>{
    if(e.target.type!=='checkbox')return;
    const v=parseInt(e.target.value);
    if(e.target.checked){if(!SETTINGS.restDays.includes(v))SETTINGS.restDays.push(v)}
    else{SETTINGS.restDays=SETTINGS.restDays.filter(d=>d!==v)}
    localStorage.setItem('CAL_SETTINGS',JSON.stringify(SETTINGS));
    save();toast('Rest days updated');
});
// Close button inside settings panel
document.getElementById('settings-close').addEventListener('click',()=>hideSettings());

// ====== MONTH / YEAR PICKERS ======
const monthPickerPanel=document.getElementById('month-picker-panel');
const yearPickerPanel=document.getElementById('year-picker-panel');
let yearPageStart=Math.floor(year/20)*20;

function buildYearGrid(){
    const g=document.getElementById('year-picker-grid');g.innerHTML='';
    const end=yearPageStart+19;
    document.getElementById('year-range-label').textContent=yearPageStart+' – '+end;
    for(let y=yearPageStart;y<=end;y++){const d=document.createElement('div');d.className='year-picker-item';d.textContent=y;d.dataset.year=y;if(y===year)d.classList.add('active');g.appendChild(d)}
}

document.getElementById('brand-month').addEventListener('click',e=>{
    e.stopPropagation();hideEditPopover();hideSettings();hideEventEditor();
    const rect=e.target.getBoundingClientRect();
    let left=rect.left,top=rect.bottom+6;
    if(left+184>innerWidth-12)left=innerWidth-196;if(top+210>innerHeight-12)top=rect.top-218;
    monthPickerPanel.style.left=left+'px';monthPickerPanel.style.top=top+'px';monthPickerPanel.style.display='flex';
    document.querySelectorAll('.month-picker-item').forEach(item=>item.classList.toggle('active',parseInt(item.dataset.m)===month));
});
monthPickerPanel.addEventListener('click',e=>{
    const item=e.target.closest('.month-picker-item');if(!item)return;
    const m=parseInt(item.dataset.m);if(m===month){monthPickerPanel.style.display='none';return}
    month=m;activeDay=null;hideEditPopover();monthPickerPanel.style.display='none';save();
});

document.getElementById('brand-year').addEventListener('click',e=>{
    e.stopPropagation();hideEditPopover();hideSettings();hideEventEditor();
    yearPageStart=Math.floor(year/20)*20;buildYearGrid();
    const rect=e.target.getBoundingClientRect();
    let left=rect.left,top=rect.bottom+6;
    if(left+200>innerWidth-12)left=innerWidth-212;if(top+230>innerHeight-12)top=rect.top-238;
    yearPickerPanel.style.left=left+'px';yearPickerPanel.style.top=top+'px';yearPickerPanel.style.display='flex';
});
document.getElementById('year-decade-dec').addEventListener('click',()=>{yearPageStart=Math.max(1900,yearPageStart-20);buildYearGrid()});
document.getElementById('year-decade-inc').addEventListener('click',()=>{yearPageStart=Math.min(2080,yearPageStart+20);buildYearGrid()});
yearPickerPanel.addEventListener('click',e=>{
    const item=e.target.closest('.year-picker-item');if(!item)return;
    const y=parseInt(item.dataset.year);if(y===year){yearPickerPanel.style.display='none';return}
    year=y;activeDay=null;hideEditPopover();yearPickerPanel.style.display='none';save();
});

// ====== GLOBAL CLICKS ======
document.addEventListener('click',e=>{
    if(!editPopover.contains(e.target)&&!e.target.closest('.day-cell')){hideEditPopover();if(activeDay){activeDay=null;document.querySelectorAll('.day-cell.is-selected').forEach(c=>c.classList.remove('is-selected'))}}
    if(!settingsPanel.contains(e.target)&&e.target!==document.getElementById('settings-trigger')&&!document.getElementById('settings-trigger').contains(e.target))hideSettings();
    if(!monthPickerPanel.contains(e.target)&&e.target!==document.getElementById('brand-month'))monthPickerPanel.style.display='none';
    if(!yearPickerPanel.contains(e.target)&&e.target!==document.getElementById('brand-year'))yearPickerPanel.style.display='none';
    if(!eventEditor.contains(e.target)&&e.target!==document.getElementById('btn-open-events'))hideEventEditor();
});
document.getElementById('settings-trigger').addEventListener('click',e=>{e.stopPropagation();settingsPanel.style.display==='flex'?hideSettings():showSettingsPanel()});

// ====== NAVIGATION ======
function go(delta){activeDay=null;hideEditPopover();hideSettings();month+=delta;if(month<0){month=11;year--}if(month>11){month=0;year++}save()}
document.getElementById('btn-prev').addEventListener('click',()=>go(-1));
document.getElementById('btn-next').addEventListener('click',()=>go(1));
document.getElementById('btn-today').addEventListener('click',()=>{activeDay=null;hideEditPopover();hideSettings();year=today.getFullYear();month=today.getMonth();save()});

// ====== KEYBOARD ======
document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(document.getElementById('event-detail-overlay').style.display==='flex'){hideEventDetail();return}hideEditPopover();hideSettings();hideEventEditor();activeDay=null;document.querySelectorAll('.day-cell.is-selected').forEach(c=>c.classList.remove('is-selected'));return}
    if(!activeDay)return;let d=activeDay.day;const dim=new Date(year,month+1,0).getDate();
    if(e.key==='ArrowLeft')d--;else if(e.key==='ArrowRight')d++;else if(e.key==='ArrowUp')d-=7;else if(e.key==='ArrowDown')d+=7;else return;
    e.preventDefault();if(d<1){month--;if(month<0){month=11;year--}activeDay=null;save();setTimeout(()=>{const c=findCell(new Date(year,month+1,0).getDate());if(c)c.click()},60);return}if(d>dim){month++;if(month>11){month=0;year++}activeDay=null;save();setTimeout(()=>{const c=findCell(1);if(c)c.click()},60);return}const cell=findCell(d);if(cell)cell.click();
});

// ====== EVENT DETAIL PANEL (GSAP animated) ======
let _detailEv=null;

function calcEventStats(ev){
    const now=new Date(), thisYear=now.getFullYear();
    const ey=parseInt(ev.year)||thisYear;
    let targetM,targetD;
    if(ev.calendar==='lunar'){
        const s=lunarToSolar(parseInt(ev.month),parseInt(ev.day),thisYear,ev.isLeap||false);
        if(!s) return null;
        targetM=s.month; targetD=s.day;
    }else{
        targetM=parseInt(ev.month)-1; targetD=parseInt(ev.day);
    }
    const startDate=new Date(ey,targetM,targetD);
    const thisOccurrence=new Date(thisYear,targetM,targetD);
    const nextOccurrence=thisOccurrence<=now?new Date(thisYear+1,targetM,targetD):thisOccurrence;
    const daysSince=Math.floor((now-startDate)/(86400000));
    const daysUntil=Math.floor((nextOccurrence-now)/(86400000));
    const daysInYear=Math.floor((new Date(thisYear+1,targetM,targetD)-thisOccurrence)/(86400000));
    const elapsedSinceLast=thisOccurrence<=now?Math.floor((now-thisOccurrence)/(86400000)):daysInYear-daysUntil;
    const pct=daysInYear>0?Math.round((elapsedSinceLast/daysInYear)*100):0;
    return{daysSince,daysUntil,daysInYear,elapsedSinceLast,pct,startDate,thisOccurrence,nextOccurrence};
}

function showEventDetail(ev){
    _detailEv=ev;
    var stats=calcEventStats(ev);
    var typeConf={
        anniversary:{icon:'💝',badge:'纪念日',badgeBg:'rgba(193,120,79,0.1)',badgeColor:'#C1784F',accent:'#C1784F'},
        birthday:{icon:'🎂',badge:'生日',badgeBg:'rgba(212,165,116,0.12)',badgeColor:'#D4A574',accent:'#D4A574'},
        memorial:{icon:'🕯️',badge:'纪念',badgeBg:'rgba(139,157,131,0.12)',badgeColor:'#8B9D83',accent:'#8B9D83'},
        custom:{icon:'📌',badge:'自定义',badgeBg:'rgba(122,132,113,0.1)',badgeColor:'#7A8471',accent:'#7A8471'}
    };
    var tc=typeConf[ev.type]||typeConf.custom;
    var em=parseInt(ev.month),ed=parseInt(ev.day),ey=parseInt(ev.year)||new Date().getFullYear();

    // Top: badge, icon, title, meta
    var badge=document.getElementById('capsule-badge');
    badge.textContent=tc.badge;badge.style.background=tc.badgeBg;badge.style.color=tc.badgeColor;
    document.getElementById('capsule-icon').textContent=tc.icon;
    document.getElementById('capsule-title').textContent=ev.name;
    var dateLabel=ev.calendar==='lunar'?LUNAR_MONTHS[em]+LUNAR_DAYS[ed]:MONTHS_FULL[em-1]+' '+ed;
    document.getElementById('capsule-meta').textContent=dateLabel+' · '+(ev.calendar==='lunar'?'农历':'公历');

    // Hero: "今天是第 X 天"
    var elapsed=stats?stats.daysSince:0;
    document.getElementById('hero-number').textContent=elapsed.toLocaleString();
    document.getElementById('hero-number').style.color=tc.accent;

    // Image
    var imgWrap=document.getElementById('capsule-image-wrap');
    var imgEl=document.getElementById('capsule-image');
    if(ev.image){
        imgEl.src=ev.image;imgWrap.style.display='block';
        document.getElementById('detail-btn-image').textContent='🖼 换图';
    }else{
        imgEl.src='';imgWrap.style.display='none';
        document.getElementById('detail-btn-image').textContent='🖼 照片';
    }

    // Message
    document.getElementById('msg-text').textContent=ev.note||'';
    document.getElementById('msg-edit').value=ev.note||'';
    document.getElementById('msg-edit').style.display='none';
    document.getElementById('msg-text').style.display='block';
    document.getElementById('detail-btn-note').textContent='✎ 留言';

    // Show with GSAP
    var overlay=document.getElementById('event-detail-overlay');
    var panel=document.getElementById('event-detail-panel');
    overlay.style.display='flex';
    try{
        gsap.fromTo(overlay,{opacity:0},{opacity:1,duration:0.3,ease:'power2.out'});
        gsap.fromTo(panel,{y:28,opacity:0,scale:0.94},{y:0,opacity:1,scale:1,duration:0.55,ease:'back.out(1.6)'});
        var sel='.capsule-badge,.capsule-icon,.capsule-title,.capsule-meta,.capsule-hero,.capsule-message,.capsule-actions';
        gsap.fromTo(panel.querySelectorAll(sel),{y:14,opacity:0},{y:0,opacity:1,duration:0.3,stagger:0.035,delay:0.3,ease:'power2.out'});
    }catch(e){panel.style.opacity='1';panel.style.transform='none';}
}

function hideEventDetail(){
    var overlay=document.getElementById('event-detail-overlay');
    var panel=document.getElementById('event-detail-panel');
    try{
        gsap.to(panel,{y:20,opacity:0,scale:0.95,duration:0.22,ease:'power2.in',onComplete:function(){
            overlay.style.display='none';_detailEv=null;
        }});
        gsap.to(overlay,{opacity:0,duration:0.22,ease:'power2.in'});
    }catch(e){overlay.style.display='none';_detailEv=null;}
}

// Detail panel button handlers (new IDs)
document.getElementById('detail-close').addEventListener('click',hideEventDetail);
document.getElementById('event-detail-overlay').addEventListener('click',function(e){if(e.target===e.currentTarget)hideEventDetail();});

document.getElementById('detail-btn-note').addEventListener('click',function(){
    var textEl=document.getElementById('msg-text');
    var editEl=document.getElementById('msg-edit');
    if(editEl.style.display==='none'){
        textEl.style.display='none';editEl.style.display='block';editEl.focus();
        document.getElementById('detail-btn-note').textContent='💾 保存';
    }else{
        var note=editEl.value.trim();
        if(_detailEv){_detailEv.note=note;EVENTS=EVENTS.map(function(e){return e.id===_detailEv.id?_detailEv:e;});save();}
        textEl.textContent=note;textEl.style.display='block';editEl.style.display='none';
        document.getElementById('detail-btn-note').textContent='✎ 留言';
        toast('留言已保存');
    }
});

document.getElementById('detail-btn-edit').addEventListener('click',function(){
    if(!_detailEv)return;
    hideEventDetail();
    setTimeout(function(){editExistingEvent(_detailEv.id);},250);
});

document.getElementById('detail-btn-delete').addEventListener('click',function(){
    if(!_detailEv)return;
    if(!confirm('确定删除 "'+_detailEv.name+'" 吗？'))return;
    EVENTS=EVENTS.filter(function(e){return e.id!==_detailEv.id;});
    hideEventDetail();
    save();toast('事件已删除');
});

// Image upload & resize
function resizeImage(file,callback){
    var reader=new FileReader();
    reader.onload=function(e){
        var img=new Image();
        img.onload=function(){
            var maxW=800,maxH=600;
            var w=img.width,h=img.height;
            if(w>maxW){h*=(maxW/w);w=maxW;}
            if(h>maxH){w*=(maxH/h);h=maxH;}
            var canvas=document.createElement('canvas');
            canvas.width=w;canvas.height=h;
            var ctx=canvas.getContext('2d');
            ctx.drawImage(img,0,0,w,h);
            callback(canvas.toDataURL('image/jpeg',0.7));
        };
        img.src=e.target.result;
    };
    reader.readAsDataURL(file);
}

document.getElementById('detail-btn-image').addEventListener('click',function(){
    if(!_detailEv)return;
    var input=document.getElementById('image-file-input');
    input.click();
    input.onchange=function(){
        var file=input.files[0];
        if(!file)return;
        if(file.size>10*1024*1024){toast('图片不能超过 10MB');return;}
        resizeImage(file,function(dataUrl){
            _detailEv.image=dataUrl;
            EVENTS=EVENTS.map(function(e){return e.id===_detailEv.id?_detailEv:e;});
            document.getElementById('capsule-image').src=dataUrl;
            document.getElementById('capsule-image-wrap').style.display='block';
            document.getElementById('detail-btn-image').textContent='🖼 换图';
            save();toast('照片已保存');
        });
        input.value='';
    };
});

document.getElementById('capsule-image-remove').addEventListener('click',function(e){
    e.stopPropagation();
    if(!_detailEv)return;
    delete _detailEv.image;
    EVENTS=EVENTS.map(function(e){return e.id===_detailEv.id?_detailEv:e;});
    document.getElementById('capsule-image-wrap').style.display='none';
    document.getElementById('capsule-image').src='';
    document.getElementById('detail-btn-image').textContent='🖼 照片';
    save();toast('照片已移除');
});

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._tid);t._tid=setTimeout(()=>t.classList.remove('show'),1800)}

render();
