import { supabase } from '../../../database';

export class DocumentHierarchyService {
  /**
   * Builds a 4-level hierarchical summary tree:
   * Faculty -> Course -> Semester -> Document Type counts.
   */
  async getHierarchyTree() {
    const [{ data: faculties }, { data: courses }, { data: docs }] =
      await Promise.all([
        supabase.from('faculties').select('id, code, name').order('code'),
        supabase
          .from('courses')
          .select('id, code, name, faculty_id, credits')
          .order('code'),
        supabase
          .from('documents')
          .select('id, faculty_id, course_id, semester, doc_type')
          .eq('status', 'PUBLISHED'),
      ]);

    const docRows = docs || [];
    const courseList = (courses || []).map((course) => {
      const courseDocs = docRows.filter((d) => d.course_id === course.id);
      const semesters = Array.from(
        new Set(courseDocs.map((d) => d.semester))
      ).sort((a, b) => b.localeCompare(a));

      return {
        ...course,
        documentCount: courseDocs.length,
        semesters,
      };
    });

    return (faculties || []).map((fac) => ({
      ...fac,
      courses: courseList.filter((c) => c.faculty_id === fac.id),
    }));
  }
}

export const documentHierarchyService = new DocumentHierarchyService();
