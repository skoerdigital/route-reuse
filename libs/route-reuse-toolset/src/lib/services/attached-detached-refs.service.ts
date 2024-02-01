import { Injectable } from '@angular/core';

import { MethodComoponentRefType, MethodComponentRef } from '../models';

@Injectable({
    providedIn: 'root',
})
export class AttachedDetachedMethodComoponentRefsService {
    private _attachedRefs: MethodComponentRef[] = [];
    private _detachedRefs: MethodComponentRef[] = [];

    get attachedMethodCompRefs(): MethodComponentRef[] {
        return this._attachedRefs;
    }
    get detachedMethodCompRefs(): MethodComponentRef[] {
        return this._detachedRefs;
    }

    add(type: MethodComoponentRefType, ref: MethodComponentRef): void {
        const refsPerType: Record<MethodComoponentRefType, MethodComponentRef[]> = {
            attached: this._attachedRefs,
            detached: this._detachedRefs,
        };

        if (refsPerType[type].some(({ instance }) => instance === ref.instance)) {
            return;
        }

        refsPerType[type].push(ref);
    }
}
