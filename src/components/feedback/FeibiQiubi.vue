<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="80"
    height="80"
    aria-label="菲比丘比加载中"
    role="img"
  >
    <!-- 外部加载环：虚线旋转暗示加载中 -->
    <circle
      cx="50"
      cy="50"
      r="46"
      fill="none"
      stroke="#d4af37"
      stroke-width="2"
      stroke-dasharray="8 12"
      opacity="0.6"
    />

    <!-- 整体旋转层 -->
    <g class="phoebe-loader">
      <!-- 金色长发 / 后发轮廓（背景层） -->
      <ellipse cx="50" cy="56" rx="26" ry="22" fill="#e8c34a" />

      <!-- 大饼脸 -->
      <circle cx="50" cy="56" r="22" fill="#fce9d6" />

      <!-- 腮红 -->
      <circle cx="36" cy="60" r="4" fill="#f5b7b1" opacity="0.5" />
      <circle cx="64" cy="60" r="4" fill="#f5b7b1" opacity="0.5" />

      <!-- 眼睛 -->
      <circle cx="43" cy="53" r="1.8" fill="#5d4037" />
      <circle cx="57" cy="53" r="1.8" fill="#5d4037" />

      <!-- 嘴巴 -->
      <path
        d="M47 62 Q50 64 53 62"
        fill="none"
        stroke="#5d4037"
        stroke-width="1.2"
        stroke-linecap="round"
      />

      <!-- 标志性大礼帽（带轻微摇摆） -->
      <g class="hat-group">
        <!-- 帽檐 -->
        <rect
          x="28"
          y="28"
          width="44"
          height="6"
          rx="3"
          fill="#ffffff"
          stroke="#555"
          stroke-width="1"
        />
        <!-- 帽筒 -->
        <rect
          x="36"
          y="10"
          width="28"
          height="20"
          rx="2"
          fill="#ffffff"
          stroke="#555"
          stroke-width="1"
        />
        <!-- 帽带 -->
        <rect x="36" y="24" width="28" height="4" fill="#d4af37" opacity="0.8" />
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
// 纯展示组件，无需逻辑
</script>

<style scoped>
/* ===== 整体旋转动画 ===== */
@keyframes phoebe-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.phoebe-loader {
  transform-origin: 50px 50px;
  animation: phoebe-spin 1.8s linear infinite;
}

/* ===== 礼帽轻微摇摆 ===== */
@keyframes hat-wobble {
  0%,
  100% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(4deg);
  }
}

.hat-group {
  transform-origin: 50px 32px;
  animation: hat-wobble 1.2s ease-in-out infinite;
}

/* 尊重用户系统的“减少动态效果”偏好 */
@media (prefers-reduced-motion: reduce) {
  .phoebe-loader,
  .hat-group {
    animation: none;
  }
}
</style>