<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import gsap from 'gsap';

	let { index, texture, hovered, width, height, onenter, onleave, onclick } = $props<{
		index: number;
		texture: THREE.Texture;
		hovered: number | null;
		width: number;
		height: number;
		onenter: () => void;
		onleave: () => void;
		onclick?: () => void;
	}>();

	const basePos = $derived({
		x: index * 0.9,
		y: index * 0.8,
		z: index * -0.4
	});

	let mesh: THREE.Mesh | null = null;
	let material: THREE.MeshBasicMaterial | null = null;

	const { invalidate } = useThrelte();

	const colorNormal = new THREE.Color(0xffffff);
	const colorDimmed = new THREE.Color(0x888888);

	$effect(() => {
		if (!mesh || !material) return;

		const isHovered = hovered === index;
		const isDimmed = hovered !== null && hovered !== index;

		// smooth transitions via gsap
		const targetColor = isDimmed ? colorDimmed : colorNormal;
		const targetY = isHovered ? basePos.y + 0.04 : basePos.y;

		// depth isolation to prevent slicing
		mesh.renderOrder = isHovered ? 50 : index;
		material.depthTest = !isHovered;
		material.opacity = 1;

		// gsap for smooth easing
		gsap.to(material.color, {
			r: targetColor.r,
			g: targetColor.g,
			b: targetColor.b,
			duration: 0.4,
			ease: 'power2.out',
			overwrite: 'auto',
			onUpdate: invalidate
		});

		gsap.to(mesh.position, {
			y: targetY,
			duration: 0.4,
			ease: 'power2.out',
			overwrite: 'auto',
			onUpdate: invalidate
		});
	});
</script>

<T.Mesh
	position={[basePos.x, basePos.y, basePos.z]}
	oncreate={(ref: THREE.Mesh) => {
		mesh = ref;
	}}
	onpointerenter={(e: { stopPropagation: () => void }) => {
		e.stopPropagation();
		document.body.style.cursor = 'pointer';
		onenter();
	}}
	onpointerleave={() => {
		document.body.style.cursor = 'auto';
		onleave();
	}}
	onclick={(e: { stopPropagation: () => void }) => {
		e.stopPropagation();
		onclick?.();
	}}
>
	<T.PlaneGeometry args={[width, height]} />
	<T.MeshBasicMaterial
		transparent
		map={texture}
		oncreate={(ref: THREE.MeshBasicMaterial) => {
			material = ref;
		}}
	/>
</T.Mesh>
