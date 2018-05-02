import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NoteProcessingPage } from './note-processing';

@NgModule({
  declarations: [
    NoteProcessingPage,
  ],
  imports: [
    IonicPageModule.forChild(NoteProcessingPage),
  ],
})
export class NoteProcessingPageModule {}
