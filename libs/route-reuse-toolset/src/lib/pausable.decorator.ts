import { Subscriber, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AttachedDetachedNotifierService } from './services';
import { isInSameComponentsTree, pauseSubscription, resumeSubscription } from './utils';

const subscribeNotifiers = async (
    attachedCallback: () => void,
    detachedCallback: () => void,
    componentInstance: any,
    notifiersSubscription: Subscription
) => {
    if (!notifiersSubscription) {
        return;
    }

    const notfierService = await import('./route-reuse.module').then(
        (m) => m.RouteReuseModule.injector && m.RouteReuseModule.injector.get(AttachedDetachedNotifierService)
    );

    const attachedNotifier$ = notfierService.attached$;
    const detachedNotifier$ = notfierService.detached$;

    if (!notifiersSubscription) {
        notifiersSubscription = new Subscription();
    }

    notifiersSubscription.add(
        attachedNotifier$
            .pipe(filter((instance) => isInSameComponentsTree(componentInstance, instance)))
            .subscribe(attachedCallback)
    );
    notifiersSubscription.add(
        detachedNotifier$
            .pipe(filter((instance) => isInSameComponentsTree(componentInstance, instance)))
            .subscribe(detachedCallback)
    );
};

export function Pausable(): PropertyDecorator {
    return function (target: any, key: string) {
        let notifiersSubscription = null;
        let subscription: Subscription = new Subscription();
        const onDestroyProto = target?.ngOnDestroy;
        const onInitProto = target?.ngOnInit;
        const nullChecker = (instance: any) => {
            componentInstance = componentInstance || instance;
            subscription = subscription || new Subscription();
            notifiersSubscription = notifiersSubscription || new Subscription();
        };

        let componentInstance = null;

        Object.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get(): Subscription {
                nullChecker(this);
                return subscription;
            },
            set() {
                nullChecker(this);

                const originalAdd = subscription.add;

                subscription.add = function (subscriber) {
                    subscribeNotifiers(
                        () => resumeSubscription(subscriber as Subscriber<unknown>),
                        () => pauseSubscription(subscriber as Subscriber<unknown>),
                        componentInstance,
                        notifiersSubscription
                    );

                    return originalAdd.call(this, subscriber);
                };
            },
        });

        if (onDestroyProto) {
            target.ngOnDestroy = function () {
                onDestroyProto.call(this);
                notifiersSubscription?.unsubscribe?.();

                if (!subscription.closed) {
                    subscription?.unsubscribe?.();
                }
                subscription = null;
                notifiersSubscription = null;
                componentInstance = null;
            };
        }

        if (onInitProto) {
            target.ngOnInit = function () {
                onInitProto.call(this);
            };
        }
    };
}
