/// <reference types="vite/client" />

declare module '*.gltf' {
  const src: string
  export default src
}

declare module '*.glb' {
  const src: string
  export default src
}

declare module '*.json' {
  const value: any
  export default value
}