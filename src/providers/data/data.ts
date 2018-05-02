import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import * as firebase from 'firebase';
import 'rxjs/add/operator/map'; // you might need to import this, or not depends on your setup
import 'rxjs/add/operator/take'

@Injectable()
export class DataProvider {
  // Data Provider
  // This is the provider class for most of the Firebase observables in the app.

  constructor(public angularfireDatabase: AngularFireDatabase,
  ) {
    console.log("Initializing Data Provider");
  }

  // Get all users
  getUsers() {
    return this.angularfireDatabase.list('/accounts', ref => ref.orderByChild('name'));
  }

  // Get user with username
  getUserWithUsername(username) {
    return this.angularfireDatabase.list('/accounts', ref => ref.orderByChild('username').equalTo(username));
  }

  // Get logged in user data
  getCurrentUser() {
    return this.angularfireDatabase.object('/accounts/' + firebase.auth().currentUser.uid);
  }

  // Get user by their userId
  getUser(userId) {
    return this.angularfireDatabase.object('/accounts/' + userId);
  }

  getUserFriends(userId){
    return this.angularfireDatabase.list('/accounts/' +  userId + '/friends/');
  }

  // Get requests given the userId.
  getRequests(userId) {
    return this.angularfireDatabase.object('/requests/' + userId);
  }

  // Get friend requests given the userId.
  getFriendRequests(userId) {
    return this.angularfireDatabase.list('/requests', ref => ref.orderByChild('receiver').equalTo(userId));
  }


   // Get conversation given the conversationId.
  getUserConversation(userId, partnerId) {
    return this.angularfireDatabase.object('/accounts/' + userId + '/conversations/' + partnerId);
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

  // Get messages of the group given the Id.
  getGroupMessages(groupId) {
    return this.angularfireDatabase.object('/groups/' + groupId + '/messages');
  }

  // Get groups of the logged in user.
  getGroups() {
    return this.angularfireDatabase.list('/accounts/' + firebase.auth().currentUser.uid + '/groups');
  }

  // Get group info given the groupId.
  getGroup(groupId) {
    return this.angularfireDatabase.object('/groups/' + groupId);
  }

  getPostMenu() {
    return this.angularfireDatabase.list('/menu/', ref => ref);
  }

  // HOME 최신글 가져오기 5개씩 //
  getLatestPosts(menu) {
    return this.angularfireDatabase.list('/community/'+ menu, ref => ref.orderByChild('date').limitToLast(5));
  }

  getUserPost(userId){
    return this.angularfireDatabase.list('/accounts/' + userId + '/post', ref => ref.orderByKey());
  }

  getPost(category, postId){
    return this.angularfireDatabase.object('/community/'+ category + '/' + postId);
  }

  getPosts(child, category) {
    return this.angularfireDatabase.list('/community/'+ child, ref => ref.orderByChild('category_date').startAt(category).endAt(category+"\uf8ff").limitToLast(5));
  }

  getPostLikes(category, postId){
    return this.angularfireDatabase.list('/community/' + category + '/' + postId + '/likes');
  }

  getCommentLikes(postId){
    return this.angularfireDatabase.list('/comment/' + postId + '/likes');
  }

  getComments(postId) {
    return this.angularfireDatabase.list('/comments/' + postId , ref=> ref);
  }
  
  getFeeds(batch, lastKey?) {
    return this.angularfireDatabase.list('/feed', ref => lastKey?  ref.orderByKey().limitToLast(batch).endAt(lastKey) : ref.orderByKey().limitToLast(batch));
  }
  getBullets(batch, location, lastKey?) {
    return this.angularfireDatabase.list(location, ref => lastKey?  ref.orderByKey().limitToLast(batch).endAt(lastKey) : ref.orderByKey().limitToLast(batch));
  }

  getLatestUsers(){
   
    return this.angularfireDatabase.list('/accounts', ref => ref.orderByChild('lastLogin').limitToFirst(100));
  }

  getChatList(){
    return this.angularfireDatabase.list('/chat', ref => ref.orderByChild('lastUpdate'));
  }

  getChatMessages(UserId){
    return this.angularfireDatabase.list('/chat/' + UserId + '/messages');
  }

  getContest(contestId) {
    return this.angularfireDatabase.database.ref('/contests/' + contestId);
  }

  getLastContest(){
    return this.angularfireDatabase.list('/contests/', ref=> ref.limitToLast(1));
  }

  getApplicant(contestId){
    return this.angularfireDatabase.list('/contests/' + contestId + '/applicant', ref => ref.orderByValue());
  }

  getCandidate(contestId){
    return this.angularfireDatabase.list('/contests/'  + contestId + '/candidate' , ref => ref.orderByChild('gender'));
  }

  getScores(contestId, candidateId){
    return this.angularfireDatabase.object('/contests/' + contestId + '/candidate/' + candidateId + '/score');
  }
  
  getChampions(contestId) {
    return this.angularfireDatabase.list('/contests/'  + contestId + '/champion' , ref => ref.orderByValue());
  }

  getVoteList(contestId, candidateId, currentRound) {
    return this.angularfireDatabase.list('/contests/'  + contestId + '/vote/' + candidateId , ref => ref.orderByChild(currentRound).limitToLast(10));
  }

  getChatQueueUser() {
    return this.angularfireDatabase.list('/chat-queue/', ref => ref);
  }
  
  getNoteList(userKey){
    return this.angularfireDatabase.list('/note-link/'+userKey , ref => ref);
  }

  getProducts(){
    return this.angularfireDatabase.list('/purchase/products');
  }



  // Set the pushToken of the user given the userId.
  public setPushToken(userId: string, token: string): void {
    this.angularfireDatabase.object('accounts/' + userId).update({
      pushToken: token
    })
    .catch(() => { });
  }

  // Remove the pushToken of the user given the userId.
  public removePushToken(userId: string): void {
    this.angularfireDatabase.object('accounts/' + userId).update({
        pushToken: ''
      })
    .catch(() => { });
  }

  // Get an object from Firestore by its path. For eg: firestore.get('users/' + userId) to get a user object.
  public get(path: string): Promise<AngularFireObject<{}>> {
    return new Promise(resolve => {
      resolve(this.angularfireDatabase.object(path));
    });
  }

}