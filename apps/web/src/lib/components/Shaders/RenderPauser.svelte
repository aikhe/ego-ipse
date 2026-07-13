<script lang="ts">
  import { useThrelte } from '@threlte/core';

  let { active }: { active: boolean } = $props();

  const { autoRender } = useThrelte();

  $effect(() => {
    autoRender.set(active);
  });
</script>
