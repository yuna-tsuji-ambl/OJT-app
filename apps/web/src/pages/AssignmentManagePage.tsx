import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AssignmentForm } from '../components/AssignmentForm';
import { AssignmentManageCard } from '../components/AssignmentManageCard';
import { ASSIGNMENT_CREATE_REGION_LABEL } from '../domain/assignmentFormFields';
import { useAssignmentManage } from '../hooks/useAssignmentManage';

export function AssignmentManagePage() {
  const { user } = useAuth();
  const {
    assignments,
    createAssignmentAndReload,
    updateAssignmentAndReload,
    deleteAssignmentAndReload,
  } = useAssignmentManage(user);

  if (!user) {
    return null;
  }

  if (user.role !== 'trainer') {
    return <Navigate to="/assignments" replace />;
  }

  const authUser = user;

  return (
    <section
      className="page-section"
      aria-labelledby="assignment-manage-heading"
    >
      <h1 id="assignment-manage-heading">課題管理</h1>
      <p>
        <Link to="/dashboard">ダッシュボードに戻る</Link>
      </p>
      <AssignmentForm
        regionLabel={ASSIGNMENT_CREATE_REGION_LABEL}
        onSubmit={(input) => createAssignmentAndReload(input, authUser)}
      />
      {assignments.map((assignment) => (
        <AssignmentManageCard
          key={assignment.id}
          assignment={assignment}
          onUpdate={(assignmentId, input) =>
            updateAssignmentAndReload(assignmentId, input, authUser)
          }
          onDelete={(assignmentId) =>
            deleteAssignmentAndReload(assignmentId, authUser)
          }
        />
      ))}
    </section>
  );
}
