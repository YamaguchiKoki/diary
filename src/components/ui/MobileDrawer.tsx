"use client";
import { CommandIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MenuContent } from "@/components/ui/MenuItem";

export function MobileDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" title="Toggle drawer">
          <CommandIcon size={16} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-4/5">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Mobile Menu</DrawerTitle>
          <DrawerDescription>Mobile Menu</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">
          <MenuContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
