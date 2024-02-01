import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Injector, OnDestroy, Pipe, PipeTransform } from '@angular/core';

import { merge, Observable, Subscription } from 'rxjs';
import { distinctUntilKeyChanged, filter, map, tap } from 'rxjs/operators';

import { RouteReuseState } from '../models';
import { AttachedDetachedNotifierService } from '../services';
import { isInSameComponentsTree, pauseSubscription, resumeSubscription } from '../utils';

interface RouteNotifier {
    instance: any;
    state: RouteReuseState;
}

@Pipe({ name: 'pausableAsync', pure: false })
export class PausableAsync implements PipeTransform, OnDestroy {
    private asyncPipe: AsyncPipe;
    private prevObservable$: Observable<unknown> = null;
    private routeNotifiers$: Observable<RouteNotifier> = merge(
        this.notifierService.attached$.pipe(
            map(
                (instance) =>
                    ({
                        instance,
                        state: 'attached',
                    } as RouteNotifier)
            )
        ),
        this.notifierService.detached$.pipe(
            map(
                (instance) =>
                    ({
                        instance,
                        state: 'detached',
                    } as RouteNotifier)
            )
        )
    );
    private subscription: Subscription = null;

    constructor(private notifierService: AttachedDetachedNotifierService, private injector: Injector) {
        this.asyncPipe = new AsyncPipe(this.injector.get(ChangeDetectorRef));
    }
    // Parent component instance reference
    get context(): any {
        return this.asyncPipe['_ref'].context;
    }

    ngOnDestroy(): void {
        this.asyncPipe.ngOnDestroy();
        this.subscription.unsubscribe();
    }

    private subscribeRouteNotifiers(attachedCallback: () => void, detachedCallback: () => void): boolean {
        const sub = this.routeNotifiers$
            .pipe(
                distinctUntilKeyChanged('state'),
                filter(({ instance }) => isInSameComponentsTree(this.context, instance)),
                tap(({ state }) => {
                    const cbPerState: Record<RouteReuseState, () => void> = {
                        attached: attachedCallback,
                        detached: detachedCallback,
                    };

                    cbPerState[state]();
                })
            )
            .subscribe();

        this.subscription.add(sub);

        return true;
    }

    transform<T>(observable$: Observable<T>): T {
        const result = this.asyncPipe.transform(observable$);
        this.subscription = this.subscription || new Subscription();

        if (this.prevObservable$ !== observable$) {
            const subscriber = this.asyncPipe['_subscription'];
            this.subscribeRouteNotifiers(
                () => resumeSubscription(subscriber),
                () => {
                    pauseSubscription(subscriber);
                }
            );
        }

        this.prevObservable$ = observable$;

        return result;
    }
}
