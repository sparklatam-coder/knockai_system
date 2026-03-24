import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/landing/knock-logo.png" alt="노크 로고" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-heading font-bold text-xl">노크</span>
        </div>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" asChild>
          <a href="https://tally.so/r/q45d67" target="_blank" rel="noopener noreferrer">
            무료 상담
          </a>
        </Button>
      </nav>
    </header>
  );
};
