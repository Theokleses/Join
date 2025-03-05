import { Component, OnInit } from '@angular/core';
import { TasksService } from '../firebase-services/tasks.service';
import { LoginService } from '../firebase-services/login.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
  initials: string = '';
  firstName: string = '';
  lastName: string = '';
  constructor(
    private loginService: LoginService,
    private taskService: TasksService,
  ) {}

  ngOnInit(): void {
    this.loginService.firstName$.subscribe((firstName) => {
      this.firstName = firstName;
    });

    this.loginService.lastName$.subscribe((lastName) => {
      this.lastName = lastName;
    });
  }
}
