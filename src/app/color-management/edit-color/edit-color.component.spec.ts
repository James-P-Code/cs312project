import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditColorComponent } from './edit-color.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EditColorComponent', () => {
  let component: EditColorComponent;
  let fixture: ComponentFixture<EditColorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditColorComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EditColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
