import { Environment, OrbitControls } from "@react-three/drei";
import { ButtonOptions, insertCoin, Joystick, myPlayer, onPlayerJoin, PlayerState } from "playroomkit";
import Map from "./Map";
import { useEffect, useState } from "react";
import CharacterController from "./CharacterController";
import { Physics } from "@react-three/rapier";

export const Experience = () => {

  const [players, setPlayers] = useState<{ state: PlayerState; joyStick: Joystick }[]>([]);
  console.log(players)
  const start = async () => {
    await insertCoin();
  }

  useEffect(() => {
    start();
  
    onPlayerJoin((state) => {
      const joyStick = new Joystick(state, {
        type: "angular",
        buttons: [{ id: "fire", label: "Fire" }],
      });
  
      const newPlayer = { state, joyStick };
      state.setState("health", 100);
      state.setState("death", 0);
      state.setState("kills", 0);
  
      setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  
      state.onQuit(() => {
        setPlayers((prevPlayers) =>
          prevPlayers.filter((player) => player.state.id !== state.id)
        );
      });
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
      <OrbitControls />
      <Map />
      {
        players.map(({ state, joyStick }, i) => {
          return (
            <CharacterController
              key={state.id}
              state={state}
              joystick={joyStick}
              userPlayer={state.id === myPlayer()?.id}
              position-x={i * 2}
            />
          )
        })
      }
      <Environment preset="sunset" />
    </>
  );
};
