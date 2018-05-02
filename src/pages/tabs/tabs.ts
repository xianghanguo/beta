import { Component, ViewChild } from '@angular/core';
import { IonicPage } from 'ionic-angular/navigation/ionic-page';
import { DataProvider, NotificationProvider } from '../../providers';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../models';
import { App, NavParams, Tabs } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';


@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild("tabs") tabs: Tabs;

  tab1Root = 'HomePage';
  tab2Root = 'RequestsPage';
  tab3Root = 'ChatListPage';
  tab4Root = 'ContestPage';
  tab5Root = 'ProfilePage';
  
  
  private user: User;
  private subscriptions: Subscription[];
  private selectedIndex: any;
  private conversations: any[];
  private userConversations: Map<string, any>;

  constructor(
    private afAuth: AngularFireAuth,
    private dataProvider: DataProvider,
    private notification: NotificationProvider,
    private navParams: NavParams,
    private app: App
  ) {
    this.selectedIndex = navParams.data.tabIndex || 0;

   
  }

  ionViewDidLoad() {
    


    this.userConversations = new Map<string, any>();
    
    this.subscriptions = [];
    // Subscribe to current user data on Firestore and sync.
    this.dataProvider.get('/accounts/' + this.afAuth.auth.currentUser.uid).then(ref => {
      
    
      let subscription = ref.valueChanges().subscribe((user: User) => {
        this.user = user;
        
      });
      this.subscriptions.push(subscription);
      // Initialize the push notifications (set pushToken) when user logged in.
      ref.valueChanges().take(1).subscribe((user: User) => {
        if (user.notifications) {
          
          this.notification.init();
          this.notification.setApp(this.app);
        }
      });
    }).catch(() => { });

    
    let conversationSubscription = this.dataProvider.getConversations().snapshotChanges().subscribe(conversations => {
      conversations.forEach(conversation => {
        let partnerId = conversation.key;
        let conversationId = conversation.payload.val().conversationId;
        let subscription  = this.dataProvider.getUserConversation(this.afAuth.auth.currentUser.uid, partnerId).valueChanges().subscribe(userConversation => {
          this.userConversations.set(conversationId, userConversation);
        })
        this.subscriptions.push(subscription);
        let subscription_ = this.dataProvider.getConversation(conversationId).valueChanges().subscribe((conversation: any) => {
          if(conversation){
            if(conversation.users.indexOf(this.afAuth.auth.currentUser.uid) > -1){
              this.addOrUpdateConversation(conversation);
            }else {
              this.deleteConversationById(conversationId);
              this.userConversations.delete(conversationId);
              if(this.conversations && this.conversations.length == 0) {
                this.conversations = null;
              }
            }
          }else{
            this.deleteConversationById(conversationId);
            this.userConversations.delete(conversationId);
            if(this.conversations && this.conversations.length == 0) {
              this.conversations = null;
            }
          }
          
          this.subscriptions.push(subscription_);   
        })
      })
    })
    this.subscriptions.push(conversationSubscription);
    }

  ionViewWillUnload() {
    // Clear subscriptions.
    if (this.subscriptions) {
      for (let i = 0; i < this.subscriptions.length; i++) {
        this.subscriptions[i].unsubscribe();
      }
      this.conversations = null;
    
    }
  }


  addOrUpdateConversation(conversation): void {
    if (this.conversations) {
      let index = -1;
      for (let i = 0; i < this.conversations.length; i++) {
        if (conversation.conversationId == this.conversations[i].conversationId) {
          index = i;
        }
      }
      if (index > -1) {
        this.conversations[index] = conversation;
      }
      else {
        this.conversations.push(conversation);
      }
    } else {
      this.conversations = [conversation];
    }
  }

  deleteConversationById(conversationId): void {
    if (this.conversations) {
      let index = -1;
      for (let i = 0; i < this.conversations.length; i++) {
        if (conversationId == this.conversations[i].conversationId) {
          index = i;
        }
      }
      if (index > -1) {
        this.conversations.splice(index, 1);
      }
    }
  }
   

  getRequestsReceived(): number {
    if (this.user && this.user.requestsReceived) {
      return this.user.requestsReceived.length;
    }
    return null;
  }

  getUnreadMessages(): number {    
    if (this.conversations) {
      let unread = 0;
      this.conversations.forEach(conversation => {
         if(conversation.messages && this.userConversations.get(conversation.conversationId)){
           unread +=  conversation.messages.length - this.userConversations.get(conversation.conversationId).messagesRead;
         }
      })
      if (unread > 0) {
        return unread;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }



  
}
