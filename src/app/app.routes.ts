import { Routes } from '@angular/router';
import { StudentListComponent } from './components/student-list/student-list.component';

export const routes: Routes = [
  { path: '', component: StudentListComponent },
  { path: '**', redirectTo: '' }
];
