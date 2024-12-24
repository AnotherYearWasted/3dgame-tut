import { useAnimations, useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import * as THREE from "three";
import React, { useEffect, useMemo, useRef } from "react";
import { Color, LoopOnce, MeshStandardMaterial } from "three";
import { SkeletonUtils } from "three-stdlib";
import { characterGltf } from "../constant";

const WEAPONS = [
  "GrenadeLauncher",
  "AK",
  "Knife_1",
  "Knife_2",
  "Pistol",
  "Revolver",
  "Revolver_Small",
  "RocketLauncher",
  "ShortCannon",
  "SMG",
  "Shotgun",
  "Shovel",
  "Sniper",
  "Sniper_2",
];

export function CharacterSoldier({
  color = "black",
  animation = "Idle",
  weapon = "SMG",
  ...props
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, materials, animations } = useGLTF(
    characterGltf,
  );

  // Skinned meshes cannot be re-used in threejs without cloning them
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  // useGraph creates two flat object collections for nodes and materials
  const { nodes } = useGraph(clone);
  const { actions } = useAnimations(animations, group);
  if (actions["Death"]) {
    actions["Death"].loop = LoopOnce;
    actions["Death"].clampWhenFinished = true;
  }

  useEffect(() => {
    
    actions[animation]?.reset().fadeIn(0.2).play();

    return () => {
      actions[animation]?.fadeOut(0.2);
    } 
  }, [animation]);

  const playerColorMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(color),
      }),
    [color]
  );

  useEffect(() => {
    // HIDING NON-SELECTED WEAPONS
    WEAPONS.forEach((wp) => {
      const isCurrentWeapon = wp === weapon;
      nodes[wp].visible = isCurrentWeapon;
    });

    // ASSIGNING CHARACTER COLOR
    nodes.Body.traverse((child) => {
      if (child instanceof THREE.Mesh){
        if (child.material.name === "Character_Main") {
        child.material = playerColorMaterial;
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    nodes.Head.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material.name === "Character_Main") {
        child.material = playerColorMaterial;
      }
    });

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material.name === "Character_Main") {
        child.material = playerColorMaterial;
      }
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
  }, [nodes, clone]);

  return (
    <group {...props} dispose={null} ref={group}>
      <group name="Scene">
        <group name="CharacterArmature">
          <primitive object={nodes.Root} />
          <group name="Body_1">
            <skinnedMesh
              name="Cube004"
              geometry={(nodes.Cube004 as THREE.Mesh).geometry}
              material={materials.Skin}
              skeleton={(nodes.Cube004 as THREE.SkinnedMesh).skeleton}
              castShadow
            />
            <skinnedMesh
              name="Cube004_1"
              geometry={(nodes.Cube004_1 as THREE.Mesh).geometry}
              material={materials.DarkGrey}
              skeleton={(nodes.Cube004_1 as THREE.SkinnedMesh).skeleton}
              castShadow
            />
            <skinnedMesh
              name="Cube004_2"
              geometry={(nodes.Cube004_2 as THREE.Mesh).geometry}
              material={materials.Pants}
              skeleton={(nodes.Cube004_2 as THREE.SkinnedMesh).skeleton}
              castShadow
            />
            <skinnedMesh
              name="Cube004_3"
              geometry={(nodes.Cube004_3 as THREE.Mesh).geometry}
              material={playerColorMaterial}
              skeleton={(nodes.Cube004_3 as THREE.SkinnedMesh).skeleton}
              castShadow
            />
            <skinnedMesh
              name="Cube004_4"
              geometry={(nodes.Cube004_4 as THREE.Mesh).geometry}
              material={materials.Black}
              skeleton={(nodes.Cube004_4 as THREE.SkinnedMesh).skeleton}
              castShadow
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(characterGltf);
export default CharacterSoldier