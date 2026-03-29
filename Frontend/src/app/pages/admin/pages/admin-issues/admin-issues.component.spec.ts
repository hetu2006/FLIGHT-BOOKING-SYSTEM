import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminIssuesComponent } from './admin-issues.component';
import { AdminService } from '../../services/admin.service';

describe('AdminIssuesComponent', () => {
  let component: AdminIssuesComponent;
  let fixture: ComponentFixture<AdminIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminIssuesComponent],
      providers: [AdminService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
