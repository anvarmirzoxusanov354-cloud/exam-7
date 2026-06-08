import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KeyboardArrowLeftOutlined, DeleteOutlined } from '@mui/icons-material';

const BASE   = 'https://najot-edu.softwareengineer.uz/api/v1';
const STATIC = 'https://najot-edu.softwareengineer.uz';

function imgUrl(p) {
  if (!p) return null;
  try {
    var s = String(p);
    if (s.startsWith('http')) return s;
    if (s.startsWith('/')) s = s.slice(1);
    
    if (s.startsWith('files/files/')) {
      return STATIC + '/' + s;
    }
    if (s.startsWith('files/')) {
      return STATIC + '/files/' + s;
    }
    return STATIC + '/files/files/' + s;
  } catch { return null; }
}

function fmt(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    if (isNaN(d)) return String(str);
    const M = ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'];
    return `${d.getDate()} ${M[d.getMonth()]}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  } catch { return String(str); }
}

function toList(d) {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (d.data && Array.isArray(d.data)) return d.data;
  if (d.results && Array.isArray(d.results)) return d.results;
  if (d.items && Array.isArray(d.items)) return d.items;
  if (d.homeworks && Array.isArray(d.homeworks)) return d.homeworks;
  if (d.answers && Array.isArray(d.answers)) return d.answers;
  
  if (typeof d === 'object') {
    // Check direct array fields
    const directArr = Object.values(d).find(v => Array.isArray(v));
    if (directArr) return directArr;
    
    // Check nested array fields inside .data
    if (d.data && typeof d.data === 'object') {
      const nestedArr = Object.values(d.data).find(v => Array.isArray(v));
      if (nestedArr) return nestedArr;
    }
  }
  return [];
}

// Swagger: GET /api/v1/group/{groupId}/homework/{homeworkId}/results?status=PENDING|REJECTED|ACCEPTED|CHECKED
const TABS = [
  { key: 'PENDING',  label: 'Kutayotganlar',     color: '#f59e0b', bg: '#fef9c3' },
  { key: 'REJECTED', label: 'Qaytarilganlar',    color: '#ef4444', bg: '#fee2e2' },
  { key: 'ACCEPTED', label: 'Qabul qilinganlar', color: '#16a34a', bg: '#dcfce7' },
  { key: 'CHECKED',  label: 'Bajarilmagan',      color: '#9ca3af', bg: '#f3f4f6' },
];

export default function HomeworkDetail() {
  const { id: gid, homeworkId: hwId } = useParams();
  const nav = useNavigate();

  const [hw,        setHw]        = useState(null);
  const [answers,   setAnswers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('PENDING');
  const [deleting,  setDeleting]  = useState(false);
  const [showDel,   setShowDel]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Bitta homework ma'lumotini olish
    // Avval to'g'ridan-to'g'ri GET /api/v1/homework/{hwId} orqali urinib ko'ramiz
    fetch(`${BASE}/homework/${hwId}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.id) {
          setHw(d.data || d);
        } else {
          // Fallback: guruh homeworklari ro'yxatidan qidiramiz
          return fetch(`${BASE}/homework/${gid}`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(d2 => {
              const list = toList(d2);
              const found = list.find(x => String(x.id) === String(hwId));
              if (found) setHw(found);
            });
        }
      })
      .catch(() => {
        // Fallback: guruh homeworklari ro'yxatidan qidiramiz
        fetch(`${BASE}/homework/${gid}`, { headers })
          .then(r => r.ok ? r.json() : null)
          .then(d2 => {
            const list = toList(d2);
            const found = list.find(x => String(x.id) === String(hwId));
            if (found) setHw(found);
          })
          .catch(() => {});
      });

    // 2. Homework natijalarini yuklash
    setLoading(true);
    // Avval hamma natijalarni bitta so'rovda olishga urinib ko'ramiz
    fetch(`${BASE}/group/${gid}/homework/${hwId}/results`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = toList(d);
        if (list && list.length > 0) {
          const mapped = list.map(x => ({
            ...x,
            status: (x.status || 'PENDING').toUpperCase()
          }));
          setAnswers(mapped);
          setLoading(false);
        } else {
          // Agar natija bo'lmasa, statuslar bo'yicha alohida chaqiramiz
          fetchByStatus();
        }
      })
      .catch(() => {
        fetchByStatus();
      });

    function fetchByStatus() {
      Promise.all(
        TABS.map(t =>
          fetch(`${BASE}/group/${gid}/homework/${hwId}/results?status=${t.key}`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(d => {
              const list = toList(d);
              return list.map(x => ({ ...x, _tab: t.key, status: x.status || t.key }));
            })
            .catch(() => [])
        )
      ).then(all => {
        setAnswers(all.flat());
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [gid, hwId]);

  // Swagger: DELETE /api/v1/homework/{id}
  const handleDelete = async () => {
    setDeleting(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${BASE}/homework/${hwId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        nav(`/classes/${gid}`);
      } else {
        alert("O'chirishda xatolik: " + res.status);
      }
    } catch {
      alert("Server bilan ulanishda xatolik!");
    } finally {
      setDeleting(false);
      setShowDel(false);
    }
  };

  const byTab = k => {
    return answers.filter(x => {
      const st = (x.status || x._tab || '').toUpperCase();
      if (k === 'CHECKED') {
        return st === 'CHECKED' || st === 'NOT_SUBMITTED' || st === 'MISSING' || st === '';
      }
      return st === k;
    });
  };
  const counts = Object.fromEntries(TABS.map(t => [t.key, byTab(t.key).length]));
  const list   = byTab(tab);
  const title  = hw?.title || hw?.name || hw?.topic || 'Uyga vazifa';
  const dl     = hw?.deadline || hw?.end_date || '';
  const lessonDate = hw?.lesson_date || hw?.lessonDate || hw?.date || '';
  const totalAnswered = answers.filter(x => {
    const st = (x.status || x._tab || '').toUpperCase();
    return st !== 'NOT_SUBMITTED' && st !== 'MISSING' && st !== '';
  }).length;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:10 }}>
      <svg style={{ width:20, height:20 }} viewBox="0 0 50 50">
        <style>{`@keyframes rtt{to{transform:rotate(360deg)}} .rtt{transform-origin:center;animation:rtt 0.9s linear infinite}`}</style>
        <circle className="rtt" cx="25" cy="25" r="20" fill="none" stroke="#7c4dff" strokeWidth="5" strokeDasharray="60 40"/>
      </svg>
      <span style={{ color:'#9ca3af', fontSize:13 }}>Yuklanmoqda...</span>
    </div>
  );

  return (
    <div style={{ paddingBottom:24 }}>

      {/* Delete confirmation modal */}
      {showDel && (
        <div style={{ position:'fixed', inset:0, zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)' }}>
          <div style={{ background:'white', borderRadius:16, padding:32, maxWidth:400, width:'100%', margin:16, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:40, textAlign:'center', marginBottom:12 }}>🗑️</div>
            <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:700, color:'#1a1a2e', textAlign:'center' }}>Uyga vazifani o'chirish</h3>
            <p style={{ margin:'0 0 24px', fontSize:13, color:'#6b7280', textAlign:'center' }}>
              <strong>"{title}"</strong> uyga vazifasini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setShowDel(false)} disabled={deleting}
                style={{ flex:1, padding:'10px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'white', color:'#374151', fontSize:13.5, fontWeight:600, cursor:'pointer' }}>
                Bekor qilish
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'#ef4444', color:'white', fontSize:13.5, fontWeight:600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sarlavha */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => nav(`/classes/${gid}`)}
            style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, border:'none', background:'transparent', cursor:'pointer', color:'#6b7280' }}>
            <KeyboardArrowLeftOutlined style={{ fontSize:22 }} />
          </button>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#1a1a2e' }}>{title}</h1>
        </div>
        {/* Swagger: DELETE /api/v1/homework/{id} */}
        <button onClick={() => setShowDel(true)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, border:'1.5px solid #fee2e2', background:'#fff5f5', color:'#ef4444', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <DeleteOutlined style={{ fontSize:16 }} />
          O'chirish
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {TABS.map(t => (
          <div key={t.key} onClick={() => setTab(t.key)}
            style={{ background:'white', borderRadius:12, padding:'16px 20px', boxShadow:'0 1px 8px rgba(0,0,0,0.06)', cursor:'pointer',
              borderBottom: tab === t.key ? `3px solid ${t.color}` : '3px solid transparent', transition:'all 0.2s' }}>
            <div style={{ fontSize:24, fontWeight:800, color: tab === t.key ? t.color : '#1a1a2e', marginBottom:4 }}>{counts[t.key] ?? 0}</div>
            <div style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Info card */}
      <div style={{ background:'white', borderRadius:12, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', padding:20, marginBottom:20 }}>
        <div style={{ display:'flex', gap:32, flexWrap:'wrap', alignItems:'center' }}>
          <div>
            <p style={{ margin:'0 0 4px', fontSize:12, color:'#9ca3af', fontWeight:500 }}>Mavzu</p>
            <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#1a1a2e' }}>{title}</p>
          </div>
          {lessonDate && (
            <div>
              <p style={{ margin:'0 0 4px', fontSize:12, color:'#9ca3af', fontWeight:500 }}>Dars sanasi</p>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#1a1a2e' }}>{fmt(lessonDate)}</p>
            </div>
          )}
          {dl && (
            <div>
              <p style={{ margin:'0 0 4px', fontSize:12, color:'#9ca3af', fontWeight:500 }}>Tugash vaqti</p>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color: new Date(dl) < new Date() ? '#ef4444' : '#1a1a2e' }}>{fmt(dl)}</p>
            </div>
          )}
          <div>
            <p style={{ margin:'0 0 4px', fontSize:12, color:'#9ca3af', fontWeight:500 }}>Topshirganlar</p>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#16a34a' }}>{totalAnswered} ta</p>
          </div>
        </div>
      </div>

      {/* Tabs + jadval */}
      <div style={{ background:'white', borderRadius:12, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        <div style={{ display:'flex', borderBottom:'1px solid #f1f1f5', overflowX:'auto' }}>
          {TABS.map(t => {
            const active = tab === t.key;
            const cnt    = counts[t.key] ?? 0;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 20px', background:'transparent',
                  border:'none', borderBottom: active ? `2.5px solid ${t.color}` : '2.5px solid transparent',
                  marginBottom:-1, cursor:'pointer', fontSize:13.5, fontWeight:600,
                  color: active ? t.color : '#6b7280', whiteSpace:'nowrap', flexShrink:0 }}>
                {t.label}
                <span style={{ minWidth:20, height:20, borderRadius:10, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:11, fontWeight:700, padding:'0 4px', background: active ? t.bg : '#f3f4f6', color: active ? t.color : '#9ca3af' }}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {list.length === 0 ? (
          <div style={{ padding:'56px 0', textAlign:'center', color:'#9ca3af', fontSize:13 }}>
            {tab === 'CHECKED' ? 'Hali hech kim uyga vazifa topshirmagan' : 'Ushbu statusdagi topshiriqlar yo\'q'}
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #f1f1f5', background:'#fafafa' }}>
                <th style={{ padding:'12px 24px', textAlign:'left', fontWeight:600, color:'#6b7280', fontSize:12 }}>O'quvchi ismi</th>
                <th style={{ padding:'12px 24px', textAlign:'left', fontWeight:600, color:'#6b7280', fontSize:12 }}>Topshirilgan vaqt</th>
                <th style={{ padding:'12px 24px', textAlign:'left', fontWeight:600, color:'#6b7280', fontSize:12 }}>Tekshirilgan vaqt</th>
                <th style={{ padding:'12px 24px', textAlign:'left', fontWeight:600, color:'#6b7280', fontSize:12 }}>Ball</th>
                <th style={{ padding:'12px 24px', textAlign:'left', fontWeight:600, color:'#6b7280', fontSize:12 }}>Status</th>
                <th style={{ padding:'12px 16px', width:40 }}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const nm    = r.student
                  ? (r.student.full_name || `${r.student.first_name||''} ${r.student.last_name||''}`.trim() || r.student.name || "Noma'lum")
                  : (r.student_name || r.name || "Noma'lum");
                const photo = r.student ? imgUrl(r.student.photo || r.student.avatar) : null;
                // Swagger: GET /api/v1/group/{groupId}/homework/{homeworkId}/result/{studentId}
                const navId = r.id || r.answer_id || r.homework_answer_id || r.student?.id || r.student_id;
                const sentAt = fmt(r.submitted_at || r.created_at || r.createdAt);
                const chkAt  = r.checked_at ? fmt(r.checked_at) : '—';
                const score  = r.grade ?? r.score ?? r.ball;
                const status = (r.status || r._tab || 'PENDING').toUpperCase();
                const tabInfo = TABS.find(t => t.key === status) || TABS[0];

                return (
                  <tr key={r.id || i} style={{ borderBottom:'1px solid #f5f5f7', cursor:'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background='#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background='white'}
                    onClick={() => { if (navId) nav(`/classes/${gid}/homework/${hwId}/result/${navId}`); }}>
                    <td style={{ padding:'14px 24px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'#ede9ff', display:'flex',
                          alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'#7c4dff', flexShrink:0, overflow:'hidden' }}>
                          {photo
                            ? <img src={photo} alt={nm} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';}} />
                            : nm.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color:'#3b7cf7', fontWeight:600 }}>{nm}</span>
                      </div>
                    </td>
                    <td style={{ padding:'14px 24px', color:'#4b5563', fontWeight:500 }}>{sentAt}</td>
                    <td style={{ padding:'14px 24px', color:'#4b5563', fontWeight:500 }}>{chkAt}</td>
                    <td style={{ padding:'14px 24px' }}>
                      {score != null
                        ? <span style={{ fontWeight:700, color: score >= 60 ? '#16a34a' : '#ef4444' }}>⚡ {score}</span>
                        : <span style={{ color:'#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ padding:'14px 24px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:6, fontSize:12, fontWeight:700, background: tabInfo.bg, color: tabInfo.color }}>
                        {tabInfo.label}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px', textAlign:'right', color:'#9ca3af', fontSize:16 }}>›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
