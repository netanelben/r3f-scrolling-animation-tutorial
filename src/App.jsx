import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useCamera } from "@react-three/drei";
import { TransitionedMenu } from "./components/TransitionedMenu";
import { useEffect } from "react";
import "./App.css";
import * as THREE from "three";

function App() {
	return (
		<Canvas>
			<ambientLight intensity={1} />

			<OrbitControls
			// enableZoom={false}
			// enablePan={false}
			// enableRotate={false}
			/>

			<TransitionedMenu />
		</Canvas>
	);
}

export default App;
