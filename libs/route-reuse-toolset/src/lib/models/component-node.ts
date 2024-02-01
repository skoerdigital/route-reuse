import { Type } from '@angular/core';

export interface ComponentNode {
    parent: Type<unknown>;
    children: ComponentNode[];
}
