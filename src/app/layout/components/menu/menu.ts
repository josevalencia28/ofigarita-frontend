import { Component, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menuitem } from './menuitem';
import { MenuService } from '@/services/menu-services';
import { Menubar } from 'primeng/menubar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TieredMenu } from 'primeng/tieredmenu';
import { AuthService } from '@/services/auth-service';
import { tap } from 'rxjs';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, Menuitem, RouterModule, Menubar, SplitButtonModule, TieredMenu],
    templateUrl: './menu.html'
})
export class Menu {
  model: MenuItem[] = [];
  modelPanel: any[] = [];
  usuario: any;


  constructor(
    private menuService: MenuService,
    private authService: AuthService,
  ) { }
  ngOnInit(): void {
    this.getMenu();
  }
  @ViewChildren('menu') menus!: QueryList<TieredMenu>;

// menuUser(): void {
//   const idUsuario = this.authService.getUsuario.ID_SGUSUARIOS;
// console.log(idUsuario);
//   this.menuService.menu(idUsuario).subscribe(res => {
//     if (res.length > 0) {
//       this.model = res.map((item: any) => ({
//         label: item.label,
//         icon: item.icon ?? '',
//         items: item.items
//       }));

//       this.modelPanel = res.map((item: any) => {
//         const dic: MenuItem = {
//           label: item.label,
//           icon: item.icon
//         };

//         if (item.items?.length > 0) {
//           dic.items = item.items;
//         }

//         return dic;
//       });
//     }
//   });
// }
    getMenu(): void {
        console.log(this.authService.getUsuario)
        this.menuService.menu(this.authService.getUsuario.ID_SGUSUARIOS).pipe(tap(res => {
        console.log(res);
            console.log(res.data[0].o_json);
            this.model = res.data[0].o_json;
        })).subscribe();
    }


  toggleMenu(event: Event, index: number) {
    this.menus.forEach((menu, i) => {
      if (i !== index) {
        menu.hide();
      }
    });

    this.menus.get(index)?.toggle(event);
  }
}
