import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { BookOpen, Users, Clock, Award } from 'lucide-react';

interface CourseProgress {
  course: {
    id: string;
    title: string;
    level: string;
    duration: number;
  };
  total_enrollments: number;
  avg_progress: number;
  completion_rate: number;
}

export default function CourseProgress() {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseProgress();
  }, []);

  async function fetchCourseProgress() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          level,
          duration,
          enrollments:course_enrollments(progress)
        `);

      if (error) throw error;

      const coursesWithProgress = data?.map(course => ({
        course: {
          id: course.id,
          title: course.title,
          level: course.level,
          duration: course.duration
        },
        total_enrollments: course.enrollments?.length || 0,
        avg_progress: course.enrollments?.reduce((acc, curr) => acc + curr.progress, 0) / 
          (course.enrollments?.length || 1),
        completion_rate: course.enrollments?.filter(e => e.progress === 100).length / 
          (course.enrollments?.length || 1) * 100
      })) || [];

      setCourses(coursesWithProgress);
    } catch (error) {
      console.error('Error fetching course progress:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Course Progress Overview</h2>
        
        <div className="space-y-4">
          {courses.map(({ course, total_enrollments, avg_progress, completion_rate }) => (
            <div
              key={course.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">{course.title}</h3>
                  <span className={`
                    inline-block mt-1 px-2 py-1 text-xs rounded-full
                    ${course.level === 'beginner' ? 'bg-green-100 text-green-800' : ''}
                    ${course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${course.level === 'advanced' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {course.level}
                  </span>
                </div>
                <BookOpen className="w-5 h-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{total_enrollments} enrolled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{course.duration} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span>{Math.round(completion_rate)}% completed</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  <span>Average Progress</span>
                  <span>{Math.round(avg_progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${avg_progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
