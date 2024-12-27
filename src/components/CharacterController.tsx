import { isHost, Joystick, PlayerState } from "playroomkit";
import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";
import CharacterSoldier from "./CharacterSoldier";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { CameraControlsProps } from "@react-three/drei";
import { CameraControls } from "@react-three/drei";
import { BulletData, BulletProps } from "./Bullet";
import Crosshair from "./Crosshair";
import { BulletType } from "./Experience";
import PlayerInfo from "./PlayerInfo";

const MOVEMENT_SPEED = 100;
const FIRE_RATE = 380;

export const WEAPON_OFFSET = new THREE.Vector3(
  -0.2,
  1.4,
  0.8
);

interface CharacterControllerProps {
  playerState: PlayerState,
  joystick: Joystick,
  userPlayer: boolean,
  onFire: (bullet: BulletType) => void,
  onKilled: (playerId: string, fromPlayerId: string) => void,
  [key: string]: any
}

const CharacterController = ({
  playerState,
  joystick,
  userPlayer,
  onFire,
  onKilled,
  ...props
}: CharacterControllerProps) => {

  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const [animation, setAnimation] = useState("Idle");
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const cameraControlsRef = useRef<CameraControls>(null);
  const scene = useThree((state) => state.scene);

  const spawnRandomly = () => {
    const spawns = [];
    for (let i = 0; i < 1000; ++i) {
      const spawn = scene.getObjectByName(`spawn_${i}`);
      if (spawn) {
        spawns.push(spawn);
      }
      else {
        break;
      }
    }

    const spawnPos: THREE.Vector3 = spawns[Math.floor(Math.random() * spawns.length)].position;

    rigidBodyRef.current?.setTranslation(spawnPos, true);
  }


  useEffect(() => {
    if (isHost()) {
      spawnRandomly();
    }
  }, []);

  useFrame((state, delta) => {

    if (cameraControlsRef.current) {
      const cameraDistanceY = window.innerWidth < 1024 ? 16 : 20;
      const cameraDistanceZ = window.innerHeight < 1024 ? 12 : 16;
      const playerWorldPosition = rigidBodyRef.current?.translation();
      const playerWorldAngle = characterRef.current?.rotation.y;

      if (playerWorldPosition) {
        cameraControlsRef.current.setLookAt(
          playerWorldPosition.x,
          playerWorldPosition.y + cameraDistanceY,
          playerWorldPosition.z + cameraDistanceZ,
          playerWorldPosition.x,
          playerWorldPosition.y + 1.5,
          playerWorldPosition.z
        )
      }
    }

    if (playerState.getState("dead")) {
      setAnimation("Death");
      return
    }

    if (joystick.isJoystickPressed()) {
      const angle = joystick.angle();

      setAnimation("Run");
      characterRef.current?.rotation.set(0, angle, 0);

      const impulse: THREE.Vector3 = new THREE.Vector3(
        Math.sin(angle) * MOVEMENT_SPEED * delta,
        0,
        Math.cos(angle) * MOVEMENT_SPEED * delta,
      )

      rigidBodyRef.current?.applyImpulse(impulse, true);


    }
    else {
      setAnimation("Idle");
    }
    if (isHost()) {
      playerState.setState("pos", rigidBodyRef.current?.translation());
    }
    else {
      const pos = playerState.getState("pos");
      if (pos) {
        rigidBodyRef.current?.setTranslation(pos, true);
      }
    }

    if (joystick.isPressed("fire")) {
      setAnimation("Idle_Shoot");
      if (isHost()) {
        if (Date.now() - (playerState.getState("lastShot") as number || 0) > FIRE_RATE) {
          playerState.setState("lastShot", Date.now());
          if (rigidBodyRef.current && characterRef.current) {

            const bullet: BulletType = {
              id: Math.random().toString(),
              fromPlayerId: playerState.id,
              position: new THREE.Vector3(rigidBodyRef.current.translation().x, rigidBodyRef.current.translation().y, rigidBodyRef.current.translation().z),
              angle: characterRef.current.rotation.y,
              onHit: (bulletId) => {
                console.log("Bullet hit", bulletId);
              }
            }

            onFire(bullet);

          }
        }
      }
    }

  });

  return (
    <group ref={groupRef} {...props}>
      {
        userPlayer && (
          <CameraControls ref={cameraControlsRef} />
        )
      }
      <RigidBody colliders={false} ref={rigidBodyRef} linearDamping={12} lockRotations type={
        isHost() ? "dynamic" : "kinematicPosition"
      }
        onIntersectionEnter={({ other }) => {
          const bulletData = other.rigidBody?.userData as BulletData;
          if (isHost() && bulletData && playerState.getState("health") > 0) {

            const newHealth = playerState.getState("health") - bulletData.damage;

            if (newHealth <= 0) {
              playerState.setState("health", 0);
              playerState.setState("dealths", parseInt(playerState.getState("dealths")) + 1);
              playerState.setState("dead", true);
              rigidBodyRef.current?.setEnabled(false);
              setTimeout(() => {
                spawnRandomly();
                rigidBodyRef.current?.setEnabled(true);
                playerState.setState("dead", false);
                playerState.setState("health", 100);
              }, 2000);
              onKilled(playerState.id, bulletData.fromPlayerId);
            }
            else {
              playerState.setState("health", newHealth);
            }

          }
        }}
      >
        <PlayerInfo playerState={playerState} />
        <group ref={characterRef}>
          <CharacterSoldier
            color={"black"}
            animation={animation}
          />
          {userPlayer && <Crosshair position={WEAPON_OFFSET} />}
        </group>
        <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} />
      </RigidBody>
    </group>
  )
}

export default CharacterController