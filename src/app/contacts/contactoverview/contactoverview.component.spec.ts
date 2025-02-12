import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactoverviewComponent } from './contactoverview.component';

describe('ContactoverviewComponent', () => {
  let component: ContactoverviewComponent;
  let fixture: ComponentFixture<ContactoverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactoverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
