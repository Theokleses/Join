import {
  Component,
  inject,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../firebase-services/contacts.service';
import { FormsModule } from '@angular/forms';
import { Icontacts } from '../interfaces/icontacts';
import { Itasks } from '../interfaces/itasks';
import { TasksService } from '../firebase-services/tasks.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  @ViewChild('inputSearch') inputSearch!: ElementRef;
  public contacts = inject(ContactsService);
  readonly date = new FormControl(new Date());
  readonly serializedDate = new FormControl(new Date().toISOString());

  taskForm: FormGroup;
  isDropdownOpen: boolean = false;
  selectedContactIds: string[] = [];
  searchQuery: string = '';
  filteredContacts: any[] = [];
  isUrgentClicked: boolean = false;
  isMediumClicked: boolean = true;
  isLowClicked: boolean = false;
  inputValue: string = '';
  subtasklist: string[] = [];
  inputSubtask: string = '';

  constructor(
    private fb: FormBuilder,
    private tasksService: TasksService,
  ) {
    this.contacts;
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedTo: [[], Validators.required],
      dueDate: ['', Validators.required],
      category: ['', Validators.required],
    });
    this.filteredContacts = this.contacts.contactlist;
  }

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedTo: [[]],
      dueDate: [today, Validators.required],
      category: ['', Validators.required],
      prio: ['Medium'],
    });

    // Initialisiere this.date mit dem Wert aus taskForm
    this.date.setValue(new Date(this.taskForm.value.dueDate));
  }

  onDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = new Date(inputElement.value);
    this.date.setValue(selectedDate);
  }

  checkContact(contactId: string, event: MouseEvent) {
    console.log(contactId);
    const contact = this.contacts.contactlist.find((c) => c.id === contactId);

    if (contact) {
      contact.checked = !contact.checked;
      this.contacts.contactlist = [...this.contacts.contactlist];
      event.stopPropagation();
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
      this.inputValue = ''; // Leert das Eingabefeld
    }
  }

  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value.toLowerCase();

    if (inputValue) {
      this.filteredContacts = this.contacts.contactlist.filter((contact) =>
        contact.firstname.toLowerCase().startsWith(inputValue),
      );
      this.isDropdownOpen = true;
    } else {
      this.filteredContacts = this.contacts.contactlist;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    setTimeout(() => this.inputSearch?.nativeElement.focus(), 0);
    if (this.isDropdownOpen) {
      this.filteredContacts = this.contacts.contactlist;
    }
  }

  toggleUrgent() {
    this.isUrgentClicked = !this.isUrgentClicked;
    if (this.isMediumClicked) {
      this.isMediumClicked = false;
    }
    if (this.isLowClicked) {
      this.isLowClicked = false;
    }
  }

  toggleMedium() {
    this.isMediumClicked = !this.isMediumClicked;
    if (this.isUrgentClicked) {
      this.isUrgentClicked = false;
    }
    if (this.isLowClicked) {
      this.isLowClicked = false;
    }
  }

  toggleLow() {
    this.isLowClicked = !this.isLowClicked;
    if (this.isUrgentClicked) {
      this.isUrgentClicked = false;
    }
    if (this.isMediumClicked) {
      this.isMediumClicked = false;
    }
  }

  addToSubtasklist() {
    if (this.inputSubtask) {
      this.subtasklist.push(this.inputSubtask);
      this.inputSubtask = '';
    }
  }

  deleteFromSubtasklist(index: number) {
    this.subtasklist.splice(index, 1);
  }

  onSubmit() {
    if (this.taskForm.valid) {
      // Extrahieren der Werte aus dem Formular
      const formValues = this.taskForm.value;

      // Extrahieren der ausgewählten Kontakte
      const selectedContacts: Icontacts[] = this.contacts.contactlist.filter(
        (contact) => contact.checked,
      );

      // Extrahieren der Priorität
      let prio: 'Urgent' | 'Medium' | 'Low' = 'Medium'; // Standardwert
      if (this.isUrgentClicked) {
        prio = 'Urgent';
      } else if (this.isMediumClicked) {
        prio = 'Medium';
      } else if (this.isLowClicked) {
        prio = 'Low';
      }

      const dueDate = this.date.value
        ? this.date.value.toLocaleDateString()
        : '';

      // Erstellen des newTask-Objekts gemäß dem Itasks-Interface
      const newTask: Itasks = {
        title: formValues.title,
        description: formValues.description,
        category: formValues.category as 'Technical Task' | 'User Story', // Typumwandlung
        dueDate: dueDate,
        prio: prio,
        assigned: selectedContacts,
        subtask: this.subtasklist,
        status: 'todo', // Standardstatus, falls nicht angegeben
      };

      // Prüfen, ob eine Priorität ausgewählt wurde
      if (!prio) {
        console.log('Bitte wählen Sie eine Priorität aus.');
        return;
      }

      // Loggen des newTask-Objekts zur Überprüfung
      console.log('New Task:', newTask);
      this.tasksService.addTask(newTask);

      this.onClear();
    } else {
      console.log(
        'Formular ist nicht gültig. Bitte füllen Sie alle erforderlichen Felder aus.',
      );
    }
  }

  onClear() {
    // Formular zurücksetzen
    const today = new Date().toISOString().split('T')[0];

    this.taskForm.reset({
      title: '',
      description: '',
      assignedTo: [],
      dueDate: today, // Datum-Feld wird geleert
      category: '',
    });

    // Alle ausgewählten Kontakte deaktivieren
    this.contacts.contactlist.forEach((contact) => {
      contact.checked = false;
    });

    // Kontaktliste aktualisieren
    this.filteredContacts = [...this.contacts.contactlist];

    // Weitere Variablen zurücksetzen
    this.selectedContactIds = [];
    this.isDropdownOpen = false;
    this.searchQuery = '';
    this.subtasklist = []; // Subtasks zurücksetzen
    this.inputSubtask = ''; // Subtask-Eingabefeld leeren

    // Prioritäts-Buttons zurücksetzen
    this.isUrgentClicked = false;
    this.isMediumClicked = false;
    this.isLowClicked = false;
  }
}
