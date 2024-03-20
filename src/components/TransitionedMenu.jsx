import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
	Scroll,
	ScrollControls,
	Text,
	useCamera,
	useScroll,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { Raycaster, Vector3 } from "three";

const boxQuantity = 60;
const boxWidth = 2.5;
const boxHeight = 2.5;
const boxPadding = 1.1;

export const useForwardRaycast = (obj) => {
	const raycaster = useMemo(() => new Raycaster(), []);
	const pos = useMemo(() => new Vector3(), []);
	const dir = useMemo(() => new Vector3(), []);
	const scene = useThree((state) => state.scene);

	return () => {
		if (!obj.current) return [];

		raycaster.set(
			obj.current.getWorldPosition(pos),
			obj.current.getWorldDirection(dir)
		);

		return raycaster.intersectObjects(scene.children);
	};
};

const MenuItem = ({ idx, itemsRefArray }) => {
	function handleItemClick() {
		// handleItemClick
		console.log("handleItemClick");
	}

	return (
		<group
			onClick={handleItemClick}
			// Minus idx - to reverse items (0 -> N)
			position={[0, -idx * boxHeight * boxPadding, 0]}
			ref={(element) => itemsRefArray.current.push(element)}
		>
			<mesh name={`menu_item_${idx}`}>
				<boxGeometry args={[boxWidth, boxHeight, 0]} />
				<meshBasicMaterial color="#000" />
				<Text key={idx} position={[0, 0, 0.1]} scale={0.2}>
					Menu Item {idx}
				</Text>
			</mesh>
		</group>
	);
};

const Items = () => {
	const tl = useRef();
	const itemsRefArray = useRef(new Array());

	const scroll = useScroll();

	useFrame(() => {
		scroll && tl.current.seek(scroll.offset * tl.current.duration());
	});

	useGSAP(() => {
		// Scrolling Effect, moving each elemeny Y position
		tl.current = gsap.timeline();
		if (itemsRefArray.current.length === 0) return;
		itemsRefArray.current.forEach((elmRef, index) => {
			if (!elmRef) return;

			tl.current.from(
				elmRef.position,
				{
					duration: 0.25,
					y: `-=${boxQuantity * boxHeight}`,
				},
				0
			);

			// elmRef.children[0].material.opacity = index / 1000;
		});
	}, [itemsRefArray]);

	return (
		<group position={[0, 0, 0]}>
			{Array.from({ length: boxQuantity }).map((_, idx) => (
				<MenuItem key={idx} idx={idx} itemsRefArray={itemsRefArray} />
			))}
		</group>
	);
};

export const TransitionedMenu = () => {
	// const { camera, scene } = useThree();
	// camera.position.set(-2.1, 1.1, 6);

	const enterAnimraycastObjectRef = useRef(null);
	const exitRaycastTopRef = useRef(null);
	const exitRaycastBottomRef = useRef(null);

	const enterRaycast = useForwardRaycast(enterAnimraycastObjectRef);
	const exitRaycastTop = useForwardRaycast(exitRaycastTopRef);
	const exitRaycastBottom = useForwardRaycast(exitRaycastBottomRef);

	useFrame((state, delta) => {
		const enterIntersects = enterRaycast();
		const exitIntersectsTop = exitRaycastTop();
		const exitIntersectsBottom = exitRaycastBottom();

		if (enterIntersects.length > 0) {
			const intersectingObject = enterIntersects[0].object;

			intersectingObject &&
				gsap.to(intersectingObject.position, {
					duration: 0.25,
					x: intersectingObject.position.x + 1,
				});
		}

		if (exitIntersectsTop.length > 0) {
			const intersectingObject = exitIntersectsTop[0].object;

			intersectingObject &&
				gsap.to(intersectingObject.position, {
					duration: 0.25,
					x: 0,
				});
		}

		if (exitIntersectsBottom.length > 0) {
			const intersectingObject = exitIntersectsBottom[0].object;

			intersectingObject &&
				gsap.to(intersectingObject.position, {
					duration: 0.25,
					x: 0,
				});
		}
	});

	return (
		<group position={[0, 0, 0]}>
			{/* Enter Anim - Raycast Detection Object */}
			<mesh position={[-1, 0, 0]} ref={enterAnimraycastObjectRef}>
				<boxGeometry args={[0.6, 0.2, 0.1]} />
				<meshBasicMaterial visible={true} />
			</mesh>
			{/* Exit Anim - Raycast Detection Object */}
			<mesh position={[1, boxHeight, 0]} ref={exitRaycastTopRef}>
				<boxGeometry args={[0.6, 0.2, 0.1]} />
				<meshBasicMaterial visible={true} />
			</mesh>
			<mesh position={[1, -boxHeight, 0]} ref={exitRaycastBottomRef}>
				<boxGeometry args={[0.6, 0.2, 0.1]} />
				<meshBasicMaterial visible={true} />
			</mesh>

			{/* TODO: figure out why scrolling group are positioned low */}
			<ScrollControls position={[0, 0, 0]}>
				<Scroll>
					<Items />
				</Scroll>
			</ScrollControls>
			{/* Not sure about the Y number - items should start at top, for now its Constant */}
			{/* <group position={[0, 150, 0]}>
				<ScrollControls
					infinite={false}
					pages={boxQuantity / 4}
					distance={0.2}
					damping={0.15}
					// ScrollBar frame style
					style={{
						opacity: 0.5,
					}}
				>
					<Items />
				</ScrollControls>
			</group> */}
		</group>
	);
};
