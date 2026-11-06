export type ClassItem = {
  id: string;
  timetable_id: string;
  course_code: string;
  course_title: string;
  venue: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  lecturer_name: string | null;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  course_code: string | null;
  due_at: string | null;
  priority: 'low' | 'normal' | 'high';
  is_completed: boolean;
};

export type Material = {
  id: string;
  uploader_id: string;
  course_code: string;
  course_title: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
  uploader: { username: string; full_name: string; avatar_url: string | null } | null;
};

export const starterClasses: ClassItem[] = [
  {
    id: 'cls-1',
    timetable_id: 'tt-1',
    course_code: 'CSC 301',
    course_title: 'Data Structures & Algorithms',
    venue: 'Faculty of Science LT 1',
    day_of_week: 1, // Monday
    start_time: '08:00',
    end_time: '10:00',
    lecturer_name: 'Dr. Adeyemi',
  },
  {
    id: 'cls-2',
    timetable_id: 'tt-1',
    course_code: 'MTH 311',
    course_title: 'Numerical Analysis & Complex Variables',
    venue: 'Maths Lecture Room 2',
    day_of_week: 1,
    start_time: '11:00',
    end_time: '13:00',
    lecturer_name: 'Prof. Okon',
  },
  {
    id: 'cls-3',
    timetable_id: 'tt-1',
    course_code: 'CSC 305',
    course_title: 'Operating Systems & Concurrency',
    venue: 'Hardware Lab 3',
    day_of_week: 2, // Tuesday
    start_time: '09:00',
    end_time: '11:00',
    lecturer_name: 'Engr. Danjuma',
  },
  {
    id: 'cls-4',
    timetable_id: 'tt-1',
    course_code: 'GST 301',
    course_title: 'Entrepreneurship & Innovation',
    venue: 'Main Campus Auditorium',
    day_of_week: 3, // Wednesday
    start_time: '10:00',
    end_time: '12:00',
    lecturer_name: 'Mrs. Bello',
  },
  {
    id: 'cls-5',
    timetable_id: 'tt-1',
    course_code: 'CSC 313',
    course_title: 'Software Engineering Methodologies',
    venue: 'Science Hall 4',
    day_of_week: 4, // Thursday
    start_time: '14:00',
    end_time: '16:00',
    lecturer_name: 'Dr. Chika',
  },
  {
    id: 'cls-6',
    timetable_id: 'tt-1',
    course_code: 'CSC 399',
    course_title: 'Student Seminar & Project Review',
    venue: 'Departmental Board Room',
    day_of_week: 5, // Friday
    start_time: '10:00',
    end_time: '12:00',
    lecturer_name: 'Dept Faculty Panel',
  },
];

export const starterTasks: Task[] = [
  {
    id: 'tsk-1',
    title: 'Submit CSC 301 Linked List Implementation in C++',
    description: 'Implement doubly linked list with edge-case tests for null pointers and reversing.',
    course_code: 'CSC 301',
    due_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    priority: 'high',
    is_completed: false,
  },
  {
    id: 'tsk-2',
    title: 'Review GST 301 Business Feasibility Model Slides',
    description: 'Summarize the 5-point executive summary format for Monday lecture presentation.',
    course_code: 'GST 301',
    due_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    priority: 'normal',
    is_completed: true,
  },
  {
    id: 'tsk-3',
    title: 'Solve Past 3 Years MTH 311 Numerical Integration Questions',
    description: 'Simpson 1/3 rule and Trapezoidal rule practice problems.',
    course_code: 'MTH 311',
    due_at: new Date(Date.now() + 86400000 * 6).toISOString(),
    priority: 'high',
    is_completed: false,
  },
  {
    id: 'tsk-4',
    title: 'Download and Print Week 7 Operating Systems Notes',
    description: 'Deadlock avoidance algorithms and Banker algorithm diagrams.',
    course_code: 'CSC 305',
    due_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    priority: 'low',
    is_completed: false,
  },
];

export const starterMaterials: Material[] = [
  {
    id: 'mat-1',
    uploader_id: 'user-tobi',
    course_code: 'CSC 301',
    course_title: 'Data Structures & Algorithms',
    title: 'Complete Exam Revision Handout & Past Solutions (2020-2025)',
    description: 'Comprehensive 42-page PDF covering Trees, Graphs, Sorting algorithms, and Big-O notation with solved exam questions.',
    file_url: '#',
    file_name: 'CSC301_Complete_Handout_2025.pdf',
    file_type: 'application/pdf',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    uploader: {
      username: 'tobi_dev',
      full_name: 'Tobi Adeleke',
      avatar_url: null,
    },
  },
  {
    id: 'mat-2',
    uploader_id: 'user-amina',
    course_code: 'GST 301',
    course_title: 'Entrepreneurship & Innovation',
    title: 'Business Plan Executive Template & Feasibility Guidelines',
    description: 'Official departmental approved template for term paper submission.',
    file_url: '#',
    file_name: 'GST301_Feasibility_Template.docx',
    file_type: 'application/docx',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    uploader: {
      username: 'amina_pharm',
      full_name: 'Amina Bello',
      avatar_url: null,
    },
  },
  {
    id: 'mat-3',
    uploader_id: 'user-emeka',
    course_code: 'MTH 311',
    course_title: 'Numerical Analysis',
    title: 'Worked Formula Sheet & Taylor Series Derivations',
    description: 'Compact formula cheat sheet formatted for quick reference before tests.',
    file_url: '#',
    file_name: 'MTH311_Formula_Sheet.pdf',
    file_type: 'application/pdf',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    uploader: {
      username: 'emeka_dev',
      full_name: 'Emeka Kalu',
      avatar_url: null,
    },
  },
];
