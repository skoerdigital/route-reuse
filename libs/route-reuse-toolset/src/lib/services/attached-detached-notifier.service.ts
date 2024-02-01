import { Injectable, Type } from '@angular/core';

import { Observable, Subject } from 'rxjs';

interface AttachedDetachedNotifier<T> {
    readonly attached: Subject<Type<T>>;
    readonly detached: Subject<Type<T>>;
}

@Injectable({
    providedIn: 'root',
})
export class AttachedDetachedNotifierService implements AttachedDetachedNotifier<unknown> {
    readonly detached: Subject<Type<unknown>> = new Subject();
    readonly detached$: Observable<Type<unknown>> = this.detached.asObservable();

    readonly attached: Subject<Type<unknown>> = new Subject();
    readonly attached$: Observable<Type<unknown>> = this.attached.asObservable();

    emit(action: keyof AttachedDetachedNotifier<unknown>, instance: Type<unknown>): void {
        this[action].next(instance);
    }
}
