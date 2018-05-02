import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { User } from '../models';
import { AuthProvider } from '../providers';

@Pipe({
  name: 'usersFilter',
  pure: false
})
@Injectable()
export class UsersPipe implements PipeTransform {
  // Accepts an array of userIds to filter out users, and a search string to search for a user based on their first, last, and username.
  transform(users, data: [string]): any {
    
    let excludedIds = data;
    
    if (!users) {
      return;
    } else if (!excludedIds) {
      return users;
    } else if (excludedIds) {
      
     

      
      
      return users.filter((user) => {
        return excludedIds.indexOf(user.key) === -1 
      });
    // } else {
    //   search = search.toLowerCase();
    //   return users.filter((user) => (excludedIds.indexOf(user.key) == -1 &&
    //     (
    //       user.firstName.toLowerCase().indexOf(search) > -1 ||
    //       user.lastName.toLowerCase().indexOf(search) > -1 ||
    //       user.username.toLowerCase().indexOf(search) > -1
    //     )));
    // }
    }
  }

  
 
}
