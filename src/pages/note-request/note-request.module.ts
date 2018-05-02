import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NoteRequestPage } from './note-request';

@NgModule({
  declarations: [
    NoteRequestPage,
  ],
  imports: [
    IonicPageModule.forChild(NoteRequestPage),
  ],
})
export class NoteRequestPageModule {}
