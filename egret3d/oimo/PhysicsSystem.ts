namespace egret3d.oimo {
    /**
     * 
     */
    export class PhysicsSystem extends paper.BaseSystem<Rigidbody>{
        /**
         * 
         */
        public static readonly instance: PhysicsSystem;
        /**
         * @internal
         */
        public static readonly _helpTransform: OIMO.Transform = new OIMO.Transform();

        protected readonly _interests = [
            {
                componentClass: Rigidbody
            },
            {
                componentClass: [BoxCollider as any, SphereCollider], isUnessential: true
            },
            {
                componentClass: [HingeJoint, ConeTwistJoint], isUnessential: true
            }
        ];
        private readonly _gravity = new Vector3(0, -9.80665, 0);
        private readonly _rayCastClosest: OIMO.RayCastClosest = new OIMO.RayCastClosest();
        private readonly _shapes: Collider[] = [];
        private readonly _joints: Joint<any>[] = [];
        private _oimoWorld: OIMO.World = null as any;
        /**
         * @internal
         */
        public _initializeRigidbody(gameObject: paper.GameObject) {
            const rigidbody = this._getComponent(gameObject, 0) as Rigidbody;

            for (const shape of gameObject.getComponents(Collider as any, true) as Collider[]) {
                rigidbody.oimoRigidbody.addShape(shape.oimoShape);
                rigidbody._updateMass(rigidbody.oimoRigidbody);
            }

            // 子物体的transform？ TODO
        }

        public rayCast(from: Readonly<IVector3>, to: Readonly<IVector3>, mask: paper.CullingMask = paper.CullingMask.Everything, raycastInfo?: RaycastInfo) {
            const rayCastClosest = this._rayCastClosest;
            rayCastClosest.clear(); // TODO mask.

            this._oimoWorld.rayCast(
                from as any, to as any,
                rayCastClosest
            );

            if (rayCastClosest.hit) {
                raycastInfo = raycastInfo || new RaycastInfo();
                raycastInfo.clean();
                raycastInfo.distance = Vector3.getDistance(from, to) * rayCastClosest.fraction;
                raycastInfo.position.copy(rayCastClosest.position);
                raycastInfo.normal.copy(rayCastClosest.normal);
                raycastInfo.rigidbody = rayCastClosest.shape.getRigidBody().userData;
                raycastInfo.collider = rayCastClosest.shape.userData;

                return raycastInfo;
            }

            return null;
        }

        public onAwake() {
            (PhysicsSystem as any).instance = this;

            this._oimoWorld = new OIMO.World();
            this._oimoWorld.setGravity(this._gravity as any);
        }

        public onAddGameObject(gameObject: paper.GameObject) {
            const rigidbody = this._getComponent(gameObject, 0) as Rigidbody;
            const position = gameObject.transform.getPosition();
            const quaternion = gameObject.transform.getRotation();
            const oimoTransform = PhysicsSystem._helpTransform;
            oimoTransform.setPosition(position as any);
            oimoTransform.setOrientation(quaternion as any);
            rigidbody.oimoRigidbody.setTransform(oimoTransform);

            for (const shape of gameObject.getComponents(Collider as any, true) as Collider[]) {
                rigidbody.oimoRigidbody.addShape(shape.oimoShape);
                rigidbody._updateMass(rigidbody.oimoRigidbody);
            }

            this._oimoWorld.addRigidBody(rigidbody.oimoRigidbody);
        }

        public onAddComponent(component: Collider | Joint<any>) {
            if (!this._hasGameObject(component.gameObject)) {
                return;
            }

            if (component instanceof Collider) {
                if (this._shapes.indexOf(component) < 0) {
                    this._shapes.push(component);
                }
            }
            else {
                if (this._joints.indexOf(component) < 0) {
                    this._joints.push(component);
                }
            }
        }

        public onUpdate() {
            //
            if (this._shapes.length > 0) {
                for (const shape of this._shapes) {
                    const rigidbody = this._getComponent(shape.gameObject, 0) as Rigidbody;
                    rigidbody.oimoRigidbody.addShape(shape.oimoShape);
                    rigidbody._updateMass(rigidbody.oimoRigidbody);
                }

                this._shapes.length = 0;
            }
            //
            if (this._joints.length > 0) {
                for (const joint of this._joints) {
                    this._oimoWorld.addJoint(joint.oimoJoint);
                }

                this._joints.length = 0;
            }
            //
            this._oimoWorld.step(paper.Time.deltaTime);

            //
            const oimoTransform = PhysicsSystem._helpTransform;

            for (let i = 0, l = this._components.length; i < l; i += this._interestComponentCount) {
                const rigidbody = this._components[i + 0] as Rigidbody;
                const transform = rigidbody.gameObject.transform;
                const oimoRigidbody = rigidbody.oimoRigidbody;

                switch (rigidbody.type) {
                    case RigidbodyType.DYNAMIC:
                        if (oimoRigidbody.isSleeping()) {
                        }
                        else {
                            oimoRigidbody.getTransformTo(oimoTransform);
                            oimoTransform.getPositionTo(helpVector3A as any);
                            oimoTransform.getOrientationTo(helpVector4A as any);
                            transform.setPosition(helpVector3A);
                            transform.setRotation(helpVector4A);
                        }
                        break;

                    case RigidbodyType.KINEMATIC:
                        if (oimoRigidbody.isSleeping()) {
                        }
                        else {
                            const position = transform.getPosition();
                            const quaternion = transform.getRotation();
                            oimoTransform.setPosition(position as any);
                            oimoTransform.setOrientation(quaternion as any);
                            oimoRigidbody.setTransform(oimoTransform);
                            oimoRigidbody.sleep();
                        }
                        break;

                    case RigidbodyType.STATIC:
                        break;
                }
            }
        }

        public onRemoveGameObject(gameObject: paper.GameObject) {
            const rigidbody = this._getComponent(gameObject, 0) as Rigidbody;
            this._oimoWorld.removeRigidBody(rigidbody.oimoRigidbody);

            // TODO remove joint
        }

        public onRemoveComponent(component: Collider | Joint<any>) {
            const rigidbody = this._getComponent(component.gameObject, 0) as Rigidbody | null;
            if (!rigidbody) {
                return;
            }

            if (component instanceof Collider) {
                const index = this._shapes.indexOf(component);
                if (index >= 0) {
                    this._shapes.splice(index, 1);
                }
                else { // TODO has shape and created oimo shape.
                    rigidbody.oimoRigidbody.removeShape(component.oimoShape);
                }
            }
            else {
                const index = this._joints.indexOf(component);
                if (index >= 0) {
                    this._joints.splice(index, 1);
                }
                else { // TODO has joint and created oimo joint.
                    this._oimoWorld.removeJoint(component.oimoJoint);
                }
            }
        }

        public onDestroy() {
            // TODO remove listener
        }
        /**
         * 
         */
        public get gravity() {
            return this._gravity;
        }
        public set gravity(value: Readonly<IVector3>) {
            this._gravity.copy(value);
            this._oimoWorld.setGravity(this._gravity as any);
        }
    }
}