import { Particles } from "@/components/ui/particles";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      {/* Animated particles background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={300}
        ease={80}
        color="#8B5CF6"
        refresh={false}
      />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
