// import { useState, useEffect } from 'react';
// import { useSearchParams, Link } from 'react-router-dom';
// import api from '../api/axios';
// import { useAuth } from '../context/AuthContext';

// const STATUSES = ['todo', 'in-progress', 'done'];
// const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

// export default function Tasks() {
//   const { user } = useAuth();
//   const [searchParams] = useSearchParams();
//   const projectId = searchParams.get('projectId');

//   const [tasks, setTasks] = useState([]);
//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const isAdmin = project && project.admin._id === user._id;
//   const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';

//   useEffect(() => {
//     if (!projectId) { setLoading(false); return; }
//     Promise.all([
//       api.get(`/projects/${projectId}`),
//       api.get(`/tasks?projectId=${projectId}`),
//     ])
//       .then(([pRes, tRes]) => { setProject(pRes.data); setTasks(tRes.data); })
//       .catch(() => setError('Failed to load tasks.'))
//       .finally(() => setLoading(false));
//   }, [projectId]);

//   const handleStatusChange = async (taskId, newStatus) => {
//     try {
//       const res = await api.patch(`/tasks/${taskId}`, { status: newStatus });
//       setTasks(tasks.map(t => t._id === taskId ? res.data : t));
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to update.');
//     }
//   };

//   const handleDelete = async (taskId) => {
//     if (!window.confirm('Delete this task?')) return;
//     try {
//       await api.delete(`/tasks/${taskId}`);
//       setTasks(tasks.filter(t => t._id !== taskId));
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to delete.');
//     }
//   };

//   if (loading) return <div className="loading">Loading tasks…</div>;
//   if (!projectId) return (
//     <div className="page">
//       <div className="empty-state">
//         <p>No project selected. <Link to="/projects">Go to Projects</Link></p>
//       </div>
//     </div>
//   );
//   if (error) return <div className="alert alert-error">{error}</div>;

//   return (
//     <div className="page">
//       <div className="page-header">
//         <div>
//           <h2>{project?.name} — Tasks</h2>
//           <p className="text-muted">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
//         </div>
//         <Link to={`/projects/${projectId}`} className="btn btn-primary">
//           ← Back to Project
//         </Link>
//       </div>

//       <div className="kanban-board">
//         {STATUSES.map(status => {
//           const col = tasks.filter(t => t.status === status);
//           return (
//             <div key={status} className={`kanban-column column-${status.replace('-', '')}`}>
//               <div className="column-header">
//                 <span className="column-title">{STATUS_LABELS[status]}</span>
//                 <span className="column-count">{col.length}</span>
//               </div>
//               <div className="task-cards">
//                 {col.length === 0 && <div className="kanban-empty">No tasks</div>}
//                 {col.map(task => (
//                   <div key={task._id} className={`task-card ${isOverdue(task) ? 'overdue' : ''}`}>
//                     <div className="task-card-header">
//                       <span className="task-card-title">{task.title}</span>
//                       <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
//                     </div>
//                     {task.description && <p className="task-card-desc">{task.description}</p>}
//                     <div className="task-card-meta">
//                       {task.assignee && (
//                         <span className="assignee">
//                           <span className="avatar-sm">{task.assignee.name.charAt(0)}</span>
//                           {task.assignee.name}
//                         </span>
//                       )}
//                       {task.dueDate && (
//                         <span className={`due-date ${isOverdue(task) ? 'overdue-text' : ''}`}>
//                           {isOverdue(task) ? '⚠ ' : ''}{new Date(task.dueDate).toLocaleDateString()}
//                         </span>
//                       )}
//                     </div>
//                     <div className="task-card-actions">
//                       <select
//                         value={task.status}
//                         onChange={e => handleStatusChange(task._id, e.target.value)}
//                         className="status-select"
//                       >
//                         {STATUSES.map(s => (
//                           <option key={s} value={s}>{STATUS_LABELS[s]}</option>
//                         ))}
//                       </select>
//                       {isAdmin && (
//                         <button className="btn-icon" onClick={() => handleDelete(task._id)}>✕</button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }