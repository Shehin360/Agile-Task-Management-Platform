import { Component } from '@angular/core';
import {trigger,transition,style, animate} from '@angular/animations';


@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css',
  animations: [
    trigger('taskAnim',[
      transition(':enter', [
        style({opacity:0 ,transform: 'translateY(10px)'}),
        animate('200ms ease-out',
          style({opacity:1, transform: 'translateY(0)'})
        )
      ]),
      transition(':leave', [
        animate ('150ms ease-in' ,
          style({opacity: 0, transform:'translateY(-10px)'}))
      ])
    ])
  ]
})
export class Kanban {

  tasks = [
    {id:1, title: 'Design UI', status: 'todo'},
    {id:2,title:'Create API', status:'inprogress'},
    {id:3,title:'Fix Bugs', status:'done'},
    {id:4,title:'Write Tests',status:'todo'},
  ]


getTaskByStatus(status: string){
  return this.tasks.filter(task =>task.status===status)
}
  moveTask(task:any){
    if(task.status === 'todo'){
      task.status= 'inprogress';

    }else if(task.status === 'inprogress'){
      task.status= 'done';
    }
  }

}