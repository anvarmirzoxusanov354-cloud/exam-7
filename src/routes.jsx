
import { Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import GroupDetail from './pages/GroupDetail';
import AddStudentsToGroup from './pages/AddStudentsToGroup';
import CreateHomework from './pages/CreateHomework';
import HomeworkDetail from './pages/HomeworkDetail';
import ExamDetail from './pages/ExamDetail';
import ExamSubmission from './pages/ExamSubmission';
import AttendancePage from './pages/AttendancePage';
import Students from './pages/Students';
import Gifts from './pages/Gifts';
import Management from './pages/Management';

const routes = [
  {
    path: '/login',
    element: <PublicRoute />,
    children: [
      {
        path: '',
        element: <Login />,
      }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'teachers',
            element: <Teachers />,
          },
          {
            path: 'classes',
            element: <Classes />,
          },
          {
            path: 'classes/:id',
            element: <GroupDetail />,
          },
          {
            path: 'classes/:id/add-students',
            element: <AddStudentsToGroup />,
          },
          // ─── Uyga vazifa ───────────────────────────────────────────────
          // POST /api/v1/homework  →  yangi vazifa yaratish
          {
            path: 'classes/:id/homework/create',
            element: <CreateHomework />,
          },
          // GET /api/v1/homework/{groupId}  →  vazifa detali (natijalar ro'yxati)
          // GET /api/v1/group/{groupId}/homework/{homeworkId}/results?status=...
          {
            path: 'classes/:id/homework/:homeworkId',
            element: <HomeworkDetail />,
          },
          // GET /api/v1/group/{groupId}/homework/{homeworkId}/result/{studentId}
          // POST /api/v1/group/{groupId}/homework/{homeworkId}/check
          {
            path: 'classes/:id/homework/:examId/result/:submissionId',
            element: <ExamSubmission />,
          },
          // ─── Imtihonlar ────────────────────────────────────────────────
          // GET /api/v1/group/{groupId}/homework/{homeworkId}/results?status=...
          {
            path: 'classes/:id/exam/:examId',
            element: <ExamDetail />,
          },
          // GET /api/v1/group/{groupId}/homework/{homeworkId}/result/{studentId}
          // POST /api/v1/group/{groupId}/homework/{homeworkId}/check
          {
            path: 'classes/:id/exam/:examId/submission/:submissionId',
            element: <ExamSubmission />,
          },
          // ─── Davomat ───────────────────────────────────────────────────
          // POST /api/v1/groups/{groupId}/lesson  +  POST /api/v1/attendance
          {
            path: 'classes/:id/attendance/:date',
            element: <AttendancePage />,
          },
          // ─── Talabalar, Sovg'alar, Boshqaruv ───────────────────────────
          {
            path: 'students',
            element: <Students />,
          },
          {
            path: 'gifts',
            element: <Gifts />,
          },
          {
            path: 'management',
            element: <Management />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default routes;
