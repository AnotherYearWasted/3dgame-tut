import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import CharacterSoldier from './CharacterSoldier';
import { Joystick, PlayerState } from 'playroomkit';
import { CapsuleCollider, RigidBody, RigidBodyProps, RigidBodyTypeString } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';

import type { RapierRigidBody } from '@react-three/rapier';

interface CharacterControllerProps {
  state: PlayerState;
  joystick: Joystick;
  userPlayer: boolean;
  [key: string]: any;
}

const MOVEMENT_SPEED = 100;

const CharacterController: React.FC<CharacterControllerProps> = ({ state, joystick, userPlayer, ...props }) => {
  const group = useRef<THREE.Group>(null);
  const character = useRef<THREE.Group>(null);
  const [animation, setAnimation] = useState('Idle');

  // const rigidbody = useRef<RapierRigidBody>(null);


  // useEffect(() => {
  //   window.addEventListener('keydown', (e) => {
  //     if (e.key === ' ') {
  //       console.log(joystick.isJoystickPressed());
  //     }
  //   })

  //   return () => {
  //     window.removeEventListener('keydown', (e) => {
  //       if (e.key === ' ') {
  //         console.log(joystick.isJoystickPressed());
  //       }
  //     })
  //   }

  // }, [])

  // useFrame((state, delta) => {
  //   const angle = joystick.angle();
  //   if (joystick.isJoystickPressed() && angle) {
  //     if (character.current) {
  //       setAnimation("Run");
  //       // console.log(angle);
  //       character.current.rotation.y = angle;
  //       const impulse = {
  //         x: Math.sin(angle) * MOVEMENT_SPEED * delta,
  //         y: 0,
  //         z: Math.cos(angle) * MOVEMENT_SPEED * delta
  //       };

  //       rigidbody.current?.applyImpulse(impulse, true);

  //     }
  //   }
  //   else {
  //     setAnimation("Idle");
  //   }
  // })

  return (


    <group ref={group} {...props}>
      {/* <RigidBody ref={rigidbody} colliders={false} linearDamping={12} lockRotations> */}
        <group ref={character}>
          <CharacterSoldier
            color={state.getProfile().color.hexString}
            animation={animation}
          />

        </group>
        {/* <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} /> */}
      {/* </RigidBody> */}
    </group>
  )
}

export default CharacterController