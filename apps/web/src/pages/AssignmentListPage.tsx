import { useAuth } from '../auth/AuthContext';
import { AssignmentCard } from '../components/AssignmentCard';
import { useAssignmentList } from '../hooks/useAssignmentList';

export function AssignmentListPage() {
  const { user } = useAuth();
  const { assignments, requestClearAndReload } = useAssignmentList(user);

  if (!user) {
    return null;
  }

  const authUser = user;

  return (
    <section className="page-section" aria-labelledby="assignment-list-heading">
      <h1 id="assignment-list-heading">課題一覧</h1>
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          onRequest={(assignmentId) =>
            requestClearAndReload(assignmentId, authUser)
          }
        />
      ))}
    </section>
  );
}
