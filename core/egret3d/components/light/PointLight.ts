namespace egret3d {
    const _targets = [
        new Vector3(1, 0, 0), new Vector3(- 1, 0, 0), new Vector3(0, 0, 1),
        new Vector3(0, 0, - 1), new Vector3(0, 1, 0), new Vector3(0, - 1, 0)
    ];
    const _ups = [
        new Vector3(0, 1, 0), new Vector3(0, 1, 0), new Vector3(0, 1, 0),
        new Vector3(0, 1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, - 1)
    ];
    const _viewPortsScale = [
        new Vector4(2, 1, 1, 1), new Vector4(0, 1, 1, 1), new Vector4(3, 1, 1, 1),
        new Vector4(1, 1, 1, 1), new Vector4(3, 0, 1, 1), new Vector4(1, 0, 1, 1)
    ];
    /**
     * 点光组件。
     */
    export class PointLight extends BaseLight {
        /**
         * 
         */
        @paper.serializedField
        @paper.editor.property(paper.editor.EditType.FLOAT, { minimum: 0.0 })
        public decay: number = 0.0;
        /**
         * 
         */
        @paper.serializedField
        @paper.editor.property(paper.editor.EditType.FLOAT, { minimum: 0.0 })
        public distance: number = 10.0;

        public renderTarget: BaseRenderTarget;

        public updateShadow(camera: Camera) {
            // if (!this.renderTarget) {
            //     this.renderTarget = new GlRenderTarget("PointLight", this.shadowSize * 4, this.shadowSize * 2); //   4x2  cube
            // }

            // camera.fov = Math.PI * 0.5;
            // camera.opvalue = 1.0;
            // camera.renderTarget = this.renderTarget;
            // const context = camera.context;
            // camera.calcProjectMatrix(1.0, context.matrix_p);
            // const shadowMatrix = this.shadowMatrix;
            // shadowMatrix.fromTranslate(this.gameObject.transform.position.clone().multiplyScalar(-1).release());
        }

        public updateFace(camera: Camera, faceIndex: number) {
            // TODO
            // const position = this.gameObject.transform.position.clone().release();
            // helpVector3A.set(
            //     position.x + _targets[faceIndex].x,
            //     position.y + _targets[faceIndex].y,
            //     position.z + _targets[faceIndex].z,
            // );
            // this.viewPortPixel.x = _viewPortsScale[faceIndex].x * this.shadowSize;
            // this.viewPortPixel.y = _viewPortsScale[faceIndex].y * this.shadowSize;
            // this.viewPortPixel.w = _viewPortsScale[faceIndex].z * this.shadowSize;
            // this.viewPortPixel.h = _viewPortsScale[faceIndex].w * this.shadowSize;

            // const cameraTransform = camera.gameObject.transform;
            // cameraTransform.setPosition(position); // TODO support copy matrix.
            // cameraTransform.lookAt(helpVector3A, _ups[faceIndex]);

            // // const temp = cameraTransform.getWorldMatrix().clone().release();
            // // temp.rawData[12] = -temp.rawData[12];//Left-hand
            // const context = camera.context;
            // context.matrix_v.copy(cameraTransform.worldToLocalMatrix);
            // context.matrix_vp.multiply(context.matrix_p, context.matrix_v);
            // context.updateLightDepth(this);
        }
    }
}