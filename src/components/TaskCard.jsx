// const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
// const STATUSES = ['todo', 'in-progress', 'done'];

// export default function TaskCard({ task, isAdmin, onStatusChange, onDelete }) {
//   const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

//   return (
//     <div className={`task-card ${isOverdue ? 'overdue' : ''}`}>
//       <div className="task-card-header">
//         <span className="task-card-title">{task.title}</span>
//         <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
//       </div>
//       {task.description && <p className="task-card-desc">{task.description}</p>}
//       <div className="task-card-meta">
//         {task.assignee && (
//           <span className="assignee">
//             <span className="avatar-sm">{task.assignee.name.charAt(0)}</span>
//             {task.assignee.name}
//           </span>
//         )}
//         {task.dueDate && (
//           <span className={`due-date ${isOverdue ? 'overdue-text' : ''}`}>
//             {isOverdue ? '⚠ ' : ''}{new Date(task.dueDate).toLocaleDateString()}
//           </span>
//         )}
//       </div>
//       <div className="task-card-actions">
//         <select
//           value={task.status}
//           onChange={(e) => onStatusChange(task._id, e.target.value)}
//           className="status-select"
//         >
//           {STATUSES.map(s => (
//             <option key={s} value={s}>{STATUS_LABELS[s]}</option>
//           ))}
//         </select>
//         {isAdmin && (
//           <button className="btn-icon" onClick={() => onDelete(task._id)} title="Delete">✕</button>
//         )}
//       </div>
//     </div>
//   );
// }