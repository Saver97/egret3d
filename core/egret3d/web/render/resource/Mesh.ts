namespace egret3d {
    /**
     * 网格。
     */
    export class Mesh extends BaseMesh {
        /**
         * 创建一个网格。
         * @param vertexCount 
         * @param indexCount 
         * @param attributeNames 
         * @param attributeTypes 
         * @param drawMode 
         */
        public static create(
            vertexCount: number, indexCount: number,
            attributeNames?: gltf.MeshAttribute[] | null, attributeTypes?: { [key: string]: gltf.AccessorType } | null,
            drawMode?: gltf.DrawMode
        ): Mesh;
        public static create(config: GLTF, buffers: Uint32Array[], name: string): Mesh;
        public static create(
            vertexCountOrConfig: number | GLTF, indexCountOrBuffers?: number | Uint32Array[],
            attributeNamesOrName?: gltf.MeshAttribute[] | null | string, attributeTypes?: { [key: string]: gltf.AccessorType } | null,
            drawMode?: gltf.DrawMode
        ) {
            return new Mesh(vertexCountOrConfig as any, indexCountOrBuffers as any, attributeNamesOrName as any, attributeTypes, drawMode);
        }
        /**
         * @internal
         */
        public readonly _ibos: WebGLBuffer[] = [];
        /**
         * @internal
         */
        public _vbo: WebGLBuffer | null = null;

        public dispose() {
            if (!super.dispose()) {
                return false;
            }

            const webgl = WebGLCapabilities.webgl;
            if (webgl) {
                for (const ibo of this._ibos) {
                    webgl.deleteBuffer(ibo);
                }

                if (this._vbo) {
                    webgl.deleteBuffer(this._vbo);
                }
            }

            this._ibos.length = 0;
            this._vbo = null;

            return true;
        }

        public _createBuffer() {
            const webgl = WebGLCapabilities.webgl;
            if (this._vbo || !webgl) {
                return;
            }

            const vertexBufferViewAccessor = this.getAccessor(this._glTFMesh!.primitives[0].attributes.POSITION || 0);
            const vertexBuffer = this.createTypeArrayFromBufferView(this.getBufferView(vertexBufferViewAccessor), gltf.ComponentType.Float);
            const vbo = webgl.createBuffer();

            if (vbo) {
                this._vbo = vbo;

                const attributeNames: gltf.MeshAttribute[] = [];
                for (const k in this._glTFMesh!.primitives[0].attributes) {
                    attributeNames.push(k);
                }

                let subMeshIndex = 0;
                for (const primitive of this._glTFMesh!.primitives) {
                    if (primitive.indices !== undefined) {
                        if (this._ibos.length === subMeshIndex) {
                            const ibo = webgl.createBuffer();
                            if (ibo) {
                                this._ibos.push(ibo);
                                webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, ibo);
                                webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, this.getBufferLength(this.getAccessor(primitive.indices)), this.drawMode);
                                this.uploadSubIndexBuffer(subMeshIndex);
                            }
                            else {
                                console.error("Create webgl element buffer error.");
                            }
                        }
                        else {
                            console.error("Error arguments.");
                        }
                    }
                    else if (this._ibos.length > 0) {
                        console.error("Error arguments.");
                    }

                    subMeshIndex++;
                }

                webgl.bindBuffer(webgl.ARRAY_BUFFER, this._vbo);
                webgl.bufferData(webgl.ARRAY_BUFFER, vertexBuffer.byteLength, this.drawMode);
                this.uploadVertexBuffer(attributeNames);
            }
            else {
                console.error("Create webgl buffer error.");
            }
        }

        public uploadVertexBuffer(uploadAttributes: gltf.MeshAttribute | (gltf.MeshAttribute[]) | null = null, offset: number = 0, count: number = 0) {
            const webgl = WebGLCapabilities.webgl;
            if (!this._vbo || !webgl) {
                return;
            }

            const { attributes } = this._glTFMesh!.primitives[0];
            webgl.bindBuffer(webgl.ARRAY_BUFFER, this._vbo);

            if (!uploadAttributes) {
                uploadAttributes = [];
                for (const attributeName in this._glTFMesh!.primitives[0].attributes) {
                    uploadAttributes.push(attributeName);
                }
            }

            if (Array.isArray(uploadAttributes)) {
                for (const attributeName of uploadAttributes) {
                    const accessorIndex = attributes[attributeName];
                    if (accessorIndex !== undefined) {
                        const accessor = this.getAccessor(accessorIndex);
                        let bufferOffset = this.getBufferOffset(accessor);
                        const subVertexBuffer = this.createTypeArrayFromAccessor(accessor, offset, count);
                        if (offset > 0) {
                            var accessorTypeCount = this.getAccessorTypeCount(accessor.type);
                            bufferOffset += offset * accessorTypeCount * this.getComponentTypeCount(accessor.componentType);
                        }
                        webgl.bufferSubData(webgl.ARRAY_BUFFER, bufferOffset, subVertexBuffer);
                    }
                    else {
                        console.warn("Error arguments.");
                    }
                }
            }
            else {
                const accessorIndex = attributes[uploadAttributes];
                if (accessorIndex !== undefined) {
                    const accessor = this.getAccessor(accessorIndex);
                    const bufferOffset = this.getBufferOffset(accessor);
                    const subVertexBuffer = this.createTypeArrayFromAccessor(accessor);
                    webgl.bufferSubData(webgl.ARRAY_BUFFER, bufferOffset, subVertexBuffer);
                }
                else {
                    console.warn("Error arguments.");
                }
            }
        }

        public uploadSubIndexBuffer(subMeshIndex: number = 0) {
            const webgl = WebGLCapabilities.webgl;
            if (!this._vbo || !webgl) {
                return;
            }

            if (0 <= subMeshIndex && subMeshIndex < this._glTFMesh!.primitives.length) {
                const primitive = this._glTFMesh!.primitives[subMeshIndex];

                if (primitive.indices !== undefined) {
                    const accessor = this.getAccessor(primitive.indices);
                    const subIndexBuffer = this.createTypeArrayFromAccessor(accessor);
                    const ibo = this._ibos[subMeshIndex];
                    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, ibo);
                    webgl.bufferSubData(webgl.ELEMENT_ARRAY_BUFFER, 0, subIndexBuffer);
                }
                else {
                    console.warn("Error arguments.");
                }
            }
            else {
                console.warn("Error arguments.");
            }
        }
    }
}