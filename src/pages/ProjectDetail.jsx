import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['todo', 'in-progress', 'done'];
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const PRIORITIES = ['low', 'medium', 'high'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', assignee: '' });
  const [taskError, setTaskError] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Member management
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const isAdmin = project && project.admin._id === user._id;

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks?projectId=${id}`),
    ])
      .then(([pRes, tRes]) => {
        setProject(pRes.data);
        setTasks(tRes.data);
      })
      .catch(() => setError('Failed to load project.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    setCreatingTask(true);
    try {
      const res = await api.post('/tasks', { ...taskForm, project: id });
      setTasks([res.data, ...tasks]);
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', assignee: '' });
      setShowTaskForm(false);
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    setAddingMember(true);
    try {
      const res = await api.post(`/projects/${id}/members`, { email: memberEmail });
      setProject(res.data);
      setMemberEmail('');
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  if (loading) return <div className="loading">Loading project…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>{project.name}</h2>
          {project.description && <p className="text-muted">{project.description}</p>}
        </div>
        <div className="header-actions">
          {isAdmin && (
            <>
              <button className="btn btn-primary" onClick={() => setShowTaskForm(!showTaskForm)}>
                {showTaskForm ? 'Cancel' : '+ Add task'}
              </button>
              <button className="btn btn-danger" onClick={handleDeleteProject}>Delete project</button>
            </>
          )}
        </div>
      </div>

      {/* Task creation form (Admin only) */}
      {isAdmin && showTaskForm && (
        <div className="card form-card">
          <h3>New task</h3>
          {taskError && <div className="alert alert-error">{taskError}</div>}
          <form onSubmit={handleCreateTask}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text" value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Task title" required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Assignee</label>
                <select value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due date</label>
                <input
                  type="date" value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Optional details…" rows={2}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creatingTask}>
              {creatingTask ? 'Creating…' : 'Create task'}
            </button>
          </form>
        </div>
      )}

      {/* Kanban board */}
      <div className="kanban-board">
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className={`kanban-column column-${status.replace('-', '')}`}>
              <div className="column-header">
                <span className="column-title">{STATUS_LABELS[status]}</span>
                <span className="column-count">{columnTasks.length}</span>
              </div>
              <div className="task-cards">
                {columnTasks.length === 0 && (
                  <div className="kanban-empty">No tasks</div>
                )}
                {columnTasks.map((task) => (
                  <div key={task._id} className={`task-card ${isOverdue(task) ? 'overdue' : ''}`}>
                    <div className="task-card-header">
                      <span className="task-card-title">{task.title}</span>
                      <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                    </div>
                    {task.description && <p className="task-card-desc">{task.description}</p>}
                    <div className="task-card-meta">
                      {task.assignee && (
                        <span className="assignee">
                          <span className="avatar-sm">{task.assignee.name.charAt(0)}</span>
                          {task.assignee.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className={`due-date ${isOverdue(task) ? 'overdue-text' : ''}`}>
                          {isOverdue(task) ? '⚠ ' : ''}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="task-card-actions">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="status-select"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      {isAdmin && (
                        <button className="btn-icon" onClick={() => handleDeleteTask(task._id)} title="Delete">✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Members panel (Admin only) */}
      {isAdmin && (
        <div className="card members-card">
          <h3>Team members</h3>
          {memberError && <div className="alert alert-error">{memberError}</div>}
          <form onSubmit={handleAddMember} className="member-form">
            <input
              type="email" value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Add by email address"
            />
            <button type="submit" className="btn btn-primary" disabled={addingMember}>
              {addingMember ? 'Adding…' : 'Add'}
            </button>
          </form>
          <ul className="member-list">
            {project.members.map((m) => (
              <li key={m._id} className="member-item">
                <div className="avatar">{m.name.charAt(0).toUpperCase()}</div>
                <div>
                  <span className="member-name">{m.name}</span>
                  <span className="member-email">{m.email}</span>
                </div>
                <div className="member-actions">
                  {m._id === project.admin._id
                    ? <span className="badge badge-admin">Admin</span>
                    : <button className="btn-text btn-remove" onClick={() => handleRemoveMember(m._id)}>Remove</button>
                  }
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}