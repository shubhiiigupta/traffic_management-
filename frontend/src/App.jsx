import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css';

const data = [
  { name: 'Mon', violations: 400 },
  { name: 'Tue', violations: 300 },
  { name: 'Wed', violations: 550 },
  { name: 'Thu', violations: 450 },
  { name: 'Fri', violations: 700 },
  { name: 'Sat', violations: 650 },
  { name: 'Sun', violations: 500 },
];

const pieData = [
  { name: 'With Helmet', value: 850 },
  { name: 'No Helmet', value: 350 },
];
const COLORS = ['#E74C3C', '#F1C40F', '#3498DB', '#16A085'];

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <div className="brand-icon">
        <span className="material-symbols-rounded" style={{color: 'white', fontSize: '20px'}}>shield</span>
      </div>
      <div className="brand-text">
        <h2>SafeRoads</h2>
        <p>Traffic Management</p>
      </div>
    </div>
    
    <ul className="nav-menu">
      <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
        <span className="material-symbols-rounded">dashboard</span>
        Dashboard
      </li>
      <li className={`nav-item ${activeTab === 'surveillance' ? 'active' : ''}`} onClick={() => setActiveTab('surveillance')}>
        <span className="material-symbols-rounded">videocam</span>
        Live Surveillance
      </li>
      <li className={`nav-item ${activeTab === 'violations' ? 'active' : ''}`} onClick={() => setActiveTab('violations')}>
        <span className="material-symbols-rounded">warning</span>
        Violations
      </li>
      <li className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
        <span className="material-symbols-rounded">bar_chart</span>
        Analytics
      </li>
      <li className="nav-item">
        <span className="material-symbols-rounded">settings</span>
        Settings
      </li>
    </ul>

    <div className="sidebar-footer">
      <div className="user-profile">
        <div className="avatar">A</div>
        <div className="user-info">
          <h4>Admin User</h4>
          <p>Traffic Control HQ</p>
        </div>
      </div>
    </div>
  </aside>
);

const LiveSurveillance = () => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchFrame = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/latest_frame');
        if (res.ok) {
          const data = await res.json();
          if (data.image) {
            setImage(data.image);
          }
        }
      } catch (err) {}
    };
    const interval = setInterval(fetchFrame, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '800px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h3>Live Camera Feed</h3>
          <span className="status-badge safe" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', background: '#2ECC71', borderRadius: '50%' }}></span> LIVE
          </span>
        </div>
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#E2E8F0', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {image ? (
            <img src={`data:image/jpeg;base64,${image}`} alt="Live Feed" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <p style={{ color: '#7F8C8D' }}>Waiting for camera feed...</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="header">
    <div className="page-title">
      <h1>Dashboard Overview</h1>
      <p>Real-time traffic safety monitoring system</p>
    </div>
    <div className="header-actions">
      <div className="search-bar">
        <span className="material-symbols-rounded">search</span>
        <input type="text" placeholder="Search vehicle or ID..." />
      </div>
      <button className="icon-btn">
        <span className="material-symbols-rounded">notifications</span>
        <span className="badge"></span>
      </button>
      <button className="icon-btn">
        <span className="material-symbols-rounded">more_vert</span>
      </button>
    </div>
  </header>
);

const StatCard = ({ title, value, icon, change, positive, color }) => (
  <div className="card stat-card" style={{'--card-accent': color}}>
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <div className="stat-icon">
        <span className="material-symbols-rounded">{icon}</span>
      </div>
    </div>
    <div className="stat-value">
      {value}
      <span className={`stat-change ${positive ? 'positive' : 'negative'}`}>
        <span className="material-symbols-rounded">{positive ? 'arrow_downward' : 'arrow_upward'}</span>
        {change}
      </span>
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [violations, setViolations] = useState([
    { id: 'CAM-01', type: 'No Helmet', time: 'Just now', loc: 'Intersection 4', status: 'alert', color: 'alert' },
    { id: 'CAM-04', type: 'With Helmet', time: '5 mins ago', loc: 'Main Street', status: 'safe', color: 'safe', label: 'Compliant' }
  ]);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/violations');
        if (response.ok) {
          const data = await response.json();
          if (data.violations && data.violations.length > 0) {
            // Keep exactly 2 items for the UI
            const latest = data.violations.slice(0, 2);
            // Pad with initial data if less than 2
            if (latest.length === 1) latest.push(violations[1]);
            setViolations(latest);
          }
        }
      } catch (error) {
        console.error('Error fetching live violations:', error);
      }
    };

    const interval = setInterval(fetchViolations, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <Header />
        
        {activeTab === 'surveillance' ? (
          <LiveSurveillance />
        ) : (
        
        <div className="dashboard-scroll">
          <div className="dashboard-grid">
            
            {/* Top Stats - Shown on Dashboard and Analytics */}
            {(activeTab === 'dashboard' || activeTab === 'analytics') && (
              <div className="stats-row">
                <StatCard 
                  title="Total Vehicles Today" 
                  value="12,450" 
                  icon="directions_car" 
                  change="12%" 
                  positive={false}
                  color="#3498DB"
                />
                <StatCard 
                  title="Active Violations" 
                  value="342" 
                  icon="gavel" 
                  change="5.4%" 
                  positive={true}
                  color="#E74C3C"
                />
                <StatCard 
                  title="No Helmet Detected" 
                  value="184" 
                  icon="sports_motorsports" 
                  change="2.1%" 
                  positive={false}
                  color="#F1C40F"
                />
                <StatCard 
                  title="System Status" 
                  value="100%" 
                  icon="check_circle" 
                  change="0%" 
                  positive={true}
                  color="#2ECC71"
                />
              </div>
            )}

            {/* Charts - Shown on Dashboard and Analytics */}
            {(activeTab === 'dashboard' || activeTab === 'analytics') && (
              <div className="charts-row">
                <div className="card">
                  <div className="section-header">
                    <h3>Weekly Violation Trends</h3>
                    <button className="btn-secondary">Export Data</button>
                  </div>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVio" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16A085" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#16A085" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#7F8C8D'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#7F8C8D'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="violations" stroke="#16A085" strokeWidth={3} fillOpacity={1} fill="url(#colorVio)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <div className="section-header">
                    <h3>Violation Breakdown</h3>
                  </div>
                  <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center'}}>
                    {pieData.map((entry, index) => (
                      <div key={entry.name} style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#7F8C8D'}}>
                        <div style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[index]}}></div>
                        {entry.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Live Feeds / List - Shown on Dashboard and Violations */}
            {(activeTab === 'dashboard' || activeTab === 'violations') && (
              <div className="feeds-row">
                <div className="card">
                  <div className="section-header">
                    <h3>Recent Violations</h3>
                    <button className="btn-secondary">View All</button>
                  </div>
                  <div className="feed-list">
                    {violations.map((feed, i) => (
                      <div className="feed-item" key={i}>
                        <div className="feed-img"></div>
                        <div className="feed-details">
                          <h4>{feed.type}</h4>
                          <p>
                            <span className="material-symbols-rounded">location_on</span> {feed.loc} &nbsp;•&nbsp; 
                            <span className="material-symbols-rounded">schedule</span> {feed.time} &nbsp;•&nbsp;
                            <span className="material-symbols-rounded">videocam</span> {feed.id}
                          </p>
                        </div>
                        <div className={`status-badge ${feed.color}`}>
                          {feed.label || (feed.type === 'No Helmet' ? 'Unpaid' : 'Compliant')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default App;
