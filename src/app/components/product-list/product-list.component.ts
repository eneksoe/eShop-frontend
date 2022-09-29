import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute } from '@angular/router'
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategotyId: number = 1;
  currentCategoryName: string = "Book";
  previusCategoryId: number = 1;
  searchMode: boolean = false;

  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;


  previousKeyword: string = "";

  constructor(private productService: ProductService, private route: ActivatedRoute, private cartService: CartService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }

  }

  handleSearchProducts() {

    const theKeyWord: string = this.route.snapshot.paramMap.get('keyword')!;

    if (this.previousKeyword != theKeyWord) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyWord;

    console.log(`keyword=${theKeyWord}, thePageNumber=${this.thePageNumber}`);

    this.productService.searchProductsPaginate(
      this.thePageNumber - 1,
      this.thePageSize,
      theKeyWord)
      .subscribe(this.processResult());
  }

  handleListProducts() {

    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      this.currentCategotyId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    } else {
      this.currentCategotyId = 1;
      this.currentCategoryName = "Books";
    }

    if (this.previusCategoryId != this.currentCategotyId) {
      this.thePageNumber = 1;
    }

    this.previusCategoryId = this.currentCategotyId;

    console.log(`currentCategoryId=${this.currentCategotyId}, thePageNumber=${this.thePageNumber}`);

    this.productService.getProductsListPaginate(
      this.thePageNumber - 1,
      this.thePageSize,
      this.currentCategotyId)
      .subscribe(this.processResult());
  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  addToCart(tehProduct: Product) {

    console.log(`Adding to cart: ${tehProduct.name}, ${tehProduct.unitPrice}`);

    const theCartItem = new CartItem(tehProduct);

    this.cartService.addToCart(theCartItem);
  }

}
