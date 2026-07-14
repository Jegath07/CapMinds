const STORE_KEY='capminds_appointments';
let appts=JSON.parse(localStorage.getItem(STORE_KEY)||'[]');
let viewDate=new Date();

function save(){localStorage.setItem(STORE_KEY,JSON.stringify(appts));}

function renderCalendar(){
  const y=viewDate.getFullYear(), m=viewDate.getMonth();
  document.getElementById('monthLabel').textContent=viewDate.toLocaleString('default',{month:'long',year:'numeric'});
  const grid=document.getElementById('calGrid');
  grid.innerHTML='';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>{
    const h=document.createElement('div'); h.className='head'; h.textContent=d; grid.appendChild(h);
  });
  const firstDay=new Date(y,m,1).getDay();
  const daysInMonth=new Date(y,m+1,0).getDate();
  const prevDays=new Date(y,m,0).getDate();
  const todayStr=new Date().toISOString().slice(0,10);
  const cells=[];
  for(let i=firstDay-1;i>=0;i--) cells.push({n:prevDays-i,other:true});
  for(let i=1;i<=daysInMonth;i++) cells.push({n:i,other:false});
  while(cells.length%7!==0) cells.push({n:cells.length,other:true});
  cells.forEach(c=>{
    const div=document.createElement('div');
    const dateStr=`${y}-${String(m+1).padStart(2,'0')}-${String(c.n).padStart(2,'0')}`;
    div.className='day'+(c.other?' other':'')+(!c.other&&dateStr===todayStr?' today':'');
    div.innerHTML=`<div class="num">${c.n}</div>`;
    if(!c.other){
      appts.filter(a=>a.date===dateStr).forEach(a=>{
        const chip=document.createElement('div');
        chip.className='appt-chip';
        chip.textContent=`${a.time} ${a.patient} - ${a.doctor}`;
        chip.onclick=()=>openModal(a.id);
        div.appendChild(chip);
      });
    }
    grid.appendChild(div);
  });
}

function renderTable(){
  const p=document.getElementById('searchPatient').value.toLowerCase();
  const d=document.getElementById('searchDoctor').value.toLowerCase();
  const from=document.getElementById('filterFrom').value;
  const to=document.getElementById('filterTo').value;
  const tbody=document.getElementById('apptTableBody');
  tbody.innerHTML='';
  appts.filter(a=>
    a.patient.toLowerCase().includes(p) &&
    a.doctor.toLowerCase().includes(d) &&
    (!from||a.date>=from) && (!to||a.date<=to)
  ).forEach(a=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${a.patient}</td><td>${a.doctor}</td><td>${a.hospital}</td><td>${a.specialty}</td><td>${a.date}</td><td>${a.time}</td>
    <td><button class="action-btn" onclick="openModal('${a.id}')">Edit</button><button class="action-btn del" onclick="deleteAppt('${a.id}')">Delete</button></td>`;
    tbody.appendChild(tr);
  });
}

function refreshAll(){renderCalendar();renderTable();}

function openModal(id){
  document.getElementById('overlay').classList.add('show');
  document.querySelectorAll('.err').forEach(e=>e.style.display='none');
  if(id){
    const a=appts.find(x=>x.id===id);
    document.getElementById('modalTitle').textContent='Edit Appointment';
    document.getElementById('f_id').value=a.id;
    document.getElementById('f_patient').value=a.patient;
    document.getElementById('f_doctor').value=a.doctor;
    document.getElementById('f_hospital').value=a.hospital;
    document.getElementById('f_specialty').value=a.specialty;
    document.getElementById('f_date').value=a.date;
    document.getElementById('f_time').value=a.time;
    document.getElementById('f_reason').value=a.reason||'';
  }else{
    document.getElementById('modalTitle').textContent='Schedule Appointment';
    ['f_id','f_patient','f_doctor','f_hospital','f_specialty','f_date','f_time','f_reason'].forEach(id=>document.getElementById(id).value='');
  }
}
function closeModal(){document.getElementById('overlay').classList.remove('show');}

function deleteAppt(id){
  if(confirm('Delete this appointment?')){
    appts=appts.filter(a=>a.id!==id);
    save(); refreshAll();
  }
}

function validate(){
  const fields=['f_patient','f_doctor','f_hospital','f_specialty','f_date','f_time'];
  let ok=true;
  fields.forEach(f=>{
    const el=document.getElementById(f);
    const errEl=el.parentElement.querySelector('.err');
    if(!el.value.trim()){ if(errEl)errEl.style.display='block'; ok=false;}
    else if(errEl) errEl.style.display='none';
  });
  return ok;
}

document.getElementById('saveBtn').onclick=()=>{
  if(!validate()) return;
  const id=document.getElementById('f_id').value;
  const data={
    id: id || Date.now().toString(),
    patient:document.getElementById('f_patient').value.trim(),
    doctor:document.getElementById('f_doctor').value.trim(),
    hospital:document.getElementById('f_hospital').value.trim(),
    specialty:document.getElementById('f_specialty').value.trim(),
    date:document.getElementById('f_date').value,
    time:document.getElementById('f_time').value,
    reason:document.getElementById('f_reason').value.trim()
  };
  if(id){ appts=appts.map(a=>a.id===id?data:a); }
  else{ appts.push(data); }
  save(); closeModal(); refreshAll();
};

document.getElementById('openModal').onclick=()=>openModal(null);
document.getElementById('cancelBtn').onclick=closeModal;
document.getElementById('overlay').onclick=e=>{if(e.target.id==='overlay')closeModal();};
document.getElementById('prevBtn').onclick=()=>{viewDate.setMonth(viewDate.getMonth()-1);renderCalendar();};
document.getElementById('nextBtn').onclick=()=>{viewDate.setMonth(viewDate.getMonth()+1);renderCalendar();};
document.getElementById('todayBtn').onclick=()=>{viewDate=new Date();renderCalendar();};
['searchPatient','searchDoctor','filterFrom','filterTo'].forEach(id=>{
  document.getElementById(id).addEventListener('input',renderTable);
});

refreshAll();
