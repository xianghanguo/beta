import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import * as firebase from 'firebase';
import 'rxjs/add/operator/map'; // you might need to import this, or not depends on your setup
import 'rxjs/add/operator/take'

@Injectable()
export class FirebaseProvider {

constructor(public angularfireDatabase: AngularFireDatabase) {
    console.log("Initializing Firebase Provider");
    }


  // Set the pushToken of the user given the userId.
  public setPushToken(userId: string, token: string): void {
    this.get('accounts/' + userId).then(ref => {
      ref.update({
        pushToken: token
      });
    }).catch(() => { });
  }

  // Remove the pushToken of the user given the userId.
  public removePushToken(userId: string): void {
    this.get('accounts/' + userId).then(ref => {
      ref.update({
        pushToken: ''
      });
    }).catch(() => { });
  }

  // Get an object from Firestore by its path. For eg: firestore.get('users/' + userId) to get a user object.
  public get(path: string): Promise<AngularFireObject<{}>> {
    return new Promise(resolve => {
      resolve(this.angularfireDatabase.object(path));
    });
  }

}