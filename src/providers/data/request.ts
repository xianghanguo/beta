import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { LoadingProvider, AlertProvider, DataProvider } from '../';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/take';

@Injectable()
export class RequestProvider {
  // Firebase Provider
  // This is the provider class for most of the Firebase updates in the app.

  constructor(
      public angularfireDatabase: AngularFireDatabase, 
      public loadingProvider: LoadingProvider, 
      public alertProvider: AlertProvider,
      public dataProvider: DataProvider) {
    console.log("Initializing Request Provider");
  }


  

  
  
  getChatMessages(userId){
    return this.angularfireDatabase.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + userId );
  }

  getRequestsReceived(userId){
    return this.angularfireDatabase.list('/accounts/' + userId + '/requestsReceived');
  }

  getRequestsSent(userId){
    return this.angularfireDatabase.list('/accounts/' + userId + '/requestsSent');
  }

  getUserChat(userId){
    return this.angularfireDatabase.object('/accounts/' + userId);
  }
  
  getUser(userId) {
    return this.angularfireDatabase.object('/accounts/' + userId);
  }
   // Get conversation given the conversationId.
   getConversation(conversationId) {
    return this.angularfireDatabase.object('/conversations/' + conversationId);
  }

  // Get conversations of the current logged in user.
  getConversations() {
    return this.angularfireDatabase.list('/accounts/' + firebase.auth().currentUser.uid + '/conversations');
  }

  // Get messages of the conversation given the Id.
  getConversationMessages(conversationId) {
    return this.angularfireDatabase.object('/conversations/' + conversationId + '/messages');
  }


  // Send friend request to userId.
  sendFriendRequest(from: string, to: string): Promise<any> {
    
    this.loadingProvider.show();
    return new Promise((resolve, reject)=>{
      var requestsSent;
      // Use take(1) so that subscription will only trigger once.
      this.getRequestsSent(from).valueChanges().take(1).subscribe((requests) => {
        console.log(requestsSent);    
      requestsSent = requests;
      
        if (!requestsSent) {
          requestsSent = [to];
        } else {
          
          if (requestsSent.indexOf(to) == -1)
            requestsSent.push(to);
        }
        // Add requestsSent information.
        this.angularfireDatabase.object('/accounts/' + from).update({
          requestsSent: requestsSent
        }).then((success) => {
          var requestsReceived;
          this.getRequestsReceived(to).valueChanges().take(1).subscribe((requests) => {
            requestsReceived = requests;
            if (!requestsReceived) {
            requestsReceived = [from];
            } else {
            
              if (requestsReceived.indexOf(from) == -1)
              requestsReceived.push(from);
            }
            // Add chatRequests information.
            this.angularfireDatabase.object('/accounts/' + to).update({
              requestsReceived: requestsReceived
            }).then((success) => {
              this.loadingProvider.hide();
              this.alertProvider.showFriendRequestSent();
              resolve();
            }).catch((error) => {
              reject();
              this.loadingProvider.hide();
            });
          });
        }).catch((error) => {
          reject();
          this.loadingProvider.hide();
        });
      });
    })
    
  }

  // Cancel friend request sent to userId.
  cancelFriendRequest(from: string, to: string){

    
    
    this.loadingProvider.show();

    var requestsSent;
    this.getRequestsSent(from).valueChanges().take(1).subscribe((requests) => {
      requestsSent = requests;
      requestsSent.splice(requestsSent.indexOf(to), 1);
      // Update requestSent information.
      this.angularfireDatabase.object('/accounts/' + from ).update({
        requestsSent: requestsSent
      }).then((success) => {
        var requestsReceived;
        this.getRequestsReceived(to).valueChanges().take(1).subscribe((requests) => {
          requestsReceived = requests;
          
          requestsReceived.splice(requestsReceived.indexOf(from), 1);
          console.log(requestsReceived);
          // Update chatRequests information.
          this.angularfireDatabase.object('/accounts/' + to ).update({
            requestsReceived: requestsReceived
          }).then((success) => {
            this.loadingProvider.hide();
          }).catch((error) => {
            this.loadingProvider.hide();
          });
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }

  
  // Accept friend request.
  acceptFriendRequest(from: string, to: string): Promise<any> {
   
    return new Promise((resolve, reject) => {
      this.cancelFriendRequest(from, to);
      this.cancelFriendRequest(to, from);
      
      this.getUser(from).snapshotChanges().take(1).subscribe((account) => {
        var friends = account.payload.val().friends;
        if (!friends) {
          friends = [to];
        } else {
          if(friends.indexOf(to) == -1)
          friends.push(to);
        }
        // Add both users as friends.
        this.getUser(from).update({
          friends: friends
        }).then((success) => {
          this.getUser(to).snapshotChanges().take(1).subscribe((account) => {
            var friends = account.payload.val().friends;
            if (!friends) {
              friends = [from];
            } else {
              if(friends.indexOf(from) == -1)
              friends.push(from);
            }
            this.getUser(to).update({
              friends: friends
            }).then((success) => {
            resolve();
            }).catch((error) => {
            reject();
            });
          });
        }).catch((error) => {
          
        });
      });
    })
    // Delete friend request.
    
  }
}
