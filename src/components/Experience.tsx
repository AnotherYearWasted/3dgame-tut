import { Environment, OrbitControls } from "@react-three/drei";
import { insertCoin, isHost, Joystick, myPlayer, onPlayerJoin, PlayerState, useMultiplayerState } from "playroomkit";
import Map from "./Map";
import { useEffect, useState } from "react";
import CharacterController from "./CharacterController";
import Bullet, { BulletProps } from "./Bullet";

interface Player {
  state: PlayerState;
  joyStick: Joystick;
}

const initialState = {
  health: "100",
  dealths: "0",
  kills: "0",
  weapon: "AK"
}

export interface BulletType extends BulletProps {
  id: string;
}

export const Experience = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [bullets, setBullets] = useState<BulletType[]>([]);
  const [networkBullets, setNetworkBullets] = useMultiplayerState<BulletType[]>("bullets", []);
  const [isLaunch, setIsLaunch] = useMultiplayerState<boolean>("isLaunch", false);

  useEffect(() => {
    setNetworkBullets(bullets);
  }, [bullets])

  const onFire = (bullet: BulletType) => {
    setBullets((bullets) => [...bullets, bullet]);
  }

  const onHit = (bulletId: string) => {
    setBullets((bullets) => bullets.filter((b) => b.id !== bulletId));
  }

  const start = async () => {

    await insertCoin();

    

  };

  useEffect(() => {
    start();

    onPlayerJoin((state: PlayerState) => {

      console.log("Player joined", state.id, state.getProfile());

      const joyStick = new Joystick(state, {
        type: "angular",
        buttons: [
          {
            id: "fire",
            label: "Fire",
          }
        ]
      });
      const newPlayer: Player = { state, joyStick };

      for (const [key, value] of Object.entries(initialState)) {
        state.setState(key, value);
      }

      setPlayers((players) => [...players, newPlayer]);

      state.onQuit(() => {
        setPlayers((players) => players.filter((p) => p.state.id !== state.id));
      })
    });

  }, []);

  return (
    <>
      <directionalLight
        position={[25, 18, -25]}
        intensity={0.3}
        castShadow
        shadow-camera-near={0}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-bias={-0.0001}
      />
      <Map />
      {players.map(({ state, joyStick }, i) => (
        <CharacterController
          onFire={onFire}
          key={`${state.id}`} // Ensure uniqueness
          playerState={state}
          joystick={joyStick}
          userPlayer={state.id === myPlayer()?.id}
          position-x={i * 2}
        />
      ))}
      {
        (isHost() ? bullets : networkBullets).map((bullet) => (
          <Bullet key={bullet.id} {...bullet} onHit={(id) => onHit(bullet.id)} />
        ))
      }
      <Environment preset="sunset" />
    </>
  );
};