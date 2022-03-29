export default function getStatusMap() {
  return {
    'Backlog': 'To Do',
    'Ready for Development': 'To Do',
    'Blocked': 'BLOCKED',
    'In Development': 'In Progress',
    'Code Review': 'PEER REVIEW',
    '.*QA.*': 'TESTING',
    '.*Merged.*': 'MERGED',
    '.*Shipped.*': 'SHIPPED',
    'Ready to Start': 'To Do',
    'To do': 'To Do',
    'In Progress': 'In Progress',
    'Peer Review': 'PEER REVIEW',
    'Testing': 'TESTING',
    'Done': 'Closed',
    '.*Design phase.*': 'In Progress',
  };
}
