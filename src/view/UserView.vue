<template>
  <Avatar>
    <AvatarImage src="https://github.com/shadcn.png" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
  <Card class="">
    <CardHeader>
      <CardTitle>temp</CardTitle>
      <CardDescription>
        temp
      </CardDescription>
    </CardHeader>
    <CardContent>
      
    </CardContent>
    <CardFooter class="flex flex-col gap-2">
      
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,} from '@/components/ui/card'
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,} from '@/components/ui/avatar'
</script>