import { Injectable, model } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
interface taskAssignee{
  id: number;
  taskID: number;
  assigneeID: number;
}
interface task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  postDate: string;
  deadlineDate: string;
  completionDate: string | null;
}
@Injectable({
  providedIn: 'root',
})
export class PostService {
  /*private tasksSubject = new BehaviorSubject<CalendarComponentModel[]>([]);
  tasks$: Observable<CalendarComponentModel[]> = this.tasksSubject.asObservable();*/
  constructor(private http: HttpClient){}
  private mapStatus(s: string): 'To Do' | 'In Progress' | 'Review' | 'Mechanical' | 'Completed' {
    const v = (s || '').toLowerCase();
    if (v === 'completed') return 'Completed';
    if (v === 'in progress' || v === 'inprogress') return 'In Progress';
    if (v === 'review') return 'Review';
    if (v === 'mechanical') return 'Mechanical';
    return 'To Do';
  }
  /*private toCalendarModel (t:task): CalendarComponentModel{
    return new CalendarComponentModel({
      id: String(t.id), title: t.title || '', description: t.description || '', status: this.mapStatus(t.status), date: t.deadlineDate ? new Date(t.deadlineDate): new Date(t.postDate),
    });
  }
  loadCalendarForCurrentUser(): Observable<CalendarComponentModel[]>{
    return this.http.get<taskAssignee[]>('http://localhost:8000/rest/calendar').pipe(switchMap(assignedTasks => this.http.get<task[]>('http://localhost:8000/rest/task/getTasks').pipe(map(allTasks => {
      const ids = new Set(assignedTasks.map(a => a.taskID));
      const filtered = allTasks.filter(t => ids.has(t.id));
      const models = filtered.map(t => this.toCalendarModel(t));
      this.tasksSubject.next(models);
      return models;
    }))));
  }
  setTasks(tasks: CalendarComponentModel[]){
    this.tasksSubject.next(tasks);
  }*/
}
