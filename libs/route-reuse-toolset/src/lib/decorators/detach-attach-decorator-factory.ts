import { MethodComoponentRefType } from '../models';
import { AttachedDetachedMethodComoponentRefsService } from '../services';

export function onAttachDetachDecoratorFactory(
    target: object,
    methodName: string | symbol,
    descriptor: PropertyDescriptor,
    type: MethodComoponentRefType
): PropertyDescriptor {
    const ngOnInitProto = target['ngOnInit'];
    const getMethodComoponentRefsService = () =>
        import('../route-reuse.module').then(
            (m) =>
                m.RouteReuseModule.injector &&
                m.RouteReuseModule.injector.get(AttachedDetachedMethodComoponentRefsService)
        );

    target['ngOnInit'] = async function (...args: any[]) {
        if (ngOnInitProto) {
            ngOnInitProto.call(this, args);
        }

        const methodComoponentRefsService = await getMethodComoponentRefsService();
        methodComoponentRefsService.add(type, { instance: this, methodName });
    };

    return descriptor;
}
