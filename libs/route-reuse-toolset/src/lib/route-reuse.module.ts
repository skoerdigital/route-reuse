import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';

import { RouterOutletReusableDirective } from './directives';
import { PausableAsync } from './pipes';

@NgModule({
    declarations: [PausableAsync, RouterOutletReusableDirective],
    imports: [CommonModule],
    exports: [PausableAsync, RouterOutletReusableDirective],
})
export class RouteReuseModule {
    static injector: Injector;

    constructor(private injector: Injector) {
        RouteReuseModule.injector = this.injector;
    }
}
