import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';
import { DataProvider } from '../../providers';


@IonicPage()
@Component({
  selector: 'page-note',
  templateUrl: 'note.html',
})
export class NotePage {
  private user : string;
  private noteList : any;
  private msg : any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider : DataProvider, public afDB:AngularFireDatabase, public afAuth:AngularFireAuth) {
    this.user = afAuth.auth.currentUser.uid;
  }

  ionViewDidLoad() {
    this.dataProvider.getNoteList(this.user).snapshotChanges().subscribe(list=>{
      this.noteList = list;
      this.noteList.forEach(noteUser=>{
        this.dataProvider.getUser(noteUser.payload.val().target).snapshotChanges().take(1).subscribe(userInfo=>{
          noteUser.nickname = userInfo.payload.val().username;
          noteUser.profileImg = userInfo.payload.val().profileImg;
          console.log(noteUser.nickname);
        });
        
                 
      })
    })
  }
  viewNote(roomKey) {
    this.navCtrl.push('NoteProcessingPage',{roomKey:roomKey});
  }

  
}
