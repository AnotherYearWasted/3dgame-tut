import { Instance, InstanceProps, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { isHost } from "playroomkit";
import { useEffect, useMemo, useRef } from "react";
import { Color, MathUtils, Vector3, Vector3Like } from "three";

const bulletHitcolor = new Color("red");
bulletHitcolor.multiplyScalar(12);


const AnimatedBox = ({ scale, target, speed }: {scale: number, target: Vector3Like, speed: number}) => {
  const ref = useRef<InstanceProps>();
  useFrame((_, delta) => {
    if (ref.current) {
      if (ref.current.scale instanceof Vector3 && ref.current.scale.x > 0) {
        ref.current.scale.x =
          ref.current.scale.y =
          ref.current.scale.z -=
          speed * delta;
      }
      if (ref.current.position) {
        (ref.current.position as Vector3).lerp(target, speed);
      }
    }
  });
  return <Instance ref={ref} scale={scale} position={[0, 0, 0]} />;
};

export const BulletHit = ({ nb = 100, position, onEnded }: {nb: number, position: Vector3, onEnded: () => void}) => {
  const boxes = useMemo(
    () =>
      Array.from({ length: nb }, () => ({
        target: new Vector3(
          MathUtils.randFloat(-0.6, 0.6),
          MathUtils.randFloat(-0.6, 0.6),
          MathUtils.randFloat(-0.6, 0.6)
        ),
        scale: 0.1, //MathUtils.randFloat(0.03, 0.09),
        speed: MathUtils.randFloat(0.1, 0.3),
      })),
    [nb]
  );

  useEffect(() => {
    setTimeout(() => {
      if (isHost()) {
        onEnded();
      }
    }, 500);
  }, []);

  return (
    <group position={[position.x, position.y, position.z]}>
      <Instances>
        <boxGeometry />
        <meshStandardMaterial toneMapped={false} color={bulletHitcolor} />
        {boxes.map((box, i) => (
          <AnimatedBox key={i} {...box} />
        ))}
      </Instances>
    </group>
  );
};