<script setup lang="ts">
import face from '@/assets/phoebe.png'

withDefaults(
  defineProps<{
    /** 整体尺寸（正方形，px） */
    size?: number
    /** 静态模式：只显示画面，不播放动画（可用于「加载失败」等状态） */
    still?: boolean
  }>(),
  { size: 96, still: false },
)
</script>

<template>
  <div
    class="phoebe"
    :class="{ 'phoebe--still': still }"
    :style="{ '--phoebe-size': size + 'px' }"
    role="status"
    aria-label="加载中"
  >
    <!-- 底圈：常驻的完整圆环，避免「只有半圈」的残缺感 -->
    <span class="phoebe__track" />
    <!-- 进度弧：在底圈上转动 -->
    <span class="phoebe__ring" />

    <!-- 立牌：上下浮动 + 轻微摇摆 -->
    <span class="phoebe__card">
      <img class="phoebe__face" :src="face" alt="" draggable="false" />
    </span>
  </div>
</template>

<style scoped>
.phoebe {
  --phoebe-size: 96px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--phoebe-size);
  height: var(--phoebe-size);
  isolation: isolate;
}

/* ===== 常驻底圈 ===== */
.phoebe__track {
  position: absolute;
  inset: 0;
  z-index: 0;
  border: 2.5px solid rgba(148, 163, 184, 0.25);
  border-radius: 50%;
}

/* ===== 转动的进度弧 ===== */
.phoebe__ring {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg 140deg,
    #c7d2fe 240deg,
    #7dd3fc 335deg,
    transparent 360deg
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 3px),
    #000 calc(100% - 2.5px)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 3px),
    #000 calc(100% - 2.5px)
  );
  animation: phoebe-orbit 1.15s linear infinite;
}

/* ===== 人物立牌 ===== */
.phoebe__card {
  position: relative;
  display: block;
  width: 82%;
  height: 82%;
  overflow: hidden;
  background: #fff;
  border-radius: 26%;
  box-shadow:
    0 8px 18px -10px rgba(15, 23, 42, 0.45),
    0 0 0 1px rgba(15, 23, 42, 0.06);
  animation: phoebe-float 1.9s ease-in-out infinite;
  z-index: 1;
}

.phoebe__face {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  -webkit-user-drag: none;
  user-select: none;
}

@keyframes phoebe-orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes phoebe-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1.5deg);
  }
  50% {
    transform: translateY(-7%) rotate(1.5deg);
  }
}

/* 静态模式：不转、不浮，只保留一圈淡淡的底圈 */
.phoebe--still .phoebe__ring,
.phoebe--still .phoebe__card {
  animation: none;
}

.phoebe--still .phoebe__ring {
  opacity: 0;
}

/* 尊重系统的「减少动态效果」 */
@media (prefers-reduced-motion: reduce) {
  .phoebe__ring,
  .phoebe__card {
    animation: none;
  }

  .phoebe__ring {
    opacity: 0;
  }
}
</style>
