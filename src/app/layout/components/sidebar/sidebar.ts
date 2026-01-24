import { Component, ElementRef } from '@angular/core';
import { Menu } from '../menu/menu';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [Menu],
    templateUrl: './sidebar.html'
})
export class Sidebar {
    constructor(public el: ElementRef) { }
}
