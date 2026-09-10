<!-- LoginLayout.vue -->
<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const btnAlert = ()=>{
  alert("button test")
}

const handleDialogAction = ()=>{
  alert("alert action test")
}
</script>

<template>
  <div>
    <Button @click="btnAlert">Button Test</Button>

    <AlertDialog>
      <AlertDialogTrigger as-child>
        <Button variant="outline">
          Show Dialog
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleDialogAction">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  </div>
</template>