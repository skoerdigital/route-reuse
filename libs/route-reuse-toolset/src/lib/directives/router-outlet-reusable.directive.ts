import { ComponentRef, Directive, Type } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { ComponentNode, MethodComoponentRefType, MethodComponentRef } from '../models';
import { AttachedDetachedMethodComoponentRefsService, AttachedDetachedNotifierService } from '../services';
import { getComponentInstanceMetadata, getComponentsTree } from '../utils';

@Directive({
    selector: '[mdspcReusable]',
})
export class RouterOutletReusableDirective {
    constructor(
        private readonly notifierService: AttachedDetachedNotifierService,
        private readonly methodComponentRefsService: AttachedDetachedMethodComoponentRefsService,
        private readonly routerOutlet: RouterOutlet
    ) {
        this.overrideOutletMethods();
    }

    private static createAndgetComponentsTree(instance: object): ComponentNode {
        const componentType = getComponentInstanceMetadata(instance)?.type || null;

        return getComponentsTree(componentType);
    }

    private runOnComponentsTree(componentsTree: ComponentNode, action: MethodComoponentRefType): void {
        const refsKeyNamePerAction: Record<MethodComoponentRefType, MethodComponentRef[]> = {
            detached: this.methodComponentRefsService.detachedMethodCompRefs,
            attached: this.methodComponentRefsService.attachedMethodCompRefs,
        };

        refsKeyNamePerAction[action].forEach(({ instance, methodName }) => {
            if (instance instanceof componentsTree.parent) {
                setTimeout(() => instance[methodName].call(instance), 500);
            }
        });

        const runOnComponentsNode = (compsNode: ComponentNode) => {
            for (let i = 0; i < compsNode.children.length; i++) {
                refsKeyNamePerAction[action].forEach(({ instance, methodName }) => {
                    if (instance instanceof compsNode.children[i].parent) {
                        instance[methodName].call(instance);
                    }
                });
                runOnComponentsNode(compsNode.children[i]);
            }
        };

        runOnComponentsNode(componentsTree);
    }

    private overrideOutletMethods(): void {
        const originalAttachFn = this.routerOutlet.attach;

        this.routerOutlet.attach = (ref: ComponentRef<unknown>, activatedRoute: ActivatedRoute): void => {
            originalAttachFn.bind(this.routerOutlet)(ref, activatedRoute);
            const instance = this.routerOutlet.component as Type<unknown>;
            const tree = RouterOutletReusableDirective.createAndgetComponentsTree(instance);
            this.runOnComponentsTree(tree, 'attached');

            this.notifierService.emit('attached', instance);
        };

        const originalDetachFn = this.routerOutlet.detach;

        this.routerOutlet.detach = (): ComponentRef<unknown> => {
            const instance = this.routerOutlet.component as Type<unknown>;
            RouterOutletReusableDirective.createAndgetComponentsTree(instance);
            const tree = RouterOutletReusableDirective.createAndgetComponentsTree(instance);
            this.runOnComponentsTree(tree, 'detached');

            this.notifierService.emit('detached', instance);
            return originalDetachFn.bind(this.routerOutlet)();
        };
    }
}
