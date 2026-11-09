export type TargetGradeGoal = 'A+' | 'A' | 'B+' | 'PASS';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type GroupMemberRole = 'LEAD' | 'MEMBER';
export type KanbanTaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface RecruitmentSlot {
  id: string;
  group_id: string;
  role_name: string;
  required_skills: string[];
  quantity_needed: number;
  quantity_filled: number;
}

export interface StudyGroupItem {
  id: string;
  course_id: number;
  semester: string;
  group_name: string;
  project_topic?: string | null;
  target_grade: TargetGradeGoal;
  max_members: number;
  is_recruiting: boolean;
  leader_id: string;
  created_at: string;
  course?: {
    id: number;
    code: string;
    name: string;
  };
  leader?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    karma_points?: number;
    is_verified_student?: boolean;
  };
  slots: RecruitmentSlot[];
  member_count: number;
  is_member: boolean;
  my_member_role?: GroupMemberRole | null;
  my_application_status?: ApplicationStatus | null;
}

export interface GroupMemberItem {
  group_id: string;
  user_id: string;
  member_role: GroupMemberRole;
  assigned_role: string;
  joined_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    karma_points?: number;
    is_verified_student?: boolean;
    academic_profile?: {
      student_id?: string;
      cohort?: string;
      major?: string;
      bio?: string;
    };
    skills?: Array<{
      id: string;
      skill_name: string;
      proficiency_level: string;
    }>;
  };
}

export interface GroupApplicationItem {
  id: string;
  group_id: string;
  slot_id: string;
  applicant_id: string;
  cover_letter: string;
  portfolio_url?: string | null;
  status: ApplicationStatus;
  created_at: string;
  reviewed_at?: string | null;
  slot?: RecruitmentSlot;
  applicant?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    karma_points?: number;
    is_verified_student?: boolean;
    academic_profile?: {
      student_id?: string;
      cohort?: string;
      major?: string;
      career_goal?: string;
    };
    skills?: Array<{
      id: string;
      skill_name: string;
      proficiency_level: string;
    }>;
  };
}

export interface KanbanTaskItem {
  id: string;
  group_id: string;
  title: string;
  description?: string | null;
  status: KanbanTaskStatus;
  assignee_id?: string | null;
  due_date?: string | null;
  position_order: number;
  created_at: string;
  assignee?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
}

export interface GroupDocumentItem {
  id: string;
  group_id: string;
  uploaded_by: string;
  title: string;
  file_url: string;
  file_size_bytes?: number | null;
  created_at: string;
  uploader?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
}

export interface GroupWorkspaceData {
  group: StudyGroupItem;
  myMembership: {
    group_id: string;
    user_id: string;
    member_role: GroupMemberRole;
    assigned_role: string;
  };
  members: GroupMemberItem[];
  slots: RecruitmentSlot[];
  tasks: KanbanTaskItem[];
  documents: GroupDocumentItem[];
  applications: GroupApplicationItem[];
  conversationId: string | null;
}
