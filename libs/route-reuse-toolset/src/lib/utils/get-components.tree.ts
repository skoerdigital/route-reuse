import { Type } from '@angular/core';

import { CMP_KEY, ComponentNode } from '../models';

const getComponentsNode = (parent: Type<unknown>) => {
    if (!parent) {
        throw new Error('No parent provided');
    }

    const componentsNode: ComponentNode = {
        parent,
        children: [],
    };

    const children = (parent[CMP_KEY]?.tView?.directiveRegistry || [])
        .map((tView) => {
            if (tView['type'] && CMP_KEY in tView['type']) {
                return tView['type'];
            }
        })
        .filter((comp) => !!comp);

    return {
        ...componentsNode,
        children,
    };
};

export const getComponentsTree = (parent: Type<unknown>): ComponentNode => {
    const componentsNode = getComponentsNode(parent);

    for (let i = 0; i < componentsNode.children.length; i++) {
        componentsNode.children[i] = getComponentsTree(componentsNode.children[i]);
    }

    return componentsNode;
};
