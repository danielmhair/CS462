/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import {RumorsComponent} from "../rumors/rumors.component";

describe('RumorsComponent', () => {
  let component: RumorsComponent;
  let fixture: ComponentFixture<RumorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RumorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RumorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
