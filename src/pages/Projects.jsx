import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data))
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Project name is required.');
    setCreating(true);
    try {
      const res = await api.post('/projects', form);
      setProjects([res.data, ...projects]);
      setForm({ name: '', description: '' });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="loading">Loading projects…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p className="text-muted">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New project'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card form-card">
          <h3>Create project</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Project name</label>
              <input
                type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Website redesign" required
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What is this project about?" rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating…' : 'Create project'}
            </button>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id} className="project-card">
              <div className="project-card-header">
                <h3>{p.name}</h3>
                {p.admin._id === user._id && <span className="badge badge-admin">Admin</span>}
              </div>
              <p className="project-desc">{p.description || 'No description.'}</p>
              <div className="project-meta">
                <span>👥 {p.members.length} member{p.members.length !== 1 ? 's' : ''}</span>
                <span className="text-muted">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}