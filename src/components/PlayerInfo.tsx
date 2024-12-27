import React from 'react'
import { myPlayer, PlayerState } from 'playroomkit'
import { Billboard, Text } from '@react-three/drei';

interface PlayerInfoProps {
  playerState: PlayerState
}

const PlayerInfo = ({
  playerState,

}: PlayerInfoProps) => {

  const health = playerState.getState("health");
  const name = playerState.getProfile().name;

  return (
    <Billboard position-y={2.5}>
      <Text position-y={0.36} fontSize={0.4}>
        {name}
        <meshBasicMaterial color={"black"} />
      </Text>

      <mesh position-z={-0.1}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>

      <mesh scale-x={health / 100} position-x={-0.5 * (1 - health / 100)}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color={myPlayer()?.id === playerState.id ? "lime" : "red"} />
      </mesh>

    </Billboard>
  )
}

export default PlayerInfo