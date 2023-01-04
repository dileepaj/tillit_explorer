import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent {

  searchForm = new FormControl('');
  searchText:string

  popSearch: boolean = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }
  ngOnInit() {
    const urlPaths = this.activatedRoute["_routerState"].snapshot.url.split("/");
    if(urlPaths[1] == "search") this.searchText = this.activatedRoute.snapshot.params.id;
    else this.searchText = "";
  }

  search() {
  //  console.log("Searchbar button",this.searchForm.value);
    if (this.searchForm.value) {
      sessionStorage.removeItem("searchPage");
      this.searchText=this.searchForm.value
      this.router.navigate(['/search', this.searchForm.value]);
      this.popSearch = false;
    }

  }

}
