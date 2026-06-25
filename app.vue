<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global storefront gate: maintenance mode + store notice modal -->
    <StoreGate />

    <!-- Award-grade custom cursor (fine-pointer devices only) -->
    <CursorFX />
  </div>
</template>
