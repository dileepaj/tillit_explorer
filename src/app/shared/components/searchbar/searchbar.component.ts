import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent {

  searchForm = new FormControl('');
  private searchText: string;

  popSearch: boolean = false;

  constructor(private router: Router) { }

  search() {
    console.log("Searchbar button");
    if (this.searchForm.value) {
      this.router.navigate(['/search', this.searchForm.value]);
      this.popSearch = false;
    }

  }

}
