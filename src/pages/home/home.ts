import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Content } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { DataProvider } from '../../providers';
import { Keyboard } from '@ionic-native/keyboard';
import { Subscription } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  @ViewChild("content") contentHandle: Content;

  private contentBox;
  private tabBarHeight;
  private subscriptions: Subscription [];
  menuType: string;
  postMenu: any[] = [];
 
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase, 
    public dataProvider:DataProvider,
    public keyboard: Keyboard,
   ) {
     
   }
  ionViewDidLoad() {
    
    console.log('ionViewDidLoad HomePage');
    this.afDB.database.ref('/accounts/'+this.afAuth.auth.currentUser.uid).update({
      connection:'connected'
    });
    this.contentBox=document.querySelector(".home .scroll-content")['style'];
    this.tabBarHeight = this.contentBox.marginBottom;
    

    this.dataProvider.getPostMenu().valueChanges().take(1).subscribe(menu=>{
      this.postMenu = menu;
      this.postMenu.forEach(menu=>{
        this.dataProvider.getLatestPosts(menu.name).snapshotChanges().take(1).subscribe(posts => {
         
          menu.posts = posts.reverse();
          
        });
      });
    });
  }


  ionViewDidEnter(){
    this.subscriptions = [];

    let subscription = this.keyboard.onKeyboardShow().subscribe(() => {
      
    document.querySelector(".tabbar")['style'].display = 'none';
    this.contentBox.marginBottom = 0;
    this.contentHandle.resize();
    })

    let subscription_ = this.keyboard.onKeyboardHide().subscribe(() => {
     
    document.querySelector(".tabbar")['style'].display = 'flex';
    this.contentBox.marginBottom = this.tabBarHeight;
    this.contentHandle.resize();
    })

    this.subscriptions.push(subscription);
    this.subscriptions.push(subscription_)
  }
 
  ionViewWillLeave() {
    // Unsubscribe to Subscription.
    if (this.subscriptions){
        this.subscriptions.forEach(subscription => {
          subscription.unsubscribe();
        })
    }
      
  }

 

  openCommunityPage(menu, index) {
    
    this.navCtrl.push('CommunityPage', { menu: menu, index: index});
  }

  openPost(menu,key){
    
    this.navCtrl.push('CommunityPostPage',{ menu:menu, postId : key });
  }

}