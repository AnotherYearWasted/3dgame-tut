import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { mapGlb } from '../constant';
import { RigidBody } from '@react-three/rapier';
useGLTF.preload(mapGlb);

const Map = () => {

  const map = useGLTF(mapGlb);

  useEffect(() => {
    map.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    })
  }, [])

  return (
    <RigidBody colliders="trimesh" type='fixed'>
      <primitive object={map.scene} />

    </RigidBody>
  )
}

export default Map