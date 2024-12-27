import { RapierRigidBody, RigidBody } from '@react-three/rapier';
import React, { useEffect } from 'react';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { WEAPON_OFFSET } from './CharacterController';
import { isHost } from 'playroomkit';

const BULLET_SPEED = 20;

export interface BulletProps {
  fromPlayerId: string,
  position: Vector3,
  angle: number,
  onHit: (bulletId: string) => void,
}

export interface BulletData {
  type: "bullet",
  fromPlayerId: string,
  damage: number
}

const Bullet = ({
  fromPlayerId,
  position,
  angle,
  onHit
}: BulletProps) => {

  const rigidBodyRef = React.useRef<RapierRigidBody>(null);

  const bulletMaterial = new THREE.MeshStandardMaterial({
    color: "hotpink",
    toneMapped: false
  });

  bulletMaterial.color.multiplyScalar(42);

  useEffect(() => {
    const velocity = {
      x: Math.sin(angle) * BULLET_SPEED,
      y: 0,
      z: Math.cos(angle) * BULLET_SPEED
    };

    rigidBodyRef.current?.setLinvel(velocity, true);

  }, [])

  return (
    <group position={[position.x, position.y, position.z]} rotation-y={angle}>
      <group position={WEAPON_OFFSET}>
        <RigidBody ref={rigidBodyRef} gravityScale={0} sensor onIntersectionEnter={(e) => {
          const userData = e.other.rigidBody?.userData as BulletData;
          if (isHost() && userData?.type !== 'bullet') {
            rigidBodyRef.current?.setEnabled(false);
            onHit("");
          }
        }}
          userData={
            {
              type: 'bullet',
              fromPlayerId: fromPlayerId,
              damage: 10
            } as BulletData
          }>
          <mesh position-z={0.25} material={bulletMaterial} castShadow>
            <boxGeometry args={[0.05, 0.05, 0.5]} />
          </mesh>
        </RigidBody>

      </group>
    </group>
  )
}

export default Bullet