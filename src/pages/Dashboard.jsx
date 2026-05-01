import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const priorityColor = { low: 'low', medium: 'medium', high: 'high' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const { stats, tasksByUser, overdueTasks } = data;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Welcome back, {user.name.split(' ')[0]} 👋</h2>
          <p className="text-muted">Here's what's happening across your projects.</p>
        </div>
        <Link to="/projects" className="btn btn-primary">View Projects →</Link>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total tasks</span>
          <span className="stat-value">{stats.totalTasks}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">To Do</span>
          <span className="stat-value todo">{stats.byStatus.todo}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In Progress</span>
          <span className="stat-value inprogress">{stats.byStatus.inProgress}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Done</span>
          <span className="stat-value done">{stats.byStatus.done}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Overdue</span>
          <span className="stat-value overdue">{stats.overdue}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">My tasks</span>
          <span className="stat-value">{stats.myTasks}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Overdue tasks */}
        <div className="card">
          <h3>⚠ Overdue tasks</h3>
          {overdueTasks.length === 0 ? (
            <p className="text-muted empty">No overdue tasks. Great work!</p>
          ) : (
            <ul className="task-list">
              {overdueTasks.map((t) => (
                <li key={t._id} className="task-list-item">
                  <div>
                    <span className="task-title">{t.title}</span>
                    <span className={`priority-badge ${priorityColor[t.priority]}`}>{t.priority}</span>
                  </div>
                  <span className="task-meta">
                    Due {new Date(t.dueDate).toLocaleDateString()}
                    {t.project && ` · ${t.project.name}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tasks per user */}
        <div className="card">
          <h3>Tasks by member</h3>
          {tasksByUser.length === 0 ? (
            <p className="text-muted empty">No assigned tasks yet.</p>
          ) : (
            <ul className="user-task-list">
              {tasksByUser.sort((a, b) => b.count - a.count).map(({ user: u, count }) => (
                <li key={u._id} className="user-task-item">
                  <div className="avatar">{u.name.charAt(0).toUpperCase()}</div>
                  <span className="user-name">{u.name}</span>
                  <span className="task-count">{count} task{count !== 1 ? 's' : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}