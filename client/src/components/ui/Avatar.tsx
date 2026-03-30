import * as AvatarPrimitive from "@radix-ui/react-avatar";

function Avatar({
  className = "",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={`relative flex size-8 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    />
  );
}

function AvatarImage({
  className = "",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={`aspect-square size-full ${className}`}
      {...props}
    />
  );
}

function AvatarFallback({
  className = "",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={`flex size-full items-center justify-center rounded-full bg-gray-100 dark:bg-[#1a1a1a] text-[11px] font-medium text-gray-600 dark:text-[#666] ${className}`}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
