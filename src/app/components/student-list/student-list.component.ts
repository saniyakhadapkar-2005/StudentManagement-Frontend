import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  form: FormGroup;
  editingId: number | null = null;
  loading = false;
  saving = false;
  seeding = false;
  errorMessage = '';
  successMessage = '';
  searchQuery = '';
  courseFilter = '';
  sortBy: 'name' | 'marks' | 'attendance' = 'name';

  readonly collegeName = 'Saniya College of Technology';
  readonly collegeAddress = 'SV Road, Malad West, Mumbai, Maharashtra 400064';
  readonly collegePhone = '+91 22 2889 4500';
  readonly collegeEmail = 'admissions@saniyacollege.edu.in';
  readonly collegePhoto = 'college-campus.jpg';
  readonly academicYear = '2025–2026';

  readonly courses = [
    'Computer Science',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Business Administration',
    'Data Science',
    'Civil Engineering',
    'Biotechnology'
  ];

  private readonly maladAddresses = [
    '12, SV Road, Malad West, Mumbai - 400064',
    '45, Link Road, Malad East, Mumbai - 400097',
    '8, Marve Road, Malad West, Mumbai - 400095',
    '22, Liberty Garden, Malad West, Mumbai - 400064',
    '67, Pushpa Park, Malad East, Mumbai - 400097',
    '3, Chincholi Bunder Road, Malad West, Mumbai - 400064',
    '19, Sunder Nagar, Malad East, Mumbai - 400097',
    '101, Evershine Nagar, Malad West, Mumbai - 400064'
  ];

  private readonly samplePool: Omit<Student, 'id'>[] = [
    { name: 'Aarav Sharma', age: 20, course: 'Computer Science', marks: 88.5, grade: 'A', attendance: 94, address: '12, SV Road, Malad West, Mumbai - 400064', email: 'aarav.sharma@student.edu', phone: '9876543210' },
    { name: 'Priya Nair', age: 19, course: 'Data Science', marks: 91.2, grade: 'A+', attendance: 97, address: '45, Link Road, Malad East, Mumbai - 400097', email: 'priya.nair@student.edu', phone: '9876543211' },
    { name: 'Rohan Mehta', age: 21, course: 'Mechanical Engineering', marks: 76.4, grade: 'B+', attendance: 86, address: '8, Marve Road, Malad West, Mumbai - 400095', email: 'rohan.mehta@student.edu', phone: '9876543212' },
    { name: 'Sneha Reddy', age: 20, course: 'Biotechnology', marks: 83.0, grade: 'A', attendance: 91, address: '22, Liberty Garden, Malad West, Mumbai - 400064', email: 'sneha.reddy@student.edu', phone: '9876543213' },
    { name: 'Kabir Khan', age: 22, course: 'Business Administration', marks: 72.8, grade: 'B', attendance: 78, address: '67, Pushpa Park, Malad East, Mumbai - 400097', email: 'kabir.khan@student.edu', phone: '9876543214' },
    { name: 'Ishita Patel', age: 19, course: 'Information Technology', marks: 89.6, grade: 'A', attendance: 95, address: '3, Chincholi Bunder Road, Malad West, Mumbai - 400064', email: 'ishita.patel@student.edu', phone: '9876543215' },
    { name: 'Vikram Singh', age: 21, course: 'Electronics Engineering', marks: 80.3, grade: 'B+', attendance: 88, address: '19, Sunder Nagar, Malad East, Mumbai - 400097', email: 'vikram.singh@student.edu', phone: '9876543216' },
    { name: 'Ananya Das', age: 20, course: 'Civil Engineering', marks: 85.7, grade: 'A', attendance: 92, address: '101, Evershine Nagar, Malad West, Mumbai - 400064', email: 'ananya.das@student.edu', phone: '9876543217' }
  ];

  constructor(
    private studentService: StudentService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      age: [null, [Validators.required, Validators.min(16), Validators.max(30)]],
      marks: [null, [Validators.min(0), Validators.max(100)]],
      grade: [''],
      attendance: [null, [Validators.min(0), Validators.max(100)]],
      course: [''],
      address: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  get totalStudents(): number {
    return this.students.length;
  }

  get filteredStudents(): Student[] {
    let result = [...this.students];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        (s.course?.toLowerCase().includes(q)) ||
        (s.address?.toLowerCase().includes(q)) ||
        (s.email?.toLowerCase().includes(q))
      );
    }

    if (this.courseFilter) {
      result = result.filter((s) => s.course === this.courseFilter);
    }

    result.sort((a, b) => {
      if (this.sortBy === 'marks') return (b.marks ?? 0) - (a.marks ?? 0);
      if (this.sortBy === 'attendance') return (b.attendance ?? 0) - (a.attendance ?? 0);
      return a.name.localeCompare(b.name);
    });

    return result;
  }

  get averageMarks(): string {
    const withMarks = this.students.filter((s) => s.marks != null);
    if (!withMarks.length) return '—';
    const avg = withMarks.reduce((sum, s) => sum + (s.marks ?? 0), 0) / withMarks.length;
    return avg.toFixed(1);
  }

  get averageAttendance(): string {
    const withAtt = this.students.filter((s) => s.attendance != null);
    if (!withAtt.length) return '—';
    const avg = withAtt.reduce((sum, s) => sum + (s.attendance ?? 0), 0) / withAtt.length;
    return avg.toFixed(1) + '%';
  }

  get honorStudents(): number {
    return this.students.filter((s) => s.grade === 'A' || s.grade === 'A+').length;
  }

  get maladStudents(): number {
    return this.students.filter((s) => s.address?.toLowerCase().includes('malad')).length;
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = '';
    this.studentService.getAll().subscribe({
      next: (data) => {
        this.students = data;
        if (!data.length) {
          this.seedDemoStudents(true);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Campus server offline. Start the Spring Boot backend on http://localhost:8080';
        this.loading = false;
      }
    });
  }

  seedDemoStudents(silent = false): void {
    const existingNames = new Set(this.students.map((s) => s.name.toLowerCase()));
    const toAdd = this.samplePool.filter((s) => !existingNames.has(s.name.toLowerCase()));
    if (!toAdd.length) {
      this.loading = false;
      if (!silent) {
        this.successMessage = 'Demo students are already enrolled.';
        this.clearToastLater();
      }
      return;
    }

    this.seeding = true;
    this.errorMessage = '';
    forkJoin(toAdd.map((student) => this.studentService.create(student))).subscribe({
      next: () => {
        this.seeding = false;
        if (!silent) {
          this.successMessage = `Added ${toAdd.length} demo students to the campus roster.`;
          this.clearToastLater();
        }
        this.loadStudents();
      },
      error: () => {
        this.seeding = false;
        this.loading = false;
        this.errorMessage = 'Could not add demo students. Please try again.';
      }
    });
  }

  fillRandomStudent(): void {
    const firstNames = ['Arjun', 'Meera', 'Dev', 'Kavya', 'Nikhil', 'Riya', 'Aditya', 'Tara', 'Yash', 'Nisha'];
    const lastNames = ['Verma', 'Iyer', 'Gupta', 'Joshi', 'Malhotra', 'Chopra', 'Bose', 'Rao', 'Desai', 'Kulkarni'];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    const marks = Math.round((65 + Math.random() * 32) * 10) / 10;
    const attendance = Math.round((75 + Math.random() * 23) * 10) / 10;
    const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : 'B';

    this.form.patchValue({
      name: `${first} ${last}`,
      age: 17 + Math.floor(Math.random() * 6),
      course: this.courses[Math.floor(Math.random() * this.courses.length)],
      marks,
      grade,
      attendance,
      address: this.maladAddresses[Math.floor(Math.random() * this.maladAddresses.length)],
      email: `${first.toLowerCase()}.${last.toLowerCase()}@student.edu`,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`.slice(0, 10)
    });
    this.editingId = null;
    this.successMessage = 'Random student details filled. Review and click Enroll Student.';
    this.clearToastLater();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const student: Student = this.form.value;
    this.saving = true;
    this.errorMessage = '';

    const request$ = this.editingId
      ? this.studentService.update(this.editingId, student)
      : this.studentService.create(student);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingId
          ? 'Student record updated successfully.'
          : 'New student enrolled successfully.';
        this.clearToastLater();
        this.resetForm();
        this.loadStudents();
        this.saving = false;
      },
      error: () => {
        this.errorMessage = this.editingId
          ? 'Failed to update student record.'
          : 'Failed to enroll student.';
        this.saving = false;
      }
    });
  }

  onEdit(student: Student): void {
    this.editingId = student.id ?? null;
    this.form.patchValue({
      name: student.name,
      age: student.age,
      marks: student.marks ?? null,
      grade: student.grade ?? '',
      attendance: student.attendance ?? null,
      course: student.course ?? '',
      address: student.address ?? '',
      email: student.email ?? '',
      phone: student.phone ?? ''
    });
    document.getElementById('enrollment-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  onDelete(id: number, name: string): void {
    if (!confirm(`Remove ${name} from the college roster?`)) {
      return;
    }

    this.errorMessage = '';
    this.studentService.delete(id).subscribe({
      next: () => {
        this.successMessage = `${name} removed from roster.`;
        this.clearToastLater();
        if (this.editingId === id) {
          this.resetForm();
        }
        this.loadStudents();
      },
      error: () => {
        this.errorMessage = 'Failed to remove student.';
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset();
    this.form.patchValue({ address: this.collegeAddress });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.courseFilter = '';
    this.sortBy = 'name';
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  gradeClass(grade?: string): string {
    if (!grade) return 'grade-default';
    if (grade.startsWith('A')) return 'grade-a';
    if (grade.startsWith('B')) return 'grade-b';
    return 'grade-c';
  }

  attendanceLevel(value?: number): string {
    if (value == null) return 'low';
    if (value >= 90) return 'high';
    if (value >= 75) return 'mid';
    return 'low';
  }

  private clearToastLater(): void {
    setTimeout(() => (this.successMessage = ''), 3500);
  }
}
