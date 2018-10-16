namespace paper.editor {
    /**
     * @internal
     */
    export class SphereColliderDrawer extends BaseSelectedGOComponent {
        private readonly _drawer: GameObject[] = [];

        public initialize() {
            super.initialize();
        }

        public update() {
            const selectedGameObject = super.update();
            const colliders = selectedGameObject ? selectedGameObject.getComponents(egret3d.SphereCollider) : null;

            for (let i = 0, l = Math.max(this._drawer.length, colliders ? colliders.length : 0); i < l; ++i) {
                if (i + 1 > this._drawer.length) {
                    const gameObject = EditorMeshHelper.createGameObject(`SphereCollider_${i}`);
                    EditorMeshHelper.createCircle("AxisX", egret3d.Color.YELLOW, 0.5, paper.Scene.editorScene).transform
                        .setParent(gameObject.transform);
                    EditorMeshHelper.createCircle("AxisY", egret3d.Color.YELLOW, 0.5, paper.Scene.editorScene).transform
                        .setParent(gameObject.transform).setLocalEuler(0.0, 0.0, Math.PI * 0.5);
                    EditorMeshHelper.createCircle("AxisZ", egret3d.Color.YELLOW, 0.5, paper.Scene.editorScene).transform
                        .setParent(gameObject.transform).setLocalEuler(0.0, Math.PI * 0.5, 0.0);

                    this._drawer.push(gameObject);
                }

                const drawer = this._drawer[i];

                if (!colliders || i + 1 > colliders.length) {
                    drawer.activeSelf = false;
                }
                else {
                    const collider = colliders[i];
                    if (collider.enabled) {
                        drawer.activeSelf = true;
                        drawer.transform.localPosition = egret3d.Vector3.create().copy(collider.sphere.center).applyMatrix(selectedGameObject!.transform.worldMatrix).release();
                        drawer.transform.localRotation = selectedGameObject!.transform.rotation;
                        drawer.transform.localScale = egret3d.Vector3.create().multiplyScalar(collider.sphere.radius * 2, selectedGameObject!.transform.scale).release();
                    }
                    else {
                        drawer.activeSelf = false;
                    }
                }
            }

            return selectedGameObject;
        }
    }
}