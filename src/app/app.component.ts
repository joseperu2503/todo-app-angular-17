import { ChangeDetectorRef, Component, ElementRef, Injector, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Task } from './models/task.model';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  injector = inject(Injector);

  @ViewChild('inputEdit', { static: false, read: ElementRef }) inputEdit: ElementRef | null = null;
  @ViewChild('inputNew', { static: false, read: ElementRef }) inputNew: ElementRef | null = null;

  tasks = signal<Task[]>([])

  ngOnInit() {
    const storage = localStorage.getItem('tasks');
    if (storage) {
      const tasks = JSON.parse(storage)
      this.tasks.set(tasks)
    }
    this.trackTasks()
  }

  trackTasks() {
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }, { injector: this.injector })
  }


  showForm = signal<boolean>(false)

  searchTask = signal('');

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      //validador requerido
      Validators.required,
    ]
  })

  editTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      //validador requerido
      Validators.required,
    ]
  })

  filter = signal<'all' | 'pending' | 'completed'>('all')

  newTask() {
    this.showForm.set(true)
    this.newTaskCtrl.setValue('')
    this.newTaskCtrl.reset()
    this.cdr.detectChanges();
    this.inputNew?.nativeElement.focus();
  }

  cancelAddTask() {
    this.showForm.set(false)
    this.newTaskCtrl.setValue('')
  }

  addTask() {
    //quitamos los espacios
    const value = this.newTaskCtrl.value.trim()
    //validamos
    this.newTaskCtrl.setValue(value)

    if (this.newTaskCtrl.invalid) return;

    const newTask: Task = {
      id: Date.now(),
      title: this.newTaskCtrl.value,
      completed: false
    }

    this.tasks.update((tasks) => [...tasks, newTask])
    this.showForm.set(false)
    this.newTaskCtrl.setValue('')
  }

  toggleCompletedTask(index: number) {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            completed: !task.completed
          }
        }
        return task;
      })
    })
  }

  deleteTask(index: number) {
    this.tasks.update(tasks => {
      return tasks.filter((_, position) => position !== index);
    })
  }


  editTask(index: number) {
    this.tasks.update((tasks) => {
      return tasks.map((task, i) => {
        return {
          ...task,
          editing: index == i
        }
      })
    })
    this.editTaskCtrl.setValue(this.tasks()[index].title)
    this.cdr.detectChanges();
    this.inputEdit?.nativeElement.select();
  }

  updateTask(index: number) {
    //quitamos los espacios
    const value = this.editTaskCtrl.value.trim()
    //validamos
    this.editTaskCtrl.setValue(value)

    if (this.editTaskCtrl.invalid) return;

    this.tasks.update((tasks) => {
      tasks[index].title = this.editTaskCtrl.value
      tasks[index].editing = false

      return tasks;
    })
  }

  cancelUpdateTasks() {
    this.tasks.update((tasks) => {
      return tasks.map(task => {
        return {
          ...task,
          editing: false
        }
      })
    })
  }

  changeFilter(filter: 'all' | 'pending' | 'completed') {
    this.filter.set(filter)
  }

  filteredTaks = computed(() => {
    const filter = this.filter()
    const searchValue = this.searchTask().toLowerCase()
    const tasks = this.tasks().filter(task => task.title.toLowerCase().includes(searchValue))
    if (filter === 'pending') {
      return tasks.filter(task => !task.completed)
    }
    if (filter === 'completed') {
      return tasks.filter(task => task.completed)
    }
    return tasks
  })
}
