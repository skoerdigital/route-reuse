import { getComponentInstanceMetadata } from './get-component-instance-metadata';
import { getComponentsTree } from './get-components.tree';

export const isInSameComponentsTree = (
    // Instance of the target component where Pausable decorater is used
    targetInstance: any,
    // Instance of the component (usually parent component of component tree) which is attached to router-outlet where attached/detached event is being sent from
    notifierInstance: any
): boolean => {
    if (!targetInstance || !notifierInstance) {
        return false;
    }
    if (targetInstance === notifierInstance) {
        return true;
    }

    const componentNotifierType = getComponentInstanceMetadata(notifierInstance)?.type || null;

    if (!componentNotifierType) {
        return false;
    }

    const componentsTree = getComponentsTree(componentNotifierType);
    const findComponentInTree = (tree) => {
        let found = false;
        for (let i = 0; i < tree.children.length && !found; i++) {
            if (targetInstance instanceof tree.children[i].parent) {
                found = true;
            } else {
                findComponentInTree(tree.children[i]);
            }
        }

        return found;
    };

    return findComponentInTree(componentsTree);
};
