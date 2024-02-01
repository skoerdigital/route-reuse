import { onAttachDetachDecoratorFactory } from './detach-attach-decorator-factory';

export function OnDetach(): MethodDecorator {
    return function (...args: []): PropertyDescriptor {
        return onAttachDetachDecoratorFactory.call(this, ...args, 'detached');
    };
}
