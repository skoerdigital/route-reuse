import { onAttachDetachDecoratorFactory } from './detach-attach-decorator-factory';

export function OnAttach(): MethodDecorator {
    return function (...args: []): PropertyDescriptor {
        return onAttachDetachDecoratorFactory.call(this, ...args, 'attached');
    };
}
