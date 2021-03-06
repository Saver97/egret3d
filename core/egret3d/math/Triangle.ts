namespace egret3d {
    /**
     * 三角形。
     */
    export class Triangle extends paper.BaseRelease<Triangle> implements paper.ICCS<Triangle>, paper.ISerializable, IRaycast {
        private static readonly _instances: Triangle[] = [];
        /**
         * 创建一个三角形实例。
         * @param a 点 A。
         * @param b 点 B。
         * @param c 点 C。
         */
        public static create(a: Readonly<IVector3> = Vector3.ZERO, b: Readonly<IVector3> = Vector3.ZERO, c: Readonly<IVector3> = Vector3.ZERO) {
            if (this._instances.length > 0) {
                const instance = this._instances.pop()!.set(a, b, c);
                instance._released = false;
                return instance;
            }

            return new Triangle().set(a, b, c);
        }
        /**
         * 通过三个点确定一个三角形，获取该三角形的法线。
         * @param a 点 A。
         * @param b 点 B。
         * @param c 点 C。
         * @param out 法线结果。
         */
        public static getNormal(a: Readonly<IVector3>, b: Readonly<IVector3>, c: Readonly<IVector3>, out: Vector3) {
            // out.subtract(c, b); // Right-hand coordinates system.
            out.subtract(b, c); // Left-hand coordinates system.
            out.cross(helpVector3A.subtract(a, b));

            const squaredLength = out.squaredLength;
            if (squaredLength > 0.0) {
                return out.multiplyScalar(1.0 / Math.sqrt(squaredLength));
            }

            return out.set(0.0, 0.0, 1.0);
        }
        /**
         * 点 A。
         */
        public readonly a: Vector3 = Vector3.create();
        /**
         * 点 B。
         */
        public readonly b: Vector3 = Vector3.create();
        /**
         * 点 C。
         */
        public readonly c: Vector3 = Vector3.create();
        /**
         * 请使用 `egret3d.Triangle.create()` 创建实例。
         * @see egret3d.Triangle.create()
         */
        private constructor() {
            super();
        }

        public serialize() {
            return [
                this.a.x, this.a.y, this.a.z,
                this.b.x, this.b.y, this.b.z,
                this.c.x, this.c.y, this.c.z,
            ];
        }

        public deserialize(element: Readonly<[number, number, number, number, number, number, number, number, number]>) {
            return this.fromArray(element);
        }

        public copy(value: Readonly<Triangle>) {
            return this.set(value.a, value.b, value.c);
        }

        public clone() {
            return Triangle.create(this.a, this.b, this.c);
        }

        public set(a: Readonly<IVector3> = Vector3.ZERO, b: Readonly<IVector3> = Vector3.ZERO, c: Readonly<IVector3> = Vector3.ZERO) {
            this.a.copy(a);
            this.b.copy(b);
            this.c.copy(c);

            return this;
        }

        public fromArray(array: Readonly<ArrayLike<number>>, offsetA: number = 0, offsetB: number = -1, offsetC: number = -1) {
            this.a.fromArray(array, offsetA);
            this.b.fromArray(array, offsetB >= 0 ? offsetB : offsetA + 3);
            this.c.fromArray(array, offsetC >= 0 ? offsetC : offsetA + 6);
        }
        /**
         * 获取该三角形的面积。
         */
        public getArea() {
            helpVector3A.subtract(this.c, this.b);
            helpVector3B.subtract(this.a, this.b);

            return helpVector3A.cross(helpVector3B).length * 0.5;
        }
        /**
         * 获取该三角形的中心点。
         * @param out 输出。
         */
        public getCenter(out?: Vector3) {
            if (!out) {
                out = Vector3.create();
            }

            return out.add(this.a, this.b).add(this.c).multiplyScalar(1.0 / 3.0);
        }
        /**
         * 获取该三角形的法线。
         * @param out 输出。
         */
        public getNormal(out?: Vector3) {
            if (!out) {
                out = Vector3.create();
            }

            return Triangle.getNormal(this.a, this.b, this.c, out);
        }
        /**
         * 获取一个点到该三角形的最近点。
         * @param point 一个点。
         * @param out 最近点。
         */
        public getClosestPointToPoint(point: Readonly<IVector3>, out?: Vector3): Vector3 {
            if (!out) {
                out = Vector3.create();
            }

            const vab = helpVector3A;
            const vac = helpVector3B;
            const vbc = helpVector3C;
            const vap = helpVector3D;
            const vbp = helpVector3E;
            const vcp = helpVector3F;

            const a = this.a, b = this.b, c = this.c;
            let v: number, w: number;

            // algorithm thanks to Real-Time Collision Detection by Christer Ericson,
            // published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
            // under the accompanying license; see chapter 5.1.5 for detailed explanation.
            // basically, we're distinguishing which of the voronoi regions of the triangle
            // the point lies in with the minimum amount of redundant computation.

            vab.subtract(b, a);
            vac.subtract(c, a);
            vap.subtract(point, a);
            const d1 = vab.dot(vap);
            const d2 = vac.dot(vap);
            if (d1 <= 0 && d2 <= 0) {
                // vertex region of A; barycentric coords (1, 0, 0)
                return out.copy(a);
            }

            vbp.subtract(point, b);
            const d3 = vab.dot(vbp);
            const d4 = vac.dot(vbp);
            if (d3 >= 0 && d4 <= d3) {

                // vertex region of B; barycentric coords (0, 1, 0)
                return out.copy(b);
            }

            const vc = d1 * d4 - d3 * d2;
            if (vc <= 0 && d1 >= 0 && d3 <= 0) {

                v = d1 / (d1 - d3);
                // edge region of AB; barycentric coords (1-v, v, 0)
                return out.multiplyScalar(v, vab).add(a);
            }

            vcp.subtract(point, c);
            const d5 = vab.dot(vcp);
            const d6 = vac.dot(vcp);
            if (d6 >= 0 && d5 <= d6) {

                // vertex region of C; barycentric coords (0, 0, 1)
                return out.copy(c);
            }

            const vb = d5 * d2 - d1 * d6;
            if (vb <= 0 && d2 >= 0 && d6 <= 0) {

                w = d2 / (d2 - d6);
                // edge region of AC; barycentric coords (1-w, 0, w)
                return out.multiplyScalar(w, vac).add(a);
            }

            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {

                vbc.subtract(c, b);
                w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
                // edge region of BC; barycentric coords (0, 1-w, w)
                return out.multiplyScalar(w, vbc).add(b); // edge region of BC
            }

            // face region
            const denom = 1 / (va + vb + vc);
            // u = va * denom
            v = vb * denom;
            w = vc * denom;
            return out.add(a, vac.multiplyScalar(w).add(vab.multiplyScalar(v)));
        }

        public raycast(ray: Readonly<Ray>, raycastInfo?: RaycastInfo) {
            // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h
            // const edge1 = helpVector3A;
            // const edge2 = helpVector3B;
            // const diff = helpVector3C;
            // const normal = helpVector3D;

            // edge1.subtract(p2, p1);
            // edge2.subtract(p3, p1);
            // normal.cross(edge1, edge2);

            // // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
            // // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
            // //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
            // //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
            // //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
            // let DdN = this.direction.dot(normal);
            // let sign = 1.0;

            // if (DdN > 0.0) {
            //     if (backfaceCulling) return null;
            // }
            // else if (DdN < 0.0) {
            //     sign = -1.0;
            //     DdN = -DdN;
            // }
            // else {
            //     return null;
            // }

            // diff.subtract(this.origin, p1);
            // const DdQxE2 = sign * this.direction.dot(edge2.cross(diff, edge2));
            // // b1 < 0, no intersection
            // if (DdQxE2 < 0.0) {
            //     return null;
            // }

            // const DdE1xQ = sign * this.direction.dot(edge1.cross(diff));
            // // b2 < 0, no intersection
            // if (DdE1xQ < 0.0) {
            //     return null;
            // }
            // // b1+b2 > 1, no intersection
            // if (DdQxE2 + DdE1xQ > DdN) {
            //     return null;
            // }
            // // Line intersects triangle, check if ray does.
            // const QdN = - sign * diff.dot(normal);
            // // t < 0, no intersection
            // if (QdN < 0) {
            //     return null;
            // }

            // const pickInfo = new PickInfo();
            // pickInfo.distance = QdN / DdN;
            // pickInfo.position.multiplyScalar(pickInfo.distance, this.direction).add(this.origin);
            // pickInfo.textureCoordA.x = DdQxE2;
            // pickInfo.textureCoordA.y = DdE1xQ;

            // return pickInfo;
            // TODO
            const edge1 = helpVector3A;
            const edge2 = helpVector3B;
            const pvec = helpVector3C;
            const tvec = helpVector3D;
            const qvec = helpVector3E;
            const pA = this.a;
            const pB = this.b;
            const pC = this.c;

            edge1.subtract(pB, pA);
            edge2.subtract(pC, pA);
            pvec.cross(ray.direction, edge2);

            const det = pvec.dot(edge1);
            if (det === 0.0) {
                return false;
            }

            const invdet = 1.0 / det;
            tvec.subtract(ray.origin, pA);

            const bu = pvec.dot(tvec) * invdet;
            if (bu < 0.0 || bu > 1.0) {
                return false;
            }

            qvec.cross(tvec, edge1);

            const bv = qvec.dot(ray.direction) * invdet;
            if (bv < 0.0 || bu + bv > 1.0) {
                return false;
            }

            if (raycastInfo) {
                raycastInfo.textureCoordA.x = bu;
                raycastInfo.textureCoordA.y = bv;
                ray.getPointAt(raycastInfo.distance = qvec.dot(edge2) * invdet, raycastInfo.position);
                
                if (raycastInfo.normal) {
                    this.getNormal(raycastInfo.normal);
                }
            }

            return true;
        }
    }
}