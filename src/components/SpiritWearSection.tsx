import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";

const SpiritWearSection = () => {
  return (
    <section
      id="spirit-wear"
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ background: 'var(--gradient-primary)' }}
    >
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-6" />

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            CDBL Spirit Wear
          </h2>

          <p className="text-lg md:text-xl mb-2 opacity-95">
            Show your Rockets pride with official CDBL merchandise.
          </p>
          <p className="text-base md:text-lg mb-10 opacity-90 inline-flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 md:w-5 md:h-5" />
            10% of all proceeds go to support the league.
          </p>

          <div className="text-xl md:text-2xl mb-10 font-medium">
            64+ products. <span className="opacity-90">10% of every order funds the league.</span>
          </div>

          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
            onClick={() => window.open('https://strawberrycreekcreations.com/collections/cdbl_spiritwear', '_blank')}
          >
            <ShoppingBag className="mr-2" />
            Shop CDBL Spirit Wear
          </Button>

          <p className="text-xs md:text-sm opacity-75 mt-10">
            Official merchandise provided by Strawberry Creek Creations
          </p>
        </div>
      </div>
    </section>
  );
};

export default SpiritWearSection;
