import { Injectable, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/ko';


@Pipe({
  name: 'DateFormat'
})
@Injectable()
export class DateFormatPipe implements PipeTransform {
  // DateFormatPipe
  // Show moment.js dateFormat for time elapsed.
  
  transform(date: any, args?: any): any {
    //moment.locale('zh-cn')
    return moment(new Date(date)).fromNow();
  }
}
