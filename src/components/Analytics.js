import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Container, Spinner } from 'react-bootstrap';

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'page_stats'), orderBy('views', 'desc'));
        const snap = await getDocs(q);
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setData(rows);
      } catch (e) {
        console.error('Analytics load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <Container className="text-center py-5"><Spinner animation="border" variant="light" /></Container>;
  }

  const total = data.reduce((s, r) => s + (r.views || 0), 0);
  const totalNew = data.reduce((s, r) => s + (r.newUsers || 0), 0);
  const totalReturn = data.reduce((s, r) => s + (r.returningUsers || 0), 0);
  const maxViews = Math.max(...data.map(r => r.views || 0), 1);

  const allTz = {};
  data.forEach(row => {
    Object.keys(row).filter(k => k.startsWith('tz.')).forEach(k => {
      const tzName = k.replace('tz.', '');
      allTz[tzName] = (allTz[tzName] || 0) + row[k];
    });
  });
  const maxTz = Math.max(...Object.values(allTz), 1);

  const barStyle = (val, max, color) => ({
    height: '14px',
    width: `${(val / max) * 100}%`,
    minWidth: val > 0 ? '4px' : 0,
    background: color,
    borderRadius: '0 3px 3px 0',
    transition: 'width 0.4s ease',
  });

  return (
    <Container fluid className="p-3" style={{ fontSize: '12px', color: '#e2e8f0' }}>
      <h5 className="mb-3" style={{ fontWeight: 600 }}>Analytics</h5>

      {/* Summary cards */}
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <div className="p-2 rounded border flex-fill" style={{ minWidth: 100, background: '#1e293b', borderColor: '#334155' }}>
          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Total Views</div>
          <div style={{ color: '#22d3ee', fontSize: '18px', fontWeight: 700 }}>{total}</div>
        </div>
        <div className="p-2 rounded border flex-fill" style={{ minWidth: 100, background: '#1e293b', borderColor: '#334155' }}>
          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>New Users</div>
          <div style={{ color: '#4ade80', fontSize: '18px', fontWeight: 700 }}>{totalNew}</div>
        </div>
        <div className="p-2 rounded border flex-fill" style={{ minWidth: 100, background: '#1e293b', borderColor: '#334155' }}>
          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Returning Users</div>
          <div style={{ color: '#fb923c', fontSize: '18px', fontWeight: 700 }}>{totalReturn}</div>
        </div>
        <div className="p-2 rounded border flex-fill" style={{ minWidth: 100, background: '#1e293b', borderColor: '#334155' }}>
          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Pages Tracked</div>
          <div style={{ color: '#a78bfa', fontSize: '18px', fontWeight: 700 }}>{data.length}</div>
        </div>
      </div>

      <div className="d-flex gap-3" style={{ flexWrap: 'wrap' }}>
        {/* Views by page bar chart */}
        <div className="rounded border p-2 flex-fill" style={{ minWidth: 280, background: '#1e293b', borderColor: '#334155' }}>
          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>Views by Page</div>
          {data.map(row => (
            <div key={row.id} className="d-flex align-items-center mb-1" style={{ gap: '6px' }}>
              <div style={{ width: '24px', textAlign: 'right', color: '#94a3b8', fontSize: '11px', flexShrink: 0 }}>{row.views}</div>
              <div style={{ flex: 1, background: '#0f172a', borderRadius: '3px' }}>
                <div style={barStyle(row.views, maxViews, '#22d3ee')} />
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px', flexShrink: 1 }} title={row.path}>{row.path}</div>
            </div>
          ))}
        </div>

        {/* Timezone breakdown bar chart */}
        {Object.keys(allTz).length > 0 && (
          <div className="rounded border p-2 flex-fill" style={{ minWidth: 200, background: '#1e293b', borderColor: '#334155' }}>
            <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>By Timezone</div>
            {Object.entries(allTz).sort((a, b) => b[1] - a[1]).map(([tz, count]) => (
              <div key={tz} className="d-flex align-items-center mb-1" style={{ gap: '6px' }}>
                <div style={{ width: '20px', textAlign: 'right', color: '#94a3b8', fontSize: '11px', flexShrink: 0 }}>{count}</div>
                <div style={{ flex: 1, background: '#0f172a', borderRadius: '3px' }}>
                  <div style={barStyle(count, maxTz, '#a78bfa')} />
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px', flexShrink: 1 }}>{tz.split('/').pop()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full table */}
      <div className="overflow-auto mt-3" style={{ maxHeight: 'calc(100vh - 350px)' }}>
        <table className="table table-dark table-striped table-bordered table-sm" style={{ fontSize: '11px' }}>
          <thead>
            <tr>
              <th>Path</th>
              <th style={{ width: 50 }}>Views</th>
              <th style={{ width: 50 }}>New</th>
              <th style={{ width: 50 }}>Return</th>
              <th style={{ width: 90 }}>Last Viewed</th>
              <th style={{ width: 120 }}>Timezones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.path}</td>
                <td>{row.views}</td>
                <td>{row.newUsers}</td>
                <td>{row.returningUsers}</td>
                <td style={{ fontSize: '10px' }}>{row.lastViewed?.toDate?.()?.toLocaleString() || '-'}</td>
                <td>
                  {Object.keys(row).filter(k => k.startsWith('tz.')).map(k => (
                    <span key={k} className="badge bg-secondary me-1" style={{ fontSize: '9px' }}>
                      {k.replace('tz.', '').split('/').pop()}:{row[k]}
                    </span>
                  ))}
                  {!Object.keys(row).some(k => k.startsWith('tz.')) && <span style={{ color: '#64748b' }}>-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
