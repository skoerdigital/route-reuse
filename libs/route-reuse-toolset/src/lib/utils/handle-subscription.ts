import { Subscriber } from 'rxjs';

import { FINALIZERS_KEY, IS_STOPPED_KEY, PREV_IS_STOPPED_KEY } from '../models';

export const pauseSubscription = (subscriber: Subscriber<unknown>) => {
    if (subscriber[FINALIZERS_KEY]) {
        if (IS_STOPPED_KEY in subscriber) {
            subscriber[PREV_IS_STOPPED_KEY] = subscriber[IS_STOPPED_KEY];
            subscriber[IS_STOPPED_KEY] = true;
        }
        subscriber[FINALIZERS_KEY].forEach((sub) => pauseSubscription(sub));
    }
};

export const resumeSubscription = (subscriber: Subscriber<unknown>) => {
    if (subscriber[FINALIZERS_KEY]) {
        if (IS_STOPPED_KEY in subscriber) {
            subscriber[IS_STOPPED_KEY] = subscriber[PREV_IS_STOPPED_KEY];
        }
        subscriber[FINALIZERS_KEY].forEach((sub) => resumeSubscription(sub));
    }
};
