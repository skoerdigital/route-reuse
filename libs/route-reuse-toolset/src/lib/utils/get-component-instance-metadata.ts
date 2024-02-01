import { ComponentMirror, ɵgetLContext, ɵLContext, reflectComponentType } from '@angular/core';

export const getComponentInstanceMetadata = (instance: any): ComponentMirror<unknown> => {
    const lContext: ɵLContext = ɵgetLContext(instance);
    const component = lContext.component;
    const componentProto = Object.getPrototypeOf(component);

    return reflectComponentType(componentProto.constructor);
};
