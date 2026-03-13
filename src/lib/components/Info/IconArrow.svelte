<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 12, class: className = '' }: Props = $props();
</script>

<svg
	data-testid="geist-icon"
	height={size}
	stroke-linejoin="miter"
	style="color: currentcolor;"
	viewBox="0 0 16 16"
	width={size}
	class={className}
>
	<path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M5.75001 2H5.00001V3.5H5.75001H11.4393L2.21968 12.7197L1.68935 13.25L2.75001 14.3107L3.28034 13.7803L12.4988 4.56182V11H13.9988V2H5.75001Z"
		fill="currentColor"
		stroke="currentColor"
		stroke-width="0.4"
	></path>
</svg>
