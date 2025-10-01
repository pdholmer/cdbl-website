import { Button } from "@/components/ui/button";
import crowdSpirit from "@/assets/crowd-spirit.jpg";
import { ShoppingBag, Heart, TrendingUp } from "lucide-react";

const SpiritWearSection = () => {
  return (
    <section id="spirit-wear" className="hero-viewport relative overflow-hidden flex items-center"
             style={{ background: 'var(--gradient-primary)' }}>
      <div 
        className="absolute inset-0 opacity-15 bg-cover bg-center"
        style={{ backgroundImage: `url(${crowdSpirit})` }}
      />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <div className="inline-block mb-4 md:mb-6">
            <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            CDBL Spirit Wear
          </h2>
          <p className="text-lg md:text-xl mb-3 md:mb-4 opacity-95">
            Show your Rockets pride with official CDBL merchandise!
          </p>
          <p className="text-base md:text-lg mb-6 md:mb-8 opacity-90">
            <Heart className="inline w-4 h-4 md:w-5 md:h-5 mr-2" />
            10% of all proceeds go to support the league!
          </p>

          <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 md:p-8 mb-6 md:mb-8 border border-white/20">
            <div className="grid grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div>
                <div className="text-2xl md:text-3xl font-bold mb-1">64+</div>
                <div className="text-xs md:text-sm opacity-90">Products Available</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold mb-1">10%</div>
                <div className="text-xs md:text-sm opacity-90">Goes to CDBL</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold mb-1">100%</div>
                <div className="text-xs md:text-sm opacity-90">Rockets Pride</div>
              </div>
            </div>

            <p className="text-sm md:text-base mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto">
              Browse our complete collection of CDBL-branded apparel, accessories, and gear. From jerseys and hats to hoodies and bags, find everything you need to support your favorite team.
            </p>

            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
              onClick={() => window.open('https://strawberrycreekcreations.com/collections/cdbl_spiritwear', '_blank')}
            >
              <ShoppingBag className="mr-2" />
              Shop CDBL Spirit Wear
            </Button>
          </div>

          <p className="text-xs md:text-sm opacity-80">
            Official merchandise provided by Strawberry Creek Creations
          </p>
        </div>
      </div>
    </section>
  );
};

export default SpiritWearSection;
