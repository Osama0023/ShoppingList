import { Subscription } from 'rxjs';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { Ingredient } from '../../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f', {static:false}) slForm: NgForm
  subscription: Subscription;
  editedindex: number;
  editMode = false;
  editedItem: Ingredient;
  constructor(private slService: ShoppingListService) {}


  ngOnInit() {
    this.subscription = this.slService.startEditing
    .subscribe(
      (index: number)=> {
        this.editMode=true;
        this.editedindex= index;
        this.editedItem= this.slService.getIngredient(index);
        this.slForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        })
      }
    )
  }

  onAddItem(form: NgForm) {
    const value = form.value;
    const newIngredient = new Ingredient(value.name, value.amount);
    if(this.editMode){
      this.slService.updateIngredient(this.editedindex, newIngredient )
    }else{
      this.slService.addIngredient(newIngredient);
    }
    this.editMode= false;
    form.reset();
  }
  onClear(){
    this.slForm.reset();
    this.editMode= false;
  }
  onDelete(){
    this.slService.deleteIngredient(this.editedindex)
     this.onClear()
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

}
